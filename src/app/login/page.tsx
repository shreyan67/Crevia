"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOtp, verifyOtp } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Phone, User as UserIcon, KeyRound, Sparkles } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/my-orders";

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await sendOtp(
      formData.get("name") as string,
      formData.get("phone") as string
    );

    if (res.success) {
      if (res.data?.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setStep("otp");
    } else {
      alert(res.message || "Failed to send OTP.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const res = await verifyOtp(enteredOtp);

    if (res.success) {
      router.push(callbackUrl);
      router.refresh();
    } else {
      alert(res.message || "Invalid OTP");
      setLoading(false);
    }
  };

  if (step === "otp") {
    return (
      <form onSubmit={handleVerifyOtp} className="bg-card border border-border shadow-lg p-8 rounded-3xl w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="font-serif text-3xl font-bold text-foreground">Verify OTP</h1>
          <p className="text-muted-foreground mt-2">Enter the 4-digit code sent to your phone</p>
        </div>

        {/* Development Mock OTP Helper Banner */}
        {devOtp && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Dev Mock SMS
              </span>
              <span className="font-mono text-base font-bold bg-amber-500/20 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                {devOtp}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              In production, this code is delivered via Twilio or Fast2SMS. For local testing, your generated code is displayed above.
            </p>
            <button
              type="button"
              onClick={() => setEnteredOtp(devOtp)}
              className="text-xs font-semibold text-primary hover:underline text-left"
            >
              Click here to auto-fill ({devOtp}) →
            </button>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">4-Digit OTP</label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                name="otp"
                required
                type="text"
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                placeholder="••••"
                className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-center tracking-[1em] text-xl font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading} className="w-full h-11 text-base">
          {loading ? "Verifying..." : "Verify & Login"}
        </Button>

        <button
          type="button"
          onClick={() => {
            setStep("phone");
            setEnteredOtp("");
          }}
          className="w-full mt-4 text-sm text-muted-foreground hover:text-primary transition-colors text-center"
        >
          ← Change Phone Number
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="bg-card border border-border shadow-lg p-8 rounded-3xl w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Welcome to Crévia</h1>
        <p className="text-muted-foreground mt-2">Enter your details to track and manage your orders</p>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
          <div className="relative">
            <UserIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="name"
              required
              type="text"
              placeholder="Shreyan Acharjee"
              className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
          <div className="relative">
            <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="phone"
              required
              type="tel"
              placeholder="+91 9876543210"
              className="w-full bg-background border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 text-base">
        {loading ? "Sending OTP..." : "Get OTP"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
