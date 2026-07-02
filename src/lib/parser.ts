export interface ParsedOrder {
  name: string;
  phone: string;
  address: string;
  rings: number;
  pincode: string;
  city: string;
  confidence: "high" | "medium" | "low";
  rawMessage: string;
}

// Strip emoji characters from a string
function stripEmojis(text: string): string {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}|\u{FE00}-\u{FE0F}|\u{1F1E0}-\u{1F1FF}|\u{200D}|\u{FEFF}]/gu,
      ""
    )
    .trim();
}

// Normalize phone number: strip spaces/dashes, add +91 if 10-digit Indian number
function normalizePhone(raw: string): string {
  // Remove all non-digit characters except leading +
  const stripped = raw.replace(/[^\d+]/g, "");

  // Already has country code
  if (stripped.startsWith("+")) {
    return stripped;
  }

  // Remove leading 0
  const digits = stripped.replace(/^0+/, "");

  if (digits.length === 10) {
    return "+91" + digits;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return "+" + digits;
  }

  // Return as-is with + prefix if looks like full number, else just the digits
  return digits.length >= 10 ? digits : raw.trim();
}

// Extract 6-digit Indian pincode from address string
function extractPincode(address: string): string {
  const match = address.match(/\b(\d{6})\b/);
  return match ? match[1] : "";
}

// Try to extract city from address — heuristic: word(s) just before the pincode
function extractCity(address: string): string {
  // Try "City PINCODE" pattern
  const beforePin = address.replace(/\b\d{6}\b.*$/, "").trim();
  if (!beforePin) return "";

  // Split on common separators and take the last meaningful segment
  const parts = beforePin
    .split(/[,\n]/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return "";

  // Walk backwards to find first non-trivial part (not just flat/plot numbers)
  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    // Skip parts that look like flat/block identifiers
    if (/^(flat|plot|room|door|house|block|building|wing|floor|no\.?|f\.?no\.?|\d+)/i.test(part)) {
      continue;
    }
    if (part.length > 2) return part;
  }

  return parts[parts.length - 1];
}

// Parse a single structured order chunk (Format A / B)
function parseStructuredChunk(chunk: string, raw: string): ParsedOrder | null {
  const clean = stripEmojis(chunk);

  const nameMatch = clean.match(/name\s*:\s*(.+)/i);
  const phoneMatch = clean.match(/phone\s*:\s*(.+)/i);
  const addressMatch = clean.match(/address\s*:\s*([\s\S]+?)(?=\n(?:rings?|city|pincode|please|note|$)|\n\s*\n|$)/i);
  const ringsMatch = clean.match(/rings?\s*:\s*(\d+)/i);

  const name = nameMatch ? nameMatch[1].trim() : "";
  const phone = phoneMatch ? normalizePhone(phoneMatch[1].trim()) : "";
  const address = addressMatch
    ? addressMatch[1]
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .join(", ")
    : "";
  const rings = ringsMatch ? parseInt(ringsMatch[1], 10) : 1;

  // Count how many key fields we got
  const fieldCount = [name, phone, address].filter(Boolean).length;
  if (fieldCount === 0) return null;

  const pincode = extractPincode(address);
  const city = extractCity(address);

  let confidence: "high" | "medium" | "low";
  if (name && phone && address) {
    confidence = "high";
  } else if (fieldCount >= 2) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  return { name, phone, address, rings, pincode, city, confidence, rawMessage: raw.trim() };
}

// Parse an unstructured order chunk (Format C)
function parseUnstructuredChunk(chunk: string, raw: string): ParsedOrder {
  const clean = stripEmojis(chunk).trim();
  const lines = clean
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let name = "";
  let phone = "";

  // Look for phone number pattern anywhere in text
  const phoneMatch = clean.match(/(\+?91[-\s]?)?\b[6-9]\d{9}\b/);
  if (phoneMatch) {
    phone = normalizePhone(phoneMatch[0]);
  }

  // Name heuristic: first sequence of words before any digit/special char on first line
  if (lines.length > 0) {
    const firstLine = lines[0];
    const nameMatch = firstLine.match(/^([A-Za-z][A-Za-z\s.'-]{1,40}?)(?=\s+\d|\s*[,/]|$)/);
    if (nameMatch) {
      name = nameMatch[1].trim();
    } else {
      // Take words from first line until we hit a digit
      const words = firstLine.split(/\s+/);
      const nameWords: string[] = [];
      for (const w of words) {
        if (/\d/.test(w)) break;
        nameWords.push(w);
      }
      name = nameWords.join(" ").trim();
    }
  }

  // Address = full text (it's all we have in unstructured)
  const address = clean.replace(/\n/g, ", ");
  const pincode = extractPincode(address);
  const city = extractCity(address);

  const fieldCount = [name, phone, address].filter(Boolean).length;
  let confidence: "high" | "medium" | "low";
  if (name && phone && address) {
    confidence = "medium"; // unstructured max is medium
  } else if (fieldCount >= 2) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  return { name, phone, address, rings: 1, pincode, city, confidence, rawMessage: raw.trim() };
}

// Split text into individual order chunks
function splitIntoChunks(text: string): string[] {
  // Split on common order header patterns (with or without emojis)
  const splitPattern =
    /(?:^|\n)(?:[\u{1F4E6}\u{1F6D2}\u{2705}\u{1F4CB}]?\s*)?New\s+Ghur[\.\u00B7]?Andar\s+Order\s*[\u{1F4E6}\u{1F6D2}]?/giu;

  const parts = text.split(splitPattern).filter((p) => p.trim().length > 0);

  if (parts.length > 1) {
    return parts;
  }

  // If no split header found, treat entire text as one order
  return [text];
}

export function parseWhatsAppMessages(text: string): ParsedOrder[] {
  if (!text || !text.trim()) return [];

  const chunks = splitIntoChunks(text);
  const results: ParsedOrder[] = [];

  for (const chunk of chunks) {
    const raw = chunk.trim();
    if (!raw) continue;

    // Detect if structured (has Name:/Phone:/Address: labels)
    const isStructured = /(?:name|phone|address)\s*:/i.test(raw);

    if (isStructured) {
      const parsed = parseStructuredChunk(raw, raw);
      if (parsed) {
        results.push(parsed);
      }
    } else {
      results.push(parseUnstructuredChunk(raw, raw));
    }
  }

  return results;
}
