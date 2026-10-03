"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

export async function login(name: string, phone: string) {
  try {
    let user = await prisma.user.findUnique({
      where: { phone }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { name, phone }
      });
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Login failed." };
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
