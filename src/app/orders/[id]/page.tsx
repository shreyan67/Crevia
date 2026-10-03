import { getOrder } from "@/app/actions/order";
import { CheckCircle2, Clock, MapPin, Map as MapIcon, KeyRound, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const order = await getOrder(resolvedParams.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>
        
        <div className="bg-card border border-border shadow-sm rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-border/50">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Order Tracking</p>
              <h1 className="font-serif text-3xl font-bold text-foreground">#{order.id.slice(-8).toUpperCase()}</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {order.status === 'DELIVERED' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {order.status}
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Delivery Address
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{order.deliveryAddress}<br/>{order.deliveryPincode}</p>
                <p className="text-foreground text-sm mt-2 font-medium">{order.customerName} • {order.customerPhone}</p>
              </div>

              <div>
                <h3 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" /> Scheduled For
                </h3>
                <p className="text-muted-foreground text-sm">
                  {new Date(order.deliveryDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <p className="text-foreground text-sm mt-1 font-medium">{order.deliverySlot}</p>
              </div>
            </div>

            <div className="space-y-8">
              {/* Security PIN Box */}
              {order.status !== 'DELIVERED' && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
                  <h3 className="text-sm font-bold text-primary flex items-center justify-center gap-2 mb-2">
                    <KeyRound className="w-4 h-4" /> Delivery PIN
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">Share this PIN with the baker upon delivery</p>
                  <div className="text-4xl font-mono font-bold tracking-[0.25em] text-foreground">
                    {order.deliveryPin}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium text-foreground mb-3">Payment</h3>
                <div className="flex justify-between items-center bg-muted rounded-xl p-4">
                  <div>
                    <p className="text-sm font-medium">{order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.paymentStatus}</p>
                  </div>
                  <span className="font-bold text-lg text-primary">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fake Map UI */}
        <div className="w-full h-48 bg-muted rounded-3xl overflow-hidden relative border border-border flex items-center justify-center flex-col gap-2">
          <MapIcon className="w-8 h-8 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground font-medium">Live tracking will appear here on delivery day</p>
        </div>

      </div>
    </div>
  );
}
