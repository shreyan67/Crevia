"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, Sparkles, Filter } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { getProducts, getCategories, type ProductWithDetails } from "@/app/actions/product";

export default function ShopPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const { addItem } = useCartStore();

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cats, prods] = await Promise.all([
          getCategories(),
          getProducts(),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch (e) {
        console.error("Failed to load shop catalog:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = products.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" || item.category?.name?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Artisanal Patisserie
          </div>
          <h1 className="font-serif text-4xl md:text-6xl text-foreground font-bold tracking-tight">
            Signature Menu
          </h1>
          <p className="text-muted-foreground text-lg mt-2 max-w-2xl">
            Baked fresh every morning using European butter, single-origin cacao, and hand-selected seasonal ingredients.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-border/60">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {["All", ...categories.map((c) => c.name)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cakes, flavors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/40 border border-border rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="animate-pulse flex flex-col space-y-4">
                <div className="aspect-[4/5] bg-muted rounded-2xl" />
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-10 bg-muted rounded w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 border border-dashed border-border rounded-3xl">
            <h3 className="font-serif text-2xl font-bold text-foreground mb-2">No delicacies found</h3>
            <p className="text-muted-foreground mb-6">Try clearing your search query or picking a different category.</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
              }}
              className="rounded-full"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {filteredProducts.map((item, i) => (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col bg-card border border-border/80 hover:border-primary/40 rounded-3xl p-4 transition-all hover:shadow-md"
                >
                  <Link
                    href={`/product/${item.id}`}
                    className="block aspect-[4/5] rounded-2xl overflow-hidden bg-muted mb-4 relative"
                  >
                    <img
                      src={item.images}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-background/80 backdrop-blur-md text-foreground">
                      {item.category?.name || "Pastry"}
                    </span>
                  </Link>

                  <div className="flex flex-col flex-1">
                    <Link href={`/product/${item.id}`} className="hover:text-primary transition-colors">
                      <h3 className="font-serif text-lg font-semibold text-foreground mb-1 line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-muted-foreground text-xs line-clamp-2 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-auto flex items-center justify-between pt-2 border-t border-border/40">
                      <div>
                        <span className="text-[10px] uppercase text-muted-foreground tracking-wider block">Starts at</span>
                        <span className="text-primary font-bold text-lg font-serif">₹{item.basePrice}</span>
                      </div>

                      <Button
                        size="sm"
                        variant="default"
                        className="rounded-full px-4 h-9 shadow-sm"
                        onClick={(e) => {
                          e.preventDefault();
                          addItem({
                            productId: item.id,
                            name: item.name,
                            price: item.basePrice,
                            quantity: 1,
                            image: item.images,
                            size: "Standard",
                            flavor: "Classic",
                          });
                        }}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 mr-1.5" /> Add
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
