"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerAPI } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { FiCheck, FiUser, FiTruck } from "react-icons/fi";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"GENERATOR" | "RECYCLER">("GENERATOR");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength logic
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!email) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Invalid email format";
    if (phone && !/^\+?[1-9]\d{9,14}$/.test(phone)) errs.phone = "Invalid phone number";
    if (!password) errs.password = "Password is required";
    else if (!hasMinLength || !hasUppercase || !hasNumber) {
      errs.password = "Password must be at least 8 chars with an uppercase letter and a number";
    }
    if (!termsAccepted) errs.terms = "You must agree to the terms";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await registerAPI({
        name,
        email,
        phone: phone || undefined,
        password,
        role,
      });

      if (res.success && res.data) {
        localStorage.setItem("accessToken", res.data.tokens.accessToken);
        localStorage.setItem("refreshToken", res.data.tokens.refreshToken);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Account created successfully!");

        if (res.data.user.role === "RECYCLER") {
          router.push("/recycler/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Registration failed. Try a different email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Join GreenCircuit to dispose or recycle e-waste safely.
        </p>
      </div>

      {/* Role Selection */}
      <div className="mb-6">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
          Select Your Account Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole("GENERATOR")}
            className={`flex flex-col items-center rounded-xl border p-4 text-center transition ${
              role === "GENERATOR"
                ? "border-primary-600 bg-primary-50/50 text-primary-900 ring-2 ring-primary-500"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              role === "GENERATOR" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
            }`}>
              <FiUser className="h-5 w-5" />
            </div>
            <span className="mt-2 text-sm font-bold">Waste Generator</span>
            <span className="text-[11px] text-gray-500">Individual or Company</span>
          </button>

          <button
            type="button"
            onClick={() => setRole("RECYCLER")}
            className={`flex flex-col items-center rounded-xl border p-4 text-center transition ${
              role === "RECYCLER"
                ? "border-primary-600 bg-primary-50/50 text-primary-900 ring-2 ring-primary-500"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              role === "RECYCLER" ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-600"
            }`}>
              <FiTruck className="h-5 w-5" />
            </div>
            <span className="mt-2 text-sm font-bold">Recycler Facility</span>
            <span className="text-[11px] text-gray-500">Verified Processor</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name or Business Name"
          type="text"
          placeholder="e.g. Acme Tech Solutions"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="contact@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          required
        />

        <Input
          label="Phone Number (Optional)"
          type="tel"
          placeholder="+919876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={errors.phone}
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />

          {/* Real-time Password Checklist */}
          {password && (
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-lg bg-gray-50 p-2.5 text-xs text-gray-600">
              <span className={`flex items-center gap-1 ${hasMinLength ? "text-primary-600 font-medium" : ""}`}>
                <FiCheck className={`h-3.5 w-3.5 ${hasMinLength ? "opacity-100" : "opacity-30"}`} /> 8+ Characters
              </span>
              <span className={`flex items-center gap-1 ${hasUppercase ? "text-primary-600 font-medium" : ""}`}>
                <FiCheck className={`h-3.5 w-3.5 ${hasUppercase ? "opacity-100" : "opacity-30"}`} /> 1 Uppercase
              </span>
              <span className={`flex items-center gap-1 ${hasNumber ? "text-primary-600 font-medium" : ""}`}>
                <FiCheck className={`h-3.5 w-3.5 ${hasNumber ? "opacity-100" : "opacity-30"}`} /> 1 Number
              </span>
              <span className={`flex items-center gap-1 ${hasSpecial ? "text-primary-600 font-medium" : ""}`}>
                <FiCheck className={`h-3.5 w-3.5 ${hasSpecial ? "opacity-100" : "opacity-30"}`} /> 1 Special Char
              </span>
            </div>
          )}
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input
            id="terms"
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="terms" className="text-xs text-gray-600">
            I agree to the{" "}
            <span className="font-semibold text-primary-600">Terms of Service</span> and{" "}
            <span className="font-semibold text-primary-600">Environmental Compliance Code</span>.
          </label>
        </div>
        {errors.terms && <p className="text-xs text-red-600">{errors.terms}</p>}

        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <div className="mt-6 border-t border-gray-100 pt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
          Sign In
        </Link>
      </div>
    </div>
  );
}
