"use client";

import { useCartStore } from "@/store/cart";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCartStore();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-background flex flex-col h-full border-l border-border">
        <SheetHeader className="pb-6 border-b border-border">
          <SheetTitle className="font-serif text-2xl text-primary text-left">Your Cart</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
              <p>Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.flavor && <p className="text-xs text-muted-foreground mt-1">Flavor: {item.flavor}</p>}
                    {item.size && <p className="text-xs text-muted-foreground">Size: {item.size}</p>}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-3 bg-muted rounded-full px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1 text-foreground hover:text-primary"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-foreground hover:text-primary"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="font-medium text-primary">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="pt-6 border-t border-border mt-auto">
            <div className="flex justify-between mb-6 font-medium text-lg">
              <span>Subtotal</span>
              <span className="text-primary">₹{totalPrice()}</span>
            </div>
            <Link href="/checkout" onClick={() => setIsOpen(false)}>
              <Button className="w-full h-12 rounded-full text-base bg-primary hover:bg-primary/90">
                Checkout
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
