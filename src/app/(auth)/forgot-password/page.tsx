"use client";

import React, { useState } from "react";
import Link from "next/link";
import { forgotPasswordAPI } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { FiArrowLeft, FiMail } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordAPI(email);
      setSent(true);
      toast.success("Password recovery instructions sent!");
    } catch {
      // Even on error, show sent for security reasons
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="h-4 w-4" /> Back to Sign In
      </Link>

      {!sent ? (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" loading={loading} className="w-full">
              Send Reset Code
            </Button>
          </form>
        </>
      ) : (
        <div className="auth-success-state text-center py-4">
          <div className="auth-success-icon mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600 mb-4">
            <FiMail className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Check your inbox</h2>
          <p className="mt-2 text-sm text-gray-600">
            If an account exists for <span className="font-semibold text-gray-800">{email}</span>, you will receive an OTP code to reset your password.
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button variant="outline" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
