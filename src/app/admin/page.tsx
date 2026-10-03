import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, TrendingUp, ShoppingBag, Banknote } from "lucide-react";
import { getActiveOrders } from "@/app/actions/order";

export default async function AdminDashboard() {
  const orders = await getActiveOrders();
  
  // Calculate dynamic stats
  const todaysRevenue = orders
    .filter(o => o.paymentStatus === "PAID" || o.paymentMethod === "COD")
    .reduce((sum, o) => sum + o.totalAmount, 0);
    
  const pendingOrders = orders.filter(o => o.status === "CONFIRMED" || o.status === "BAKING");
  const readyOrders = orders.filter(o => o.status === "READY_FOR_DELIVERY");
  const recentOrders = orders.slice(0, 5); // top 5

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, team! Here's what's happening at Crévia today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <Banknote className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todaysRevenue}</div>
            <p className="text-xs text-primary flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" /> All time
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Baking</CardTitle>
            <ShoppingBag className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Needs to be baked</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready for Delivery</CardTitle>
            <ChefHat className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyOrders.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting dispatch</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground mb-4">Recent Orders</h2>
        <div className="bg-background rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Payment</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{order.customerPhone}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] mt-0.5">{order.deliveryAddress}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{order.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        order.status === 'BAKING' ? 'bg-amber-100 text-amber-700' :
                        order.status === 'READY_FOR_DELIVERY' ? 'bg-green-100 text-green-700' :
                        order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">₹{order.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
