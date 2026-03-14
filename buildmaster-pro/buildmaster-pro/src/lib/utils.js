import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount, currency = "SAR") {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatNumber(num) {
  return new Intl.NumberFormat("ar-SA").format(num);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 9);
}
