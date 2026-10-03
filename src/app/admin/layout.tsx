import Link from "next/link";
import { ChefHat, Truck, LayoutDashboard, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-background border-r border-border flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-border">
          <Link href="/" className="font-serif text-2xl font-bold text-primary">Crévia Admin</Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/kitchen" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <ChefHat className="w-5 h-5" /> Kitchen View
          </Link>
          <Link href="/admin/delivery" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <Truck className="w-5 h-5" /> Delivery View
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
