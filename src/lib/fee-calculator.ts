import { FEE_TIERS } from "./billing-config";

export type FeeResult = {
    inputAmount: number;
    serviceFeePercentage: number;
    serviceFeeAmount: number;
    credits: number;
};

const resolveTierPct = (amount: number): number => {
    for (const tier of FEE_TIERS) {
        const inRange = amount >= tier.min && (tier.max === null || amount <= tier.max);
        if (inRange) return tier.pct / 100;
    }
    // Fallback: amount below first tier — apply first tier's pct (matches prior behavior).
    return FEE_TIERS[0] ? FEE_TIERS[0].pct / 100 : 0;
};

export const calculateServiceFee = (amount: number): FeeResult => {
    const percentage = resolveTierPct(amount);
    const feeAmount = amount * percentage;
    const netCredits = amount - feeAmount;

    return {
        inputAmount: amount,
        serviceFeePercentage: percentage * 100,
        serviceFeeAmount: feeAmount,
        credits: netCredits,
    };
};
