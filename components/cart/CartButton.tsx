"use client";

import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartButton() {
  const [mounted, setMounted] = useState(false);
  const itemCount = useCartStore((state) => state.getItemCount());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link
        href="/client/cart"
        className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <ShoppingCart className="w-5 h-5" />
      </Link>
    );
  }

  return (
    <Link
      href="/client/cart"
      className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors"
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Link>
  );
}
