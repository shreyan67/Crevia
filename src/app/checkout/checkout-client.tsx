"use client";

import { useCartStore } from "@/store/cart";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Wallet, Banknote, Calendar, Clock, User, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { createOrder, verifyPayment } from "@/app/actions/order";

export interface LoggedInUser {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  avatar?: string | null;
}

export default function CheckoutClient({ user }: { user: LoggedInUser }) {
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [minDate, setMinDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
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
      deliveryAddress:
        (formData.get("deliveryAddress") as string) +
        (formData.get("landmark") ? `, Near ${formData.get("landmark")}` : ""),
      deliveryPincode: formData.get("deliveryPincode"),
      deliveryDate: formData.get("deliveryDate"),
      deliverySlot: formData.get("deliverySlot"),
      paymentMethod: paymentMethod,
      totalAmount: totalPrice() + 50,
      items: items.map((i) => ({
        id: i.productId,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        variant: i.size || "Standard",
        message: i.message,
      })),
    };

    try {
      const response = await createOrder(orderData);

      if (paymentMethod === "COD") {
        clearCart();
        router.push(`/orders/${response.orderId}`);
        return;
      }

      // Test Mode Simulation
      if (response.razorpayOrderId && response.razorpayOrderId.startsWith("order_mock_")) {
        setTimeout(async () => {
          await verifyPayment(
            response.orderId,
            "pay_mock_" + Math.random().toString(36).substring(7),
            "mock_sig"
          );
          clearCart();
          router.push(`/orders/${response.orderId}`);
        }, 1200);
        return;
      }

      // Real Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mock123",
        amount: response.amount,
        currency: "INR",
        name: "Crévia Patisserie",
        description: "Artisanal Cake Order",
        order_id: response.razorpayOrderId || "",
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
            alert("Payment signature verification failed. Please contact bakery support.");
            setLoading(false);
          }
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: {
          color: "#b45309",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
      paymentObject.on("payment.failed", function (resp: any) {
        alert("Payment was unsuccessful: " + resp.error.description);
        setLoading(false);
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong while processing your order.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Your Bag is Empty</h2>
          <p className="text-muted-foreground mb-8">Add your favorite cakes before heading to checkout.</p>
          <Link href="/shop">
            <Button className="rounded-full px-8">Browse Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <Link
            href="/shop"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
          </Link>

          {/* Authenticated User Status Bar */}
          <div className="mb-8 p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{user.name}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Logged In
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{user.email || user.phone || "Active Customer"}</p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-primary" /> Secure Checkout
            </span>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePayment} className="space-y-10">
                {/* Contact Information */}
                <section>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Customer Details</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <input
                        name="customerName"
                        required
                        type="text"
                        defaultValue={user.name}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                        placeholder="Shreyan Acharjee"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Mobile Number</label>
                      <input
                        name="customerPhone"
                        required
                        type="tel"
                        defaultValue={user.phone || ""}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Email Address</label>
                      <input
                        name="customerEmail"
                        required
                        type="email"
                        defaultValue={user.email || ""}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                        placeholder="shreyan@example.com"
                      />
                    </div>
                  </div>
                </section>

                {/* Delivery Address & Schedule */}
                <section>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Delivery Address & Schedule</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-foreground">Street Address / Flat / Society</label>
                      <input
                        name="deliveryAddress"
                        required
                        type="text"
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                        placeholder="House No 42, Green Avenue, MG Road"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Pincode</label>
                      <input
                        name="deliveryPincode"
                        required
                        type="text"
                        maxLength={6}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                        placeholder="560001"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Landmark (Optional)</label>
                      <input
                        name="landmark"
                        type="text"
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                        placeholder="Near City Mall"
                      />
                    </div>

                    {/* Delivery Scheduling */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" /> Delivery Date
                      </label>
                      <input
                        name="deliveryDate"
                        required
                        type="date"
                        min={minDate}
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Fresh artisanal preparation: earliest 3 days ahead.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Preferred Slot
                      </label>
                      <select
                        name="deliverySlot"
                        required
                        defaultValue=""
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all text-sm appearance-none"
                      >
                        <option value="" disabled>Select a time slot</option>
                        <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (Morning)</option>
                        <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (Afternoon)</option>
                        <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (Tea time)</option>
                        <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (Evening)</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Payment Options */}
                <section>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    <label
                      className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-colors ${
                        paymentMethod === "UPI" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="UPI"
                        checked={paymentMethod === "UPI"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-primary"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Online Payment (UPI, Cards, Netbanking)</p>
                        <p className="text-xs text-muted-foreground">Instant verification via Razorpay</p>
                      </div>
                      <Wallet className="w-5 h-5 text-primary" />
                    </label>

                    <label
                      className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-colors ${
                        paymentMethod === "COD" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value="COD"
                        checked={paymentMethod === "COD"}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="accent-primary"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">Cash on Delivery</p>
                        <p className="text-xs text-muted-foreground">Pay with cash or UPI on delivery</p>
                      </div>
                      <Banknote className="w-5 h-5 text-primary" />
                    </label>
                  </div>
                </section>

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full rounded-full h-14 text-base font-semibold shadow-lg"
                >
                  {loading
                    ? "Securing Order..."
                    : paymentMethod === "COD"
                    ? `Place Order • ₹${totalPrice() + 50}`
                    : `Proceed to Payment • ₹${totalPrice() + 50}`}
                </Button>
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border/80 p-8 rounded-3xl sticky top-28 shadow-sm">
                <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-muted overflow-hidden flex-shrink-0 border border-border">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm text-foreground line-clamp-1">{item.name}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Qty: {item.quantity} {item.size && `• ${item.size}`}
                        </p>
                        <p className="text-sm font-semibold text-primary mt-1">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-border/80 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{totalPrice()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Chilled Delivery</span>
                    <span>₹50</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-3 border-t border-border/80 text-foreground">
                    <span>Total</span>
                    <span className="text-primary font-serif">₹{totalPrice() + 50}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
