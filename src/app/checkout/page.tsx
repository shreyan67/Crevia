import { getUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import CheckoutClient from "./checkout-client";

export default async function CheckoutPage() {
  const user = await getUser();

  // Enforce mandatory authentication before checkout
  if (!user) {
    redirect("/login?callbackUrl=/checkout");
  }

  return <CheckoutClient user={user} />;
}
