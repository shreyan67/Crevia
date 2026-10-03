"use server";

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";
import crypto from "crypto";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock123",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

export async function createOrder(data: any) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_session")?.value || null;

  // Generate 4 digit PIN
  const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
  
  try {
    const order = await prisma.order.create({
      data: {
        userId: userId,
        customerName: String(data.customerName),
        customerPhone: String(data.customerPhone),
        customerEmail: String(data.customerEmail),
        deliveryAddress: String(data.deliveryAddress),
        deliveryPincode: String(data.deliveryPincode),
        totalAmount: Number(data.totalAmount),
        deliveryDate: new Date(String(data.deliveryDate)),
        deliverySlot: String(data.deliverySlot),
        paymentMethod: String(data.paymentMethod),
        paymentStatus: data.paymentMethod === "COD" ? "COD_PENDING" : "PAYMENT_PENDING", 
        deliveryPin: deliveryPin,
        status: "CONFIRMED",
      }
    });

    let razorpayOrderId = null;
    
    if (data.paymentMethod !== "COD") {
      // Create Razorpay Order
      try {
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "rzp_test_mock123") {
          // Mock mode
          razorpayOrderId = "order_mock_" + Math.random().toString(36).substring(7);
        } else {
          const rzpOrder = await razorpay.orders.create({
            amount: Number(data.totalAmount) * 100, // Amount in paise
            currency: "INR",
            receipt: order.id,
          });
          razorpayOrderId = rzpOrder.id;
        }
        
        await prisma.order.update({
          where: { id: order.id },
          data: { razorpayOrderId: razorpayOrderId }
        });
      } catch (err) {
        console.error("Razorpay order creation failed. Ensure keys are in .env", err);
        throw new Error("Razorpay API Key missing or invalid. Please check .env file.");
      }
    }

    revalidatePath('/admin');
    revalidatePath('/admin/delivery');
    
    return {
      orderId: order.id,
      razorpayOrderId: razorpayOrderId,
      amount: Number(data.totalAmount) * 100,
    };
  } catch (error) {
    console.error("Order creation error:", error);
    throw error;
  }
}

export async function verifyPayment(orderId: string, paymentId: string, signature: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || !order.razorpayOrderId) return false;

  // Mock mode bypass
  if (order.razorpayOrderId.startsWith("order_mock_")) {
    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus: "PAID", paymentId: paymentId }
    });
    revalidatePath(`/orders/${orderId}`);
    return true;
  }

  const text = order.razorpayOrderId + "|" + paymentId;
  const secret = process.env.RAZORPAY_KEY_SECRET || "mock_secret";
  
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(text)
    .digest("hex");

  if (expectedSignature === signature) {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paymentId: paymentId,
      }
    });
    revalidatePath(`/orders/${orderId}`);
    return true;
  }
  
  return false;
}

export async function getOrder(id: string) {
  return await prisma.order.findUnique({
    where: { id }
  });
}

export async function getActiveOrders() {
  return await prisma.order.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function markAsDelivered(id: string, pin: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.deliveryPin !== pin) {
    return { success: false, message: "Invalid PIN" };
  }
  
  await prisma.order.update({
    where: { id },
    data: { status: "DELIVERED" }
  });

  revalidatePath('/admin');
  revalidatePath('/admin/delivery');
  revalidatePath(`/orders/${id}`);
  
  return { success: true };
}

export async function updateOrderStatus(id: string, status: string) {
  await prisma.order.update({
    where: { id },
    data: { status }
  });
  
  revalidatePath('/admin');
  revalidatePath('/admin/delivery');
  revalidatePath('/admin/kitchen');
  revalidatePath(`/orders/${id}`);
  
  return { success: true };
}
export async function cancelOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  
  // Can only cancel within 1 day (86400000 ms)
  const oneDayInMs = 24 * 60 * 60 * 1000;
  if (!order || (Date.now() - order.createdAt.getTime() > oneDayInMs)) {
    return { success: false, message: "Order cannot be cancelled after 24 hours" };
  }

  await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" }
  });
  
  revalidatePath('/admin');
  revalidatePath('/admin/delivery');
  revalidatePath('/admin/kitchen');
  revalidatePath(`/orders/${id}`);
  
  return { success: true };
}
