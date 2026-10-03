import { getActiveOrders } from "@/app/actions/order";
import { DeliveryClient } from "./delivery-client";

export const dynamic = "force-dynamic";

export default async function DeliveryView() {
  const orders = await getActiveOrders();
  
  // Only show orders that are not delivered yet (or delivered recently, depending on rules)
  // For now, let's pass all orders to the client, or maybe just non-delivered ones.
  const activeDeliveries = orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED");

  return <DeliveryClient initialDeliveries={activeDeliveries} />;
}
