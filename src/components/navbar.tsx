"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { Badge } from "@/components/ui/badge";
import { CartSidebar } from "./cart-sidebar";
import { User as UserIcon } from "lucide-react";
import { logout } from "@/app/actions/auth";

export function Navbar({ user }: { user?: any }) {
  const { totalItems, setIsOpen } = useCartStore();

  return (
    <>
      <nav className="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="font-serif text-3xl tracking-tight text-primary font-bold">
            Crévia
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium text-foreground">
            <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
            <Link href="/shop?category=cakes" className="hover:text-primary transition-colors">Cakes</Link>
            <Link href="/about" className="hover:text-primary transition-colors">Our Story</Link>
            {user && (
              <Link href="/my-orders" className="hover:text-primary transition-colors text-primary font-semibold">Your Orders</Link>
            )}
          </div>
          <div className="flex items-center gap-4 text-foreground">
            {user ? (
              <button onClick={() => logout()} className="text-xs font-medium text-muted-foreground hover:text-red-500 transition-colors hidden sm:block">Logout</button>
            ) : (
              <Link href="/login" className="flex items-center gap-2 hover:text-primary transition-colors text-sm font-medium">
                <UserIcon className="w-4 h-4" /> <span className="hidden sm:inline">Login</span>
              </Link>
            )}
            <button 
              onClick={() => setIsOpen(true)}
              className="relative p-2 hover:text-primary transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems() > 0 && (
                <Badge className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px]">
                  {totalItems()}
                </Badge>
              )}
            </button>
          </div>
        </div>
      </nav>
      <CartSidebar />
    </>
  );
}
