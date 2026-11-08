import fs from "fs";
import path from "path";

export interface WaitlistEntry {
  id: string;
  ref?: string;
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  quantity: number;
  status: "pending" | "notified" | "converted" | "cancelled" | string;
  created_at: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const WAITLIST_FILE = path.join(DATA_DIR, "waitlist.json");

function ensureDirectoryAndFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(WAITLIST_FILE)) {
      fs.writeFileSync(WAITLIST_FILE, JSON.stringify([], null, 2), "utf8");
    }
  } catch (err) {
    console.error("Failed to ensure waitlist storage:", err);
  }
}

export function getWaitlistEntries(): WaitlistEntry[] {
  ensureDirectoryAndFile();
  try {
    const raw = fs.readFileSync(WAITLIST_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return [];
  } catch (err) {
    console.error("Error reading waitlist.json:", err);
    return [];
  }
}

export function saveWaitlistEntries(entries: WaitlistEntry[]) {
  ensureDirectoryAndFile();
  try {
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(entries, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing waitlist.json:", err);
  }
}

export function addWaitlistEntry(data: {
  product_id: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  quantity?: number;
  status?: string;
  ref?: string;
}): WaitlistEntry {
  const entries = getWaitlistEntries();
  const id = `wl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const ref = data.ref || `WL-${Math.floor(10000 + Math.random() * 90000)}`;

  const newEntry: WaitlistEntry = {
    id,
    ref,
    product_id: data.product_id,
    product_name: data.product_name,
    customer_name: data.customer_name,
    customer_phone: data.customer_phone,
    customer_email: data.customer_email || "",
    quantity: Number(data.quantity) || 1,
    status: data.status || "pending",
    created_at: new Date().toISOString(),
  };

  entries.unshift(newEntry);
  saveWaitlistEntries(entries);
  return newEntry;
}

export function updateWaitlistStatus(id: string, status: string): WaitlistEntry | null {
  const entries = getWaitlistEntries();
  const index = entries.findIndex((e) => e.id === id || e.ref === id);
  if (index === -1) return null;

  entries[index].status = status;
  saveWaitlistEntries(entries);
  return entries[index];
}

export function deleteWaitlistEntry(id: string): boolean {
  const entries = getWaitlistEntries();
  const filtered = entries.filter((e) => e.id !== id && e.ref !== id);
  if (filtered.length === entries.length) return false;

  saveWaitlistEntries(filtered);
  return true;
}

