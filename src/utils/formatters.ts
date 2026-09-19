import { Currency } from "../types";
import { FX_RATES } from "../data/initialData";

export function formatMoney(amount: number, currency: Currency = "IDR"): string {
  if (currency === "IDR") {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency
): number {
  if (fromCurrency === toCurrency) return amount;
  // Convert from origin to IDR base
  const amountInIdr = fromCurrency === "IDR" ? amount : amount * (FX_RATES[fromCurrency] || 1);
  // Convert from IDR base to destination
  if (toCurrency === "IDR") return amountInIdr;
  return amountInIdr / (FX_RATES[toCurrency] || 1);
}

export function formatIdDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}
