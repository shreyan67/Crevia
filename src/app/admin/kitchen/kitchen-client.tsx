"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Clock, Calendar, ChefHat, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateOrderStatus } from "@/app/actions/order"; // I will create this action

export default function KitchenClient({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    try {
      await updateOrderStatus(id, newStatus);
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert("Failed to update status");
    }
    setLoadingId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-serif text-primary">Kitchen Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage baking queue and preparation</p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg font-medium flex items-center">
          <ChefHat className="w-5 h-5 mr-2" />
          {orders.length} Active Orders
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id} className={`border-l-4 ${order.status === "BAKING" ? "border-l-yellow-500" : "border-l-primary"}`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">Order #{order.id.slice(-6).toUpperCase()}</CardTitle>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                  order.status === "BAKING" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {order.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Customer: {order.customerName}</p>
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground bg-muted p-2 rounded-md">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="mr-4">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                <Clock className="w-4 h-4 mr-2" />
                <span>{order.deliverySlot}</span>
              </div>

              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Items to prepare:</p>
                <ul className="list-disc list-inside text-muted-foreground">
                  {/* Since we don't have items mapped yet, placeholder */}
                  <li>Custom Cake Order (Details from POS)</li>
                  <li>Amount: ₹{order.totalAmount}</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t flex gap-2">
              {order.status === "CONFIRMED" && (
                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleStatusChange(order.id, "BAKING")}
                  disabled={loadingId === order.id}
                >
                  <ChefHat className="w-4 h-4 mr-2" />
                  Start Baking
                </Button>
              )}
              {order.status === "BAKING" && (
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => handleStatusChange(order.id, "READY_FOR_DELIVERY")}
                  disabled={loadingId === order.id}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Ready
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
        {orders.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
            <ChefHat className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No orders in queue</h3>
            <p className="text-muted-foreground">The kitchen is clear for now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
