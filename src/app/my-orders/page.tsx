import { getUser } from "@/app/actions/auth";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Clock, CheckCircle2, ChevronRight, XCircle } from "lucide-react";

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

export default async function MyOrdersPage() {
  const user = await getUser();
  
  if (!user) {
    redirect("/login?callbackUrl=/my-orders");
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Your Orders</h1>
            <p className="text-muted-foreground mt-1">Track and manage your recent purchases</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-card border border-border shadow-sm rounded-3xl p-12 text-center">
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-6">Looks like you haven't placed any orders yet.</p>
            <Link href="/shop" className="inline-flex bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isCancelled = order.status === "CANCELLED";
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="block">
                  <div className="bg-card border border-border hover:border-primary/50 shadow-sm rounded-2xl p-6 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-sm text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</span>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                            isCancelled ? 'bg-red-100 text-red-700' :
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {isCancelled ? <XCircle className="w-3 h-3" /> : order.status === 'DELIVERED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {order.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          Scheduled for: {new Date(order.deliveryDate).toLocaleDateString()} ({order.deliverySlot})
                        </p>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full border-t md:border-t-0 border-border/50 pt-4 md:pt-0 mt-2 md:mt-0">
                        <div className="text-left md:text-right">
                          <p className="font-bold text-lg text-primary">₹{order.totalAmount}</p>
                          <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>

                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
}
