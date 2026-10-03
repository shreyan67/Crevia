"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, Truck, ShieldCheck, Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

const FLAVORS = [
  { id: "chocolate", label: "Belgian Chocolate", price: 0 },
  { id: "red-velvet", label: "Red Velvet", price: 50 },
  { id: "vanilla", label: "Classic Vanilla", price: 0 },
  { id: "butterscotch", label: "Butterscotch", price: 0 },
];

const SIZES = [
  { id: "0.5", label: "0.5 kg", price: 699 },
  { id: "1", label: "1 kg", price: 1299 },
  { id: "1.5", label: "1.5 kg", price: 1899 },
  { id: "2", label: "2 kg", price: 2399 },
];

export default function ProductPage() {
  const [selectedFlavor, setSelectedFlavor] = useState(FLAVORS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [message, setMessage] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  
  const { addItem } = useCartStore();

  const totalPrice = selectedSize.price + selectedFlavor.price;

  const handleAddToCart = () => {
    addItem({
      productId: "prod_1", // Placeholder until DB integration
      name: "Belgian Chocolate Truffle",
      price: totalPrice,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop",
      flavor: selectedFlavor.label,
      size: selectedSize.label,
      message: message,
    });
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-muted relative shadow-lg"
            >
              <img 
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1000&auto=format&fit=crop" 
                alt="Chocolate Truffle Cake" 
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity">
                   <img 
                    src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=200&auto=format&fit=crop" 
                    alt="Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info & Customization */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            <div className="flex justify-between items-start mb-2">
              <h1 className="font-serif text-4xl text-primary">Belgian Chocolate Truffle</h1>
              <button className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-colors">
                <Heart className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center text-accent">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">4.9 (128 reviews)</span>
            </div>

            <p className="text-3xl text-primary font-serif mb-6">₹{totalPrice}</p>
            
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Our signature masterpiece. Layers of moist, dark chocolate sponge enveloped in 
              rich, velvety Belgian chocolate ganache. Freshly baked for every order.
            </p>

            <div className="space-y-8 flex-1">
              {/* Flavor Selection */}
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">1. Select Flavor</h3>
                <div className="grid grid-cols-2 gap-3">
                  {FLAVORS.map((flavor) => (
                    <button
                      key={flavor.id}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        selectedFlavor.id === flavor.id 
                          ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                          : 'border-border text-foreground hover:border-primary/30'
                      }`}
                    >
                      {flavor.label} {flavor.price > 0 && <span className="text-muted-foreground text-xs">(+₹{flavor.price})</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">2. Select Weight</h3>
                <div className="flex flex-wrap gap-3">
                  {SIZES.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-6 rounded-full border text-sm font-medium transition-all ${
                        selectedSize.id === size.id 
                          ? 'border-primary bg-primary text-primary-foreground shadow-md' 
                          : 'border-border text-foreground hover:border-primary/50 hover:bg-muted'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">3. Cake Message</h3>
                <input 
                  type="text" 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Happy Birthday Ananya ❤️" 
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>

              {/* Delivery Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Date</h3>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Time Slot</h3>
                  <select 
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="" disabled>Select slot</option>
                    <option value="10-12">10:00 AM - 12:00 PM</option>
                    <option value="12-14">12:00 PM - 2:00 PM</option>
                    <option value="14-16">2:00 PM - 4:00 PM</option>
                    <option value="16-18">4:00 PM - 6:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-border">
              <Button 
                onClick={handleAddToCart}
                size="lg" 
                className="w-full rounded-full h-14 text-lg bg-primary hover:bg-primary/90 shadow-xl transition-all"
              >
                Add to Cart — ₹{totalPrice}
              </Button>
              
              <div className="flex justify-center gap-8 mt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4" /> Fresh Delivery
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Secure Payment
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
