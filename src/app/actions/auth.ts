"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

export async function sendOtp(name: string, phone: string) {
  try {
    // Generate 4-digit mock OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`\n\n==============================\nMOCK SMS: OTP for ${phone} is ${otp}\n==============================\n\n`);

    // Store pending auth data in a temporary cookie (valid for 5 mins)
    const cookieStore = await cookies();
    cookieStore.set("pending_auth", JSON.stringify({ name, phone, otp }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60, 
      path: "/",
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to send OTP." };
  }
}

export async function verifyOtp(enteredOtp: string) {
  try {
    const cookieStore = await cookies();
    const pendingAuthStr = cookieStore.get("pending_auth")?.value;
    
    if (!pendingAuthStr) {
      return { success: false, message: "OTP expired or invalid." };
    }

    const { name, phone, otp } = JSON.parse(pendingAuthStr);

    if (enteredOtp !== otp) {
      return { success: false, message: "Incorrect OTP." };
    }

    // OTP matched! Create or find user
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { name, phone }
      });
    }

    // Set real auth session
    cookieStore.set("auth_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    
    // Clear pending
    cookieStore.delete("pending_auth");

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Verification failed." };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_session");
  revalidatePath("/");
}

export async function getUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_session")?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  return user;
}
