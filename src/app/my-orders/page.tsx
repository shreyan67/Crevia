import { getUser } from "@/app/actions/auth";
import { getPaginatedOrders } from "@/app/actions/order";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  ChevronRight,
  XCircle,
  ChevronLeft,
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Package,
  Calendar,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function MyOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const user = await getUser();

  if (!user) {
    redirect("/login?callbackUrl=/my-orders");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10) || 1);

  const { orders, pagination } = await getPaginatedOrders({
    userId: user.id,
    page: currentPage,
    limit: 5,
  });

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <Link
          href="/"
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6 text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        {/* Customer Identity & Saved Details Card */}
        <div className="bg-card border border-border shadow-sm rounded-3xl p-6 sm:p-8 mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl overflow-hidden border border-primary/20 flex-shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Logged In
                  </span>
                  <span className="text-xs text-muted-foreground">Customer ID: #{user.id.slice(-6).toUpperCase()}</span>
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground">{user.name}</h1>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-muted-foreground">
                  {user.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-primary" /> {user.email}
                    </span>
                  )}
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-primary" /> {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Saved Delivery Address Box */}
            <div className="bg-background/80 border border-border/80 rounded-2xl p-4 md:max-w-xs w-full">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-2">
                <MapPin className="w-3.5 h-3.5" /> Saved Delivery Address
              </div>
              {user.address ? (
                <div className="text-xs text-foreground space-y-1">
                  <p className="font-medium line-clamp-2">{user.address}</p>
                  {user.pincode && (
                    <p className="text-muted-foreground font-mono">Pincode: {user.pincode}</p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No default address saved yet. Enter your address at checkout and it will be stored here.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Orders Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Your Order History</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only confirmed and paid orders appear here.
            </p>
          </div>
          {pagination.totalCount > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
              {pagination.totalCount} {pagination.totalCount === 1 ? "order" : "orders"}
            </span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="bg-card border border-border shadow-sm rounded-3xl p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">No confirmed orders yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Any orders you complete and pay for will be listed here with live preparation and delivery tracking.
            </p>
            <Link
              href="/shop"
              className="inline-flex bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
            >
              Explore Cake Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isCancelled = order.status === "CANCELLED";
              const isDelivered = order.status === "DELIVERED";
              const isPaid = order.paymentStatus === "PAID";
              const isCod = order.paymentMethod === "COD";

              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="block">
                  <div className="bg-card border border-border hover:border-primary/50 shadow-sm rounded-2xl p-6 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        {/* Order ID & Status Badges */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-sm font-semibold text-foreground">
                            #{order.id.slice(-8).toUpperCase()}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                              isCancelled
                                ? "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300"
                                : isDelivered
                                ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
                                : order.status === "CONFIRMED"
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                            }`}
                          >
                            {isCancelled ? (
                              <XCircle className="w-3 h-3" />
                            ) : isDelivered ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            {order.status.replace(/_/g, " ")}
                          </span>

                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                            {isPaid ? "✓ Paid Online" : isCod ? "Cash on Delivery" : order.paymentStatus}
                          </span>
                        </div>

                        {/* Delivery Address & Customer Details */}
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p className="flex items-center gap-1.5 text-foreground font-medium">
                            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span>
                              {order.customerName} • {order.deliveryAddress} ({order.deliveryPincode})
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                            <span>
                              Scheduled for {new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              • {order.deliverySlot}
                            </span>
                          </p>
                        </div>

                        {/* Handover PIN Display for Active Orders */}
                        {!isDelivered && !isCancelled && order.deliveryPin && (
                          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 px-3 py-1 rounded-xl text-xs text-primary font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>
                              Handover PIN: <strong className="font-mono text-sm tracking-widest">{order.deliveryPin}</strong>
                            </span>
                          </div>
                        )}

                        {/* Items Preview */}
                        {order.items && order.items.length > 0 && (
                          <div className="text-xs text-muted-foreground pt-1">
                            <span className="font-medium text-foreground">Items: </span>
                            {order.items.map((it: any) => `${it.product?.name || "Cake"} (x${it.quantity})`).join(", ")}
                          </div>
                        )}
                      </div>

                      {/* Total Amount & Tracking Arrow */}
                      <div className="flex items-center justify-between md:justify-end gap-6 md:w-auto w-full border-t md:border-t-0 border-border/50 pt-4 md:pt-0 mt-2 md:mt-0">
                        <div className="text-left md:text-right">
                          <p className="font-bold text-lg text-primary">₹{order.totalAmount}</p>
                          <p className="text-[11px] text-muted-foreground">Total Paid</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Page <span className="font-medium text-foreground">{pagination.currentPage}</span> of{" "}
                  <span className="font-medium text-foreground">{pagination.totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/my-orders?page=${pagination.currentPage - 1}`}
                    className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : ""}
                  >
                    <Button variant="outline" size="sm" className="rounded-full gap-1" disabled={!pagination.hasPrevPage}>
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </Button>
                  </Link>
                  <Link
                    href={`/my-orders?page=${pagination.currentPage + 1}`}
                    className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : ""}
                  >
                    <Button variant="outline" size="sm" className="rounded-full gap-1" disabled={!pagination.hasNextPage}>
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
