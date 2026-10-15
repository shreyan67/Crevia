"use client";

import { useEffect, useState, use } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, Truck, ShieldCheck, Heart, ArrowLeft, Cake, Sparkles, Check } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart";
import { getProductById, type ProductWithDetails } from "@/app/actions/product";

const DEFAULT_FLAVORS = [
  { id: "classic", label: "Classic Signature", price: 0 },
  { id: "dark-chocolate", label: "70% Belgian Dark Truffle", price: 100 },
  { id: "salted-caramel", label: "Gourmet Salted Caramel", price: 80 },
  { id: "red-velvet", label: "Velvet Cream Cheese", price: 120 },
];

const DEFAULT_WEIGHTS = [
  { id: "0.5", label: "0.5 kg (Serves 3-4)", multiplier: 0.65 },
  { id: "1.0", label: "1.0 kg (Serves 6-8)", multiplier: 1.0 },
  { id: "1.5", label: "1.5 kg (Serves 10-12)", multiplier: 1.45 },
  { id: "2.0", label: "2.0 kg (Serves 14-16)", multiplier: 1.85 },
];

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const productId = resolvedParams.slug;

  const [product, setProduct] = useState<ProductWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeight, setSelectedWeight] = useState(DEFAULT_WEIGHTS[1]); // Default 1.0 kg
  const [selectedFlavor, setSelectedFlavor] = useState(DEFAULT_FLAVORS[0]);
  const [message, setMessage] = useState("");
  const [isEggless, setIsEggless] = useState(false);
  const [added, setAdded] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (err) {
        console.error("Failed to load product details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [productId]);

  const basePrice = product?.basePrice || 1299;
  const calculatedPrice = Math.round(
    basePrice * selectedWeight.multiplier + selectedFlavor.price + (isEggless ? 50 : 0)
  );

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: calculatedPrice,
      quantity: 1,
      image: product.images,
      flavor: selectedFlavor.label,
      size: selectedWeight.label.split(" ")[0],
      message: message.trim() || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">Pastry Not Found</h2>
          <p className="text-muted-foreground mb-8">The cake you are looking for may have sold out or been updated.</p>
          <Link href="/shop">
            <Button className="rounded-full">Return to Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <Link
          href="/shop"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
        </Link>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Cake Image Display */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-muted relative shadow-lg border border-border"
            >
              <img
                src={product.images}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-background/85 backdrop-blur-md text-foreground shadow-sm">
                {product.category?.name || "Signature"}
              </span>
            </motion.div>

            {/* Quality Badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-center">
                <Truck className="w-5 h-5 mx-auto text-primary mb-1" />
                <span className="text-[11px] text-muted-foreground block font-medium">Chilled Express</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-center">
                <ShieldCheck className="w-5 h-5 mx-auto text-primary mb-1" />
                <span className="text-[11px] text-muted-foreground block font-medium">100% Handcrafted</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-center">
                <Sparkles className="w-5 h-5 mx-auto text-primary mb-1" />
                <span className="text-[11px] text-muted-foreground block font-medium">Pure Ingredients</span>
              </div>
            </div>
          </div>

          {/* Product Details & Customization Options */}
          <div className="flex flex-col">
            <div className="mb-6 border-b border-border/60 pb-6">
              <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground mb-3">
                {product.name}
              </h1>
              <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                {product.description}
              </p>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-serif text-3xl font-bold text-primary">
                  ₹{calculatedPrice}
                </span>
                <span className="text-xs text-muted-foreground">Taxes included • Free delivery above ₹999</span>
              </div>
            </div>

            {/* Customization Form */}
            <div className="space-y-6 flex-1">
              {/* Size / Weight Selector */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center justify-between">
                  <span>Weight / Size</span>
                  <span className="text-xs text-primary font-normal">{selectedWeight.label}</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {DEFAULT_WEIGHTS.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setSelectedWeight(w)}
                      className={`p-3 rounded-2xl text-left border text-xs transition-all ${
                        selectedWeight.id === w.id
                          ? "border-primary bg-primary/10 text-foreground font-semibold shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Flavor Selector */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Flavor Selection
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {DEFAULT_FLAVORS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFlavor(f)}
                      className={`p-3 rounded-2xl text-left border text-xs transition-all ${
                        selectedFlavor.id === f.id
                          ? "border-primary bg-primary/10 text-foreground font-semibold shadow-sm"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{f.label}</span>
                        {f.price > 0 && <span className="text-[10px] text-primary">+₹{f.price}</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Eggless Option Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </span>
                  <div>
                    <span className="text-xs font-semibold text-foreground block">100% Eggless Preparation</span>
                    <span className="text-[11px] text-muted-foreground block">Fresh yogurt & condensed milk substitute (+₹50)</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isEggless}
                  onChange={(e) => setIsEggless(e.target.checked)}
                  className="w-4 h-4 accent-primary rounded cursor-pointer"
                />
              </div>

              {/* Cake Inscription Message */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-sm font-semibold text-foreground">
                    Custom Message on Cake (Optional)
                  </label>
                  <span className="text-[11px] text-muted-foreground">{message.length}/50 chars</span>
                </div>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="e.g. Happy 21st Birthday Shreyan!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Add to Cart Button */}
              <div className="pt-4">
                <Button
                  onClick={handleAddToCart}
                  className="w-full h-12 text-base rounded-full shadow-md gap-2"
                >
                  {added ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-300" /> Added to Order!
                    </>
                  ) : (
                    <>Add to Bag • ₹{calculatedPrice}</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
