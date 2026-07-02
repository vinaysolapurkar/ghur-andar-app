"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { verifyToken, COOKIE_NAME } from "../auth-token";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

function sign(payload: string): string {
  const secret = process.env.COOKIE_SECRET || "fallback-secret-change-me";
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

function createToken(role: string): string {
  const exp = Date.now() + COOKIE_MAX_AGE * 1000;
  const payload = JSON.stringify({ role, exp });
  const encoded = Buffer.from(payload).toString("base64");
  const sig = sign(encoded);
  return `${encoded}.${sig}`;
}

export async function login(
  pin: string,
  role: "admin" | "dtd"
): Promise<{ success: boolean; error?: string }> {
  const adminPin = process.env.ADMIN_PIN;
  const dtdPin = process.env.DTD_PIN;

  if (!adminPin || !dtdPin) {
    return { success: false, error: "Server configuration error" };
  }

  let valid = false;
  if (role === "admin" && pin === adminPin) {
    valid = true;
  } else if (role === "dtd" && pin === dtdPin) {
    valid = true;
  }

  if (!valid) {
    return { success: false, error: "Invalid PIN" };
  }

  const token = createToken(role);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });

  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/login");
}

export async function getSession(): Promise<{ role: string } | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);

  if (!cookie?.value) return null;

  const payload = verifyToken(cookie.value);
  if (!payload) return null;

  return { role: payload.role };
}

