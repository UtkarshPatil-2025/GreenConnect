"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FiHome,
  FiList,
  FiTruck,
  FiPlus,
  FiAward,
  FiSettings,
  FiShield,
  FiStar,
  FiChevronLeft,
} from "react-icons/fi";

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const generatorLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: <FiHome className="h-5 w-5" /> },
  { href: "/listings", label: "My Listings", icon: <FiList className="h-5 w-5" /> },
  { href: "/pickups/new", label: "Schedule Pickup", icon: <FiPlus className="h-5 w-5" /> },
  { href: "/pickups", label: "My Pickups", icon: <FiTruck className="h-5 w-5" /> },
  { href: "/rewards", label: "Rewards", icon: <FiAward className="h-5 w-5" /> },
  { href: "/settings", label: "Settings", icon: <FiSettings className="h-5 w-5" /> },
];

const recyclerLinks: SidebarLink[] = [
  { href: "/recycler/dashboard", label: "Dashboard", icon: <FiHome className="h-5 w-5" /> },
  { href: "/recycler/pickups", label: "Incoming Pickups", icon: <FiTruck className="h-5 w-5" /> },
  { href: "/recycler/reviews", label: "Reviews", icon: <FiStar className="h-5 w-5" /> },
  { href: "/recycler/settings", label: "Settings", icon: <FiSettings className="h-5 w-5" /> },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [role, setRole] = useState<string>("GENERATOR");
  const pathname = usePathname();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setRole(user.role || "GENERATOR");
      } catch {
        // ignore
      }
    }
  }, []);

  const links = role === "RECYCLER" ? recyclerLinks : generatorLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 mt-16 w-64 transform border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Mobile close button */}
          <div className="flex items-center justify-end p-4 lg:hidden">
            <button
              onClick={onToggle}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {links.map((link) => {
              const active = pathname === link.href || 
                (link.href !== "/dashboard" && link.href !== "/recycler/dashboard" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onToggle();
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <span className={active ? "text-primary-600" : "text-gray-400"}>
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <FiShield className="h-3.5 w-3.5" />
              <span>GreenCircuit v1.0</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
