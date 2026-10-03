"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { name: "Cupcakes", image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?q=80&w=800&auto=format&fit=crop" },
  { name: "Whole Cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop" },
  { name: "Cookies", image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?q=80&w=800&auto=format&fit=crop" },
  { name: "Tres Leches", image: "https://images.unsplash.com/photo-1557142046-c704a3adf364?q=80&w=800&auto=format&fit=crop" },
  { name: "Brownies", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=800&auto=format&fit=crop" },
  { name: "Cheesecakes", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=800&auto=format&fit=crop" },
  { name: "Beverages", image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop" },
  { name: "Chocolates", image: "https://images.unsplash.com/photo-1540331547168-8b63109225b7?q=80&w=800&auto=format&fit=crop" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col gap-6"
          >
            <span className="text-accent uppercase tracking-[0.2em] text-sm font-semibold">
              Patisserie & Bakery
            </span>
            <h1 className="font-serif text-5xl md:text-7xl leading-tight text-primary">
              Happiness, freshly made.
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-md leading-relaxed">
              Beautifully baked. Artfully frosted. Handcrafted cakes, pastries, and artisanal desserts for every celebration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/shop">
                <Button size="lg" className="rounded-full text-base px-8 h-14 bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl group w-full sm:w-auto">
                  Order Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/shop?category=whole-cakes">
                <Button size="lg" variant="outline" className="rounded-full text-base px-8 h-14 border-primary text-primary hover:bg-primary/5 transition-all w-full sm:w-auto">
                  Explore Cakes
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="relative"
          >
            {/* Elegant Hero Image container */}
            <div className="relative aspect-[4/5] md:aspect-square rounded-[2rem] overflow-hidden shadow-2xl bg-muted">
              {/* Note: I'm using an unsplash source here as a placeholder for the beautiful cake image */}
              <img 
                src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=2000&auto=format&fit=crop" 
                alt="Beautiful multilayer chocolate cake" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>
            
            {/* Floating Badge */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute -bottom-6 -left-6 bg-background p-4 rounded-2xl shadow-xl flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 text-accent fill-accent" />
              </div>
              <div>
                <p className="font-bold text-foreground">4.9/5</p>
                <p className="text-xs text-muted-foreground">Loved by thousands</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-between items-end mb-12"
          >
            <div>
              <h2 className="font-serif text-3xl md:text-5xl text-primary mb-4">Our Menu</h2>
              <p className="text-muted-foreground">Carefully crafted. Beautifully finished.</p>
            </div>
            <Link href="/shop">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">View All</Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {CATEGORIES.map((category, i) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <Link href={`/shop?category=${category.name.toLowerCase().replace(' ', '-')}`}>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-4 relative">
                    <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/10 transition-colors z-10" />
                    <img 
                      src={category.image}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt={category.name}
                    />
                  </div>
                  <h3 className="font-serif text-xl text-center text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
