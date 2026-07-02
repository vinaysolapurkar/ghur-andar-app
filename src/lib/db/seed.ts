import { db } from "./index";
import { customers, orders, stockLedger } from "./schema";
import { eq } from "drizzle-orm";
import { PRICE_PER_RING } from "../constants";

interface SeedOrderInput {
  name: string;
  phone: string;
  address: string;
  rings: number;
  tracking?: string;
  status: string;
}

const WHATSAPP_ORDERS: SeedOrderInput[] = [
  { name: "Swati Nikam", phone: "7769804007", address: "B104, The onyx, pink city road, Wakad, Pune, near gold gym 411057", rings: 1, tracking: "P1000242660", status: "shipped" },
  { name: "Ajit Tilekar", phone: "9552985123", address: "iStepUp EduTech Academy, Opp Baramati Bus Stand, Anand Gold Coin Building, Samarth Nagar, Baramati, Pin 413102", rings: 1, tracking: "P1000242661", status: "shipped" },
  { name: "Saiel Vernekar", phone: "8459628056", address: "House no. 165/c-2, Opp godhneshwar temple, Dangui Colony, Alto duler mapusa goa 403507", rings: 1, tracking: "P1000242662", status: "shipped" },
  { name: "Ashutosh Sutar", phone: "9762283187", address: "Plot no 1 Near VSPN GYM Ganga Nagar Old Haripur Road Miraj-416410", rings: 1, tracking: "P1000242663", status: "shipped" },
  { name: "Monish Rana", phone: "9892590707", address: "C/o Mr R N Rana, C-1102, Darshanam Club Life, Ahead of Narayan Gardens, Gotri, Vadodara 390016", rings: 1, tracking: "P1000242664", status: "shipped" },
  { name: "Mayuresh Joshi", phone: "8983020114", address: "A103, Prudentia Towers, Datta Mandir Road, Wakad, Pune - 411056", rings: 1, tracking: "P1000242666", status: "shipped" },
  { name: "Avinash Mahale", phone: "9970859562", address: "A-904 Fortune Perfect, Near Somji Bus Stop, Kondhwa, Pune, 411048", rings: 1, tracking: "P1000242667", status: "shipped" },
  { name: "Pallavi Sanap", phone: "9421171968", address: "Vatsalya hospital, tirthroop building, Prabhat colony, Mahad. 402301", rings: 1, tracking: "P1000242668", status: "shipped" },
  { name: "Aditya Jagtap", phone: "9535660077", address: "B404 Regulus society Balewadi Dasara Chowk Pune 411045", rings: 1, tracking: "P1000242669", status: "shipped" },
  { name: "Shrikant Pujari", phone: "9822043536", address: "B 10, Kanchanjyoti Co Op Hsg Soc, Near SBI colony, Shivtirth Nagar, Pune 411038", rings: 1, tracking: "P1000242670", status: "shipped" },
  { name: "RAJAT BANSAL", phone: "9604320250", address: "Dr. Sudha Bansal Clinic, 115/2, Kailash Vihar, Nai Basti, MG Road, Tundla (Firozabad), UP - 283204", rings: 1, tracking: "P1000242671", status: "shipped" },
  { name: "Pratik Shastrakar", phone: "8380095276", address: "Konark Campus, Viman Nagar Pune 411014", rings: 1, tracking: "P1000242672", status: "shipped" },
  { name: "Sharmili", phone: "9833027144", address: "B4, 201, Swarajya CHS, Sector 10, Airoli, Navi Mumbai 400708", rings: 1, tracking: "P1000242673", status: "shipped" },
  { name: "Sonali", phone: "9823685669", address: "A 301 mystique moods new airport Vimannagar pune 411014", rings: 1, tracking: "P1000242674", status: "shipped" },
  { name: "Saurabh Datar", phone: "7738339389", address: "Samsung India Electronic Pvt Ltd, C&FA TCI Supply Chain Solutions, Arham Logiparc Phase II, Taluka Bhiwandi, District Thane, Maharashtra 421302", rings: 1, tracking: "P1000242675", status: "shipped" },
  { name: "Atish Patil", phone: "8652213894", address: "Om mauli society, sector 14, room no. 304, plot no. 74/75 Koparkhairane Navi Mumbai 400709", rings: 1, status: "confirmed" },
  { name: "Vinay Shigwan", phone: "9545754716", address: "Opposite bhagwat hospital Anandvan Mahalaxmi road Jalgaon Dapoli Maharashtra 415712", rings: 1, status: "confirmed" },
  { name: "Vipin Pawar", phone: "7208545892", address: "B2/203, SCN, Saraf Chaudhary Nagar, Thakur Complex, Kandivali East, Mumbai, Maharashtra 400101", rings: 1, status: "new" },
  { name: "Anshuman Gujar", phone: "9158450646", address: "Ganesh gopal gaushala, mangul, chopda, dist Jalgaon 425107", rings: 1, status: "new" },
  { name: "Umesh Bhadane", phone: "9967463486", address: "Flat no 703, c wing, Saisha society, next to GK ROSE mention, Malwadi, Punawale 411033", rings: 1, status: "new" },
  { name: "Deepak Zope", phone: "9819164818", address: "1001, building no 21, Rosalyn Regency anantam Area, Dawdi, Dombivali East- 421203", rings: 1, status: "new" },
  { name: "Sagar Pawar", phone: "9890330048", address: "Flat No - A 1106 Legacy Millennia Society, Gaikwad Nagar, Near Canara Bank, Punawale, Pune 411033", rings: 1, status: "new" },
  { name: "Mugdha Potbhare", phone: "9922434790", address: "D11 403, Sunder Sahawas phase 2 near Suncity soc, Suncity road, Pune 411051", rings: 1, status: "new" },
];

