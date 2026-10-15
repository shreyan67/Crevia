"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";
import crypto from "crypto";
import { CreateOrderSchema } from "@/lib/validations";
import { getCache, setCache, invalidateDashboardCache, CACHE_KEYS } from "@/lib/redis";



const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock123",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_secret",
});

export interface PaginatedOrdersResult {
  orders: any[];
  pagination: {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface DashboardSummary {
  todaysRevenue: number;
  pendingBakingCount: number;
  readyOrdersCount: number;
  totalOrdersCount: number;
  recentOrders: any[];
  fromCache?: boolean;
}

/**
 * Creates an order with strict Zod validation, PIN generation, and Redis cache invalidation.
 */
export async function createOrder(rawData: any) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("auth_session")?.value || null;

  // Validate input via Zod
  const validation = CreateOrderSchema.safeParse(rawData);
  if (!validation.success) {
    const errorMsg = validation.error.issues.map((i) => i.message).join(", ");
    throw new Error(`Invalid order data: ${errorMsg}`);
  }

  const data = validation.data;
  const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    const order = await prisma.order.create({
      data: {
        userId: userId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        deliveryAddress: data.deliveryAddress,
        deliveryPincode: data.deliveryPincode,
        totalAmount: data.totalAmount,
        deliveryDate: new Date(data.deliveryDate),
        deliverySlot: data.deliverySlot,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === "COD" ? "COD_PENDING" : "PAYMENT_PENDING",
        deliveryPin: deliveryPin,
        status: "CONFIRMED",
      },
    });

    let razorpayOrderId = null;

    if (data.paymentMethod !== "COD") {
      try {
        if (!process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === "rzp_test_mock123") {
          // Mock mode
          razorpayOrderId = "order_mock_" + Math.random().toString(36).substring(7);
        } else {
          const rzpOrder = await razorpay.orders.create({
            amount: Math.round(data.totalAmount * 100),
            currency: "INR",
            receipt: order.id,
          });
          razorpayOrderId = rzpOrder.id;
        }

        await prisma.order.update({
          where: { id: order.id },
          data: { razorpayOrderId: razorpayOrderId },
        });
      } catch (err) {
        console.error("Razorpay order creation failed. Ensure keys are in .env", err);
        throw new Error("Razorpay API Key missing or invalid. Please check .env file.");
      }
    }

    // Explicitly invalidate Redis dashboard cache
    await invalidateDashboardCache();

    revalidatePath("/admin");
    revalidatePath("/admin/delivery");
    revalidatePath("/my-orders");

    return {
      orderId: order.id,
      razorpayOrderId: razorpayOrderId,
      amount: Math.round(data.totalAmount * 100),
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
      data: { paymentStatus: "PAID", paymentId: paymentId },
    });
    await invalidateDashboardCache();
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/admin");
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
      },
    });
    await invalidateDashboardCache();
    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/admin");
    return true;
  }

  return false;
}

export async function getOrder(id: string) {
  return await prisma.order.findUnique({
    where: { id },
  });
}

export async function getActiveOrders() {
  return await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Retrieves dashboard summary with Redis caching.
 * Explicitly invalidated when orders are created, updated, or cancelled.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  // Check Redis cache first
  const cached = await getCache<DashboardSummary>(CACHE_KEYS.ADMIN_DASHBOARD_SUMMARY);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  // Database computation fallback
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });

  const todaysRevenue = orders
    .filter((o) => o.paymentStatus === "PAID" || o.paymentMethod === "COD")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === "CONFIRMED" || o.status === "BAKING");
  const readyOrders = orders.filter((o) => o.status === "READY_FOR_DELIVERY");
  const recentOrders = orders.slice(0, 5);

  const summary: DashboardSummary = {
    todaysRevenue,
    pendingBakingCount: pendingOrders.length,
    readyOrdersCount: readyOrders.length,
    totalOrdersCount: orders.length,
    recentOrders,
    fromCache: false,
  };

  // Cache in Redis for 10 minutes (with explicit invalidation on any write)
  await setCache(CACHE_KEYS.ADMIN_DASHBOARD_SUMMARY, summary, 600);

  return summary;
}

/**
 * Paginated order query helper with offset & limit support
 */
export async function getPaginatedOrders(params: {
  page?: number;
  limit?: number;
  userId?: string;
  status?: string;
}): Promise<PaginatedOrdersResult> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 10));
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (params.userId) whereClause.userId = params.userId;
  if (params.status) whereClause.status = params.status;

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return {
    orders,
    pagination: {
      currentPage: page,
      limit,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

export async function markAsDelivered(id: string, pin: string) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.deliveryPin !== pin) {
    return { success: false, message: "Invalid PIN" };
  }

  await prisma.order.update({
    where: { id },
    data: { status: "DELIVERED" },
  });

  await invalidateDashboardCache();
  revalidatePath("/admin");
  revalidatePath("/admin/delivery");
  revalidatePath(`/orders/${id}`);

  return { success: true };
}

export async function updateOrderStatus(id: string, status: string) {
  await prisma.order.update({
    where: { id },
    data: { status },
  });

  await invalidateDashboardCache();
  revalidatePath("/admin");
  revalidatePath("/admin/delivery");
  revalidatePath("/admin/kitchen");
  revalidatePath(`/orders/${id}`);

  return { success: true };
}

export async function cancelOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id } });

  const oneDayInMs = 24 * 60 * 60 * 1000;
  if (!order || Date.now() - order.createdAt.getTime() > oneDayInMs) {
    return { success: false, message: "Order cannot be cancelled after 24 hours" };
  }

  await prisma.order.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await invalidateDashboardCache();
  revalidatePath("/admin");
  revalidatePath("/admin/delivery");
  revalidatePath("/admin/kitchen");
  revalidatePath(`/orders/${id}`);

  return { success: true };
}
