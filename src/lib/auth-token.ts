import crypto from "crypto";

export const COOKIE_NAME = "ghur_session";

function sign(payload: string): string {
  const secret = process.env.COOKIE_SECRET || "fallback-secret-change-me";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function verifyToken(token: string): { role: string; exp: number } | null {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;

    const expectedSig = sign(encoded);
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"));

    if (!payload.role || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;

    return payload as { role: string; exp: number };
  } catch {
    return null;
  }
}
