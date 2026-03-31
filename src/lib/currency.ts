export const CURRENCY_CODE = process.env.NEXT_PUBLIC_PAYMENT_CURRENCY || "USD";
export const CURRENCY_SYMBOL = CURRENCY_CODE === "RWF" ? "RWF " : "$";