function extractPincode(address: string): string {
  const match = address.match(/\b(\d{6})\b/);
  return match ? match[1] : "";
}

function extractCity(address: string): string {
  const beforePin = address.replace(/\b\d{6}\b.*$/, "").trim();
  if (!beforePin) return "";

  const parts = beforePin
    .split(/[,\n]/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 0) return "";

  for (let i = parts.length - 1; i >= 0; i--) {
    const part = parts[i];
    if (/^(flat|plot|room|door|house|block|building|wing|floor|no\.?|f\.?no\.?|\d+)/i.test(part)) {
      continue;
    }
    if (part.length > 2) return part;
  }

  return parts[parts.length - 1];
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return "+91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  return digits.length >= 10 ? digits : raw.trim();
}

function nowIso(): string {
  return new Date().toISOString().replace("T", " ").substring(0, 19);
}

export async function seedDatabase(): Promise<{ message: string; counts: Record<string, number> }> {
  // --- 1. Seed initial stock ---
  const existingStock = await db.select().from(stockLedger).limit(1);
  let currentStock = 100;

  if (existingStock.length === 0) {
    await db.insert(stockLedger).values({
      change: 100,
      reason: "Initial stock",
      balanceAfter: 100,
      orderId: null,
    });
  } else {
    // Get current balance from the last ledger entry
    const lastEntry = await db
      .select()
      .from(stockLedger)
      .orderBy(stockLedger.id)
      .limit(1000);
    if (lastEntry.length > 0) {
      currentStock = lastEntry[lastEntry.length - 1].balanceAfter;
    }
  }

  // --- 2. Build customer map by normalized phone ---
  const customerMap = new Map<string, number>(); // phone → customer id

  // Check existing customers
  const existingCustomers = await db.select().from(customers);
  for (const c of existingCustomers) {
    customerMap.set(c.phone, c.id);
  }

  // Group orders by phone to compute aggregates
  const phoneGroups = new Map<string, SeedOrderInput[]>();
  for (const order of WHATSAPP_ORDERS) {
    const phone = normalizePhone(order.phone);
    const group = phoneGroups.get(phone) ?? [];
    group.push({ ...order, phone });
    phoneGroups.set(phone, group);
  }

  let customersCreated = 0;
  let ordersCreated = 0;

  const seedTime = nowIso();

  // --- 3. Create customers ---
  for (const [phone, group] of phoneGroups) {
    if (customerMap.has(phone)) continue; // already exists

    const firstOrder = group[0];
    const totalRings = group.reduce((sum, o) => sum + o.rings, 0);
    const city = extractCity(firstOrder.address);
    const pincode = extractPincode(firstOrder.address);

    const inserted = await db
      .insert(customers)
      .values({
        name: firstOrder.name,
        phone,
        address: firstOrder.address,
        city: city || null,
        pincode: pincode || null,
        totalOrders: group.length,
        totalRings,
        firstOrderAt: seedTime,
        lastOrderAt: seedTime,
      })
      .returning({ id: customers.id });

    if (inserted.length > 0) {
      customerMap.set(phone, inserted[0].id);
      customersCreated++;
    }
  }

  // --- 4. Create orders ---
  const existingOrders = await db.select({ phone: orders.phone }).from(orders);
  const existingPhones = new Set(existingOrders.map((o) => o.phone));

  for (const order of WHATSAPP_ORDERS) {
    const phone = normalizePhone(order.phone);
    const customerId = customerMap.get(phone);

    // Skip if an order with this phone already exists (simple dedup)
    if (existingPhones.has(phone)) continue;

    const totalAmount = order.rings * PRICE_PER_RING;
    const pincode = extractPincode(order.address);
    const city = extractCity(order.address);

    const shippedAt = order.status === "shipped" || order.status === "delivered" ? seedTime : null;
    const deliveredAt = order.status === "delivered" ? seedTime : null;

    await db.insert(orders).values({
      customerId: customerId ?? null,
      name: order.name,
      phone,
      address: order.address,
      city: city || null,
      pincode: pincode || null,
      rings: order.rings,
      pricePerRing: PRICE_PER_RING,
      totalAmount,
      status: order.status,
      trackingNumber: order.tracking ?? null,
      returnTracking: null,
      rawMessage: null,
      notes: null,
      createdBy: "seed",
      shippedAt,
      deliveredAt,
    });

    existingPhones.add(phone);
    ordersCreated++;

    // Deduct shipped/confirmed orders from stock
    if (order.status === "shipped" || order.status === "confirmed") {
      currentStock -= order.rings;
      await db.insert(stockLedger).values({
        change: -order.rings,
        reason: `Seeded order: ${order.name} (${order.status})`,
        balanceAfter: currentStock,
        orderId: null,
      });
    }
  }

  return {
    message: "Seed complete",
    counts: {
      customersCreated,
      ordersCreated,
      stockBalance: currentStock,
    },
  };
}
