"use server";

import { createSession, clearSession } from "@/lib/auth";

export async function login(prevState, formData) {
  const password = String(formData.get("password") || "");

  if (!password) return { success: false, errors: { password: "Password is required" } };

  if (password !== process.env.LANDLORD_PASSWORD) {
    return { success: false, errors: { password: "Incorrect password" } };
  }

  await createSession();
  return { success: true };
}

export async function logout() {
  clearSession();
  return { success: true };
}
