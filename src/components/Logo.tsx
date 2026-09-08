import logo from "@/assets/logo.png";
import { Link } from "@tanstack/react-router";

export function Logo({ variant = "full" }: { variant?: "full" | "mark" }) {
  if (variant === "mark") {
    return (
      <span className="block h-9 w-9 rounded-full bg-secondary ring-1 ring-border overflow-hidden shrink-0">
        <img src={logo} alt="Your Fragrance Shop" width={36} height={36} decoding="async" className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
      <span className="block h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-secondary ring-1 ring-border overflow-hidden shrink-0">
        <img src={logo} alt="Your Fragrance Shop logo" width={40} height={40} decoding="async" className="h-full w-full object-cover" />
      </span>
      <span className="font-display text-sm sm:text-lg tracking-[0.15em] sm:tracking-[0.2em] uppercase truncate">Your Fragrance Shop</span>
    </Link>
  );
}
