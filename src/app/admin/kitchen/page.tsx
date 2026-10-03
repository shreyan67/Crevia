import { getActiveOrders } from "@/app/actions/order";
import KitchenClient from "./kitchen-client";

export default async function KitchenPage() {
  const orders = await getActiveOrders();
  // The kitchen needs to see orders that are CONFIRMED (need baking)
  const kitchenOrders = orders.filter(o => o.status === "CONFIRMED" || o.status === "BAKING");
  
  return <KitchenClient initialOrders={kitchenOrders} />;
}
