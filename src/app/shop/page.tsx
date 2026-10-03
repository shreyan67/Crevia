"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";

const MENU_ITEMS = [
  { id: "c1", name: "Strawberry & Vanilla", category: "Cupcakes", price: 149, image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=800&auto=format&fit=crop" },
  { id: "c2", name: "Chocolate Truffle", category: "Cupcakes", price: 159, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop" },
  { id: "w1", name: "Salted Caramel & Coffee", category: "Whole Cakes", price: 1299, image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?q=80&w=800&auto=format&fit=crop" },
  { id: "w2", name: "Dark Chocolate & Raspberry", category: "Whole Cakes", price: 1499, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop" },
  { id: "k1", name: "Biscoff Stuffed", category: "Cookies", price: 199, image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop" },
  { id: "t1", name: "Mango Tres Leches", category: "Tres Leches", price: 349, image: "https://images.unsplash.com/photo-1557142046-c704a3adf364?q=80&w=800&auto=format&fit=crop" },
  { id: "b1", name: "Classic Fudge", category: "Brownies", price: 199, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop" },
  { id: "ch1", name: "Blueberry Cheesecake", category: "Cheesecakes", price: 299, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop" },
];

export default function ShopPage() {
  const { addItem } = useCartStore();

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="font-serif text-5xl text-primary mb-4">Our Menu</h1>
          <p className="text-muted-foreground text-lg">Handcrafted with passion. Shared with love.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {MENU_ITEMS.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group flex flex-col"
            >
              <Link href={`/product/${item.id}`} className="block aspect-[4/5] rounded-2xl overflow-hidden bg-muted mb-4 relative">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </Link>
              <div className="flex flex-col flex-1">
                <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{item.category}</span>
                <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors">
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">{item.name}</h3>
                </Link>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="text-primary font-medium text-lg">₹{item.price}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.preventDefault();
                      addItem({
                        productId: item.id,
                        name: item.name,
                        price: item.price,
                        quantity: 1,
                        image: item.image,
                      });
                    }}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" /> Add
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
