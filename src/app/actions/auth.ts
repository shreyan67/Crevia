"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { RequestOtpSchema, VerifyOtpSchema, type ActionResult } from "@/lib/validations";



export async function sendOtp(name: string, phone: string): Promise<ActionResult<{ pending: boolean; devOtp?: string }>> {
  // Validate request parameters with Zod
  const validation = RequestOtpSchema.safeParse({ name, phone });
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid name or phone number",
    };
  }

  try {
    // Generate 4-digit mock OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`\n\n==============================\nMOCK SMS: OTP for ${phone} is ${otp}\n==============================\n\n`);

    // Store pending auth data in a temporary cookie (valid for 5 mins)
    const cookieStore = await cookies();
    cookieStore.set("pending_auth", JSON.stringify({ name: validation.data.name, phone: validation.data.phone, otp }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60,
      path: "/",
    });

    return { success: true, data: { pending: true, devOtp: process.env.NODE_ENV !== "production" ? otp : undefined } };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Failed to send OTP." };
  }
}

export async function verifyOtp(enteredOtp: string): Promise<ActionResult<{ userId: string }>> {
  // Validate OTP format with Zod
  const validation = VerifyOtpSchema.safeParse({ enteredOtp });
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Invalid OTP format",
    };
  }

  try {
    const cookieStore = await cookies();
    const pendingAuthStr = cookieStore.get("pending_auth")?.value;

    if (!pendingAuthStr) {
      return { success: false, message: "OTP expired or invalid." };
    }

    const { name, phone, otp } = JSON.parse(pendingAuthStr);

    if (validation.data.enteredOtp !== otp) {
      return { success: false, message: "Incorrect OTP." };
    }

    // OTP matched! Create or find user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { name, phone },
      });
    }

    // Set real auth session (valid 30 days)
    cookieStore.set("auth_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    // Clear pending auth
    cookieStore.delete("pending_auth");

    return { success: true, data: { userId: user.id } };
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
    where: { id: userId },
  });

  return user;
}

export async function loginWithGoogle(profile: {
  email: string;
  name: string;
  avatar?: string;
}): Promise<ActionResult<{ userId: string }>> {
  try {
    const email = profile.email.toLowerCase().trim();
    let user = await prisma.user.findFirst({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: profile.name,
          email,
          avatar: profile.avatar,
          role: "CUSTOMER",
        },
      });
    } else if (profile.avatar && !user.avatar) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatar: profile.avatar },
      });
    }

    const cookieStore = await cookies();
    cookieStore.set("auth_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    revalidatePath("/");
    revalidatePath("/my-orders");
    return { success: true, data: { userId: user.id } };
  } catch (error) {
    console.error("[loginWithGoogle] Error:", error);
    return { success: false, message: "Google authentication failed" };
  }
}
