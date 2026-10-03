"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20 flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <CheckCircle2 className="w-24 h-24 text-primary mb-8" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">Order Confirmed!</h1>
        <p className="text-muted-foreground text-lg mb-2">Thank you for choosing Crévia.</p>
        <p className="text-muted-foreground mb-8">Your order #CRV{Math.floor(Math.random() * 10000)} is being freshly prepared.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/shop">
            <Button size="lg" className="rounded-full h-14 px-8 bg-primary hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/">
            <Button size="lg" variant="outline" className="rounded-full h-14 px-8 border-primary text-primary hover:bg-primary/5">
              Back to Home <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
