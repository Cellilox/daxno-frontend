export type FeeTier = {
    min: number;
    max: number | null;
    pct: number;
};

const parseNumber = (raw: string | undefined, fallback: number): number => {
    if (raw === undefined || raw === "") return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
};

const parseFeeTiers = (raw: string | undefined): FeeTier[] => {
    const defaultRaw = "5-20:35,21-50:30,51-100:25,101+:20";
    const source = (raw && raw.trim()) || defaultRaw;

    const tiers = source.split(",").map((entry, idx) => {
        const [range, pctStr] = entry.split(":");
        if (!range || !pctStr) {
            throw new Error(
                `NEXT_PUBLIC_FEE_TIERS entry ${idx} malformed: "${entry}" (expected "MIN-MAX:PCT" or "MIN+:PCT")`
            );
        }
        const pct = Number(pctStr);
        if (!Number.isFinite(pct)) {
            throw new Error(`NEXT_PUBLIC_FEE_TIERS entry ${idx}: pct "${pctStr}" is not a number`);
        }

        if (range.endsWith("+")) {
            const min = Number(range.slice(0, -1));
            if (!Number.isFinite(min)) {
                throw new Error(`NEXT_PUBLIC_FEE_TIERS entry ${idx}: min "${range}" is not a number`);
            }
            return { min, max: null, pct };
        }

        const [minStr, maxStr] = range.split("-");
        const min = Number(minStr);
        const max = Number(maxStr);
        if (!Number.isFinite(min) || !Number.isFinite(max)) {
            throw new Error(`NEXT_PUBLIC_FEE_TIERS entry ${idx}: range "${range}" is not valid`);
        }
        return { min, max, pct };
    });

    return tiers;
};

export const CREDIT_DEFAULT_AMOUNT = parseNumber(
    process.env.NEXT_PUBLIC_CREDIT_DEFAULT_AMOUNT,
    30
);

export const CREDIT_MIN_AMOUNT = parseNumber(
    process.env.NEXT_PUBLIC_CREDIT_MIN_AMOUNT,
    5
);

export const BYOK_MONTHLY_PRICE = parseNumber(
    process.env.NEXT_PUBLIC_BYOK_MONTHLY_PRICE,
    10
);

export const BYOK_YEARLY_PRICE = parseNumber(
    process.env.NEXT_PUBLIC_BYOK_YEARLY_PRICE,
    100
);

export const BYOK_PRORATION_INTERVAL_DAYS = parseNumber(
    process.env.NEXT_PUBLIC_BYOK_PRORATION_INTERVAL_DAYS,
    30
);

export const FEE_TIERS: FeeTier[] = parseFeeTiers(process.env.NEXT_PUBLIC_FEE_TIERS);

export const BYOK_YEARLY_FULL_PRICE = BYOK_MONTHLY_PRICE * 12;
export const BYOK_YEARLY_SAVINGS = Math.max(0, BYOK_YEARLY_FULL_PRICE - BYOK_YEARLY_PRICE);
export const BYOK_YEARLY_SAVINGS_PCT = BYOK_YEARLY_FULL_PRICE > 0
    ? Math.round((BYOK_YEARLY_SAVINGS / BYOK_YEARLY_FULL_PRICE) * 100)
    : 0;
