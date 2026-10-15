"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sendOtp, verifyOtp, loginWithGoogle } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Phone, User as UserIcon, KeyRound, Sparkles } from "lucide-react";
import { Suspense } from "react";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 mr-2.5" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function LoginForm() {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/my-orders";
  const notice = searchParams.get("notice");

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

  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    window.location.href = "/api/auth/google";
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
    <div className="bg-card border border-border shadow-lg p-8 rounded-3xl w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Welcome to Crévia</h1>
        <p className="text-muted-foreground mt-2">Sign in to track orders and save your delivery details</p>
      </div>

      {notice === "google_keys_needed" && (
        <div className="mb-6 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs leading-relaxed">
          💡 <strong>Google OAuth Setup Notice:</strong> Real Google Sign-In activates as soon as <code className="font-mono bg-blue-500/20 px-1 rounded">GOOGLE_CLIENT_ID</code> is set in <code className="font-mono">.env</code>. You can also test with 1-click test login below.
        </div>
      )}

      {/* Google Sign-In Button */}
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={googleLoading}
        className="w-full h-12 text-sm font-medium rounded-2xl border-border hover:bg-muted/60 transition-all shadow-sm mb-6"
      >
        <GoogleIcon />
        {googleLoading ? "Connecting..." : "Continue with Google"}
      </Button>

      {/* Or Divider */}
      <div className="relative mb-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/80" />
        </div>
        <span className="relative bg-card px-3 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Or with Phone OTP
        </span>
      </div>

      {/* Phone OTP Form */}
      <form onSubmit={handleSendOtp} className="space-y-4">
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
          <label className="block text-sm font-medium text-foreground mb-1.5">Mobile Number</label>
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

        <Button type="submit" disabled={loading} className="w-full h-11 text-base mt-2">
          {loading ? "Sending Code..." : "Get OTP Code"}
        </Button>
      </form>
    </div>
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
