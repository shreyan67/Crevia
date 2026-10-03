"use client";

import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Wallet, Landmark, Banknote, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createOrder, verifyPayment } from "@/app/actions/order";

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [minDate, setMinDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const orderData = {
      customerName: formData.get("customerName"),
      customerPhone: formData.get("customerPhone"),
      customerEmail: formData.get("customerEmail"),
      deliveryAddress: formData.get("deliveryAddress") + (formData.get("landmark") ? `, Near ${formData.get("landmark")}` : ""),
      deliveryPincode: formData.get("deliveryPincode"),
      deliveryDate: formData.get("deliveryDate"),
      deliverySlot: formData.get("deliverySlot"),
      paymentMethod: paymentMethod,
      totalAmount: totalPrice() + 50,
    };

    try {
      const response = await createOrder(orderData);
      
      if (paymentMethod === "COD") {
        clearCart();
        router.push(`/orders/${response.orderId}`);
        return;
      }

      // If using Mock Mode because keys are missing
      if (response.razorpayOrderId.startsWith("order_mock_")) {
        alert("TEST MODE: Razorpay Keys not found in .env. Simulating successful payment...");
        setTimeout(async () => {
          await verifyPayment(response.orderId, "pay_mock_" + Math.random().toString(36).substring(7), "mock_sig");
          clearCart();
          router.push(`/orders/${response.orderId}`);
        }, 1500);
        return;
      }

      // Initialize Real Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock123", // Use public env for client
        amount: response.amount,
        currency: "INR",
        name: "Premium Bakery",
        description: "Cake Order",
        order_id: response.razorpayOrderId,
        handler: async function (res: any) {
          const verified = await verifyPayment(
            response.orderId,
            res.razorpay_payment_id,
            res.razorpay_signature
          );
          
          if (verified) {
            clearCart();
            router.push(`/orders/${response.orderId}`);
          } else {
            alert("Payment Verification Failed!");
            setLoading(false);
          }
        },
        prefill: {
          name: String(orderData.customerName),
          email: String(orderData.customerEmail),
          contact: String(orderData.customerPhone),
        },
        theme: {
          color: "#4f46e5",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        alert("Payment Failed! " + response.error.description);
        setLoading(false);
      });
      rzp.open();
      
    } catch (error) {
      console.error(error);
      alert("Failed to place order.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-serif text-4xl text-primary mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/shop">
          <Button size="lg" className="rounded-full">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/shop" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Link>

        <h1 className="font-serif text-4xl text-primary mb-12">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handlePayment} className="space-y-12">
              
              {/* Customer Info */}
              <section>
                <h2 className="font-serif text-2xl text-foreground mb-6">Contact Information</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <input name="customerName" required type="text" className="w-full bg-transparent border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all" placeholder="Ananya Sharma" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Mobile Number</label>
                    <input name="customerPhone" required type="tel" className="w-full bg-transparent border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all" placeholder="+91 98765 43210" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <input name="customerEmail" required type="email" className="w-full bg-transparent border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all" placeholder="ananya@example.com" />
                  </div>
                </div>
              </section>

              {/* Delivery Address & Schedule */}
              <section>
                <h2 className="font-serif text-2xl text-foreground mb-6">Delivery Details</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-foreground">Street Address / Society</label>
                    <input name="deliveryAddress" required type="text" className="w-full bg-transparent border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all" placeholder="House No, Building Name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Pincode</label>
                    <input name="deliveryPincode" required type="text" className="w-full bg-transparent border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all" placeholder="110001" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Landmark (Optional)</label>
                    <input name="landmark" type="text" className="w-full bg-transparent border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all" placeholder="Near Metro Station" />
                  </div>
                  
                  {/* Delivery Scheduling */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Delivery Date</label>
                    <input 
                      name="deliveryDate"
                      required 
                      type="date" 
                      min={minDate}
                      className="w-full bg-transparent border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">Earliest available: 3 days from today.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Preferred Slot</label>
                    <select name="deliverySlot" required defaultValue="" className="w-full bg-transparent border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all appearance-none">
                      <option value="" disabled>Select a time slot</option>
                      <option value="10-12">10:00 AM - 12:00 PM</option>
                      <option value="12-14">12:00 PM - 2:00 PM</option>
                      <option value="14-16">2:00 PM - 4:00 PM</option>
                      <option value="16-18">4:00 PM - 6:00 PM</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section>
                <h2 className="font-serif text-2xl text-foreground mb-6">Payment</h2>
                <div className="space-y-4">
                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'UPI' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Pay Online (UPI / Card / Netbanking)</p>
                      <p className="text-xs text-muted-foreground">Secure payment via Razorpay</p>
                    </div>
                    <Wallet className={`w-6 h-6 ${paymentMethod === 'UPI' ? 'text-primary' : 'text-muted-foreground'}`} />
                  </label>
                  
                  <label className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="accent-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
                    </div>
                    <Banknote className={`w-6 h-6 ${paymentMethod === 'COD' ? 'text-primary' : 'text-muted-foreground'}`} />
                  </label>
                </div>
              </section>

              <Button type="submit" disabled={loading} size="lg" className="w-full rounded-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-xl transition-all">
                {loading ? "Processing..." : paymentMethod === 'COD' ? `Place Order • ₹${totalPrice() + 50}` : `Pay ₹${totalPrice() + 50}`}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-muted p-8 rounded-3xl sticky top-28">
              <h3 className="font-serif text-2xl text-foreground mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg bg-background overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-medium text-primary mt-1">₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-border text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalPrice()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span>₹50</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-3 border-t border-border text-foreground">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice() + 50}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
