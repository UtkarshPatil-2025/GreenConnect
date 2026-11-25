"use client";

import React, { Suspense, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtpAPI } from "@/lib/api";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { FiCheckCircle, FiShield } from "react-icons/fi";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const qUserId = searchParams.get("userId") || localStorage.getItem("pendingUserId") || "";
    const qEmail = searchParams.get("email") || localStorage.getItem("pendingEmail") || "";
    setUserId(qUserId);
    setEmail(qEmail);

    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedDigits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newDigits = [...digits];
      pastedDigits.forEach((d, i) => {
        if (index + i < 6) newDigits[index + i] = d;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const val = value.replace(/\D/g, "");
    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) {
      toast.error("Please enter the complete 6-digit code.");
      return;
    }
    if (!userId) {
      toast.error("User ID missing. Please sign up or log in again.");
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpAPI(userId, code, "EMAIL_VERIFY");
      if (res.success) {
        toast.success("Verification successful!");
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          if (userObj.role === "RECYCLER") {
            router.push("/recycler/dashboard");
            return;
          }
        }
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 mb-4">
        <FiShield className="h-6 w-6" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900">Verify your Email</h1>
      <p className="mt-2 text-sm text-gray-500">
        We sent a 6-digit verification code to
      </p>
      <p className="font-semibold text-gray-800 text-sm mt-0.5">
        {email || "your registered email"}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="flex justify-center gap-2 sm:gap-3">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="h-12 w-11 sm:h-14 sm:w-12 text-center text-xl font-bold rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition"
            />
          ))}
        </div>

        <Button type="submit" loading={loading} className="w-full">
          Confirm Code
        </Button>
      </form>

      <div className="mt-6 text-xs text-gray-500">
        Didn&apos;t receive the code?{" "}
        {countdown > 0 ? (
          <span className="font-semibold text-gray-700">Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={() => {
              setCountdown(60);
              toast.success("New code sent to your email!");
            }}
            className="font-bold text-primary-600 hover:text-primary-700"
          >
            Resend Code
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      }
    >
      <VerifyOtpContent />
    </Suspense>
  );
}
