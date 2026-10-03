"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { MapPin, Phone, CheckCircle2, ShieldCheck, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markAsDelivered } from "@/app/actions/order";

export function DeliveryClient({ initialDeliveries }: { initialDeliveries: any[] }) {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [activePinOrder, setActivePinOrder] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (orderId: string) => {
    setVerifying(true);
    const result = await markAsDelivered(orderId, pinInput);
    
    if (result.success) {
      setDeliveries(prev => prev.map(d => d.id === orderId ? { ...d, status: "DELIVERED" } : d));
      setActivePinOrder(null);
      setPinInput("");
    } else {
      alert(result.message || "Incorrect PIN.");
    }
    setVerifying(false);
  };

  if (deliveries.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <CheckCircle2 className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">No active deliveries</h2>
        <p className="text-muted-foreground">All caught up! Time to bake some more.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full h-full overflow-y-auto pb-24">
      <div className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Delivery Queue</h1>
        <p className="text-muted-foreground mt-1">Orders out for delivery. Drive safely!</p>
      </div>

      <div className="space-y-6">
        {deliveries.map((delivery) => (
          <Card key={delivery.id} className={`rounded-2xl shadow-md border-2 transition-all ${delivery.status === 'DELIVERED' ? 'border-green-500/50 bg-green-50/50 opacity-60' : 'border-border'}`}>
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-foreground">
                  Order #{delivery.id.slice(-8).toUpperCase()}
                </CardTitle>
                <p className="text-sm font-medium text-muted-foreground mt-1">{delivery.customerName}</p>
              </div>
              
              {/* Payment Badge */}
              {delivery.paymentMethod === 'COD' ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 font-bold text-sm">
                  <Banknote className="w-4 h-4" />
                  COD: ₹{delivery.totalAmount}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-800 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  PREPAID
                </div>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-xl space-y-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground leading-tight">{delivery.deliveryAddress}</p>
                    <p className="text-xs text-muted-foreground mt-1">{delivery.deliveryPincode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <a href={`tel:${delivery.customerPhone}`} className="text-sm font-medium text-primary hover:underline">{delivery.customerPhone}</a>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-2 border-t border-border/50 mt-4 flex-col gap-3">
              {delivery.status === "DELIVERED" ? (
                <div className="flex items-center justify-center w-full py-2 text-green-600 font-bold gap-2">
                  <CheckCircle2 className="w-5 h-5" /> Successfully Delivered
                </div>
              ) : activePinOrder === delivery.id ? (
                <div className="w-full flex flex-col gap-3 animate-in fade-in zoom-in-95">
                  <p className="text-sm font-medium text-center">Ask customer for 4-digit PIN</p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      maxLength={4}
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="flex-1 bg-muted border border-border rounded-xl text-center text-xl tracking-[0.5em] font-bold py-3 focus:outline-none focus:border-primary"
                      placeholder="••••"
                    />
                    <Button 
                      onClick={() => handleVerify(delivery.id)}
                      disabled={verifying || pinInput.length !== 4}
                      className="h-auto rounded-xl px-6 bg-primary"
                    >
                      {verifying ? "..." : "Verify"}
                    </Button>
                  </div>
                  <Button variant="ghost" onClick={() => setActivePinOrder(null)} className="text-muted-foreground">Cancel</Button>
                </div>
              ) : (
                <div className="w-full flex gap-3">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => window.open(`https://maps.google.com/?q=${delivery.deliveryAddress} ${delivery.deliveryPincode}`)}>
                    <MapPin className="w-4 h-4 mr-2" /> Navigate
                  </Button>
                  <Button className="flex-1 rounded-xl bg-primary" onClick={() => setActivePinOrder(delivery.id)}>
                    Mark Delivered
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
