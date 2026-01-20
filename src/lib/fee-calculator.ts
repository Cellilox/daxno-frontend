export type FeeResult = {
    inputAmount: number;
    serviceFeePercentage: number;
    serviceFeeAmount: number;
    credits: number;
};

export const calculateServiceFee = (amount: number): FeeResult => {
    let percentage = 0;

    if (amount >= 5 && amount <= 20) {
        percentage = 0.35;
    } else if (amount > 20 && amount <= 50) {
        percentage = 0.30;
    } else if (amount > 50 && amount <= 100) {
        percentage = 0.25;
    } else if (amount > 100) {
        percentage = 0.20;
    } else {
        // Default fallback or error case handling - though logic usually expects valid range
        // Assuming if < 5, maybe just flat rate or disallowed, but for calc purposes:
        percentage = 0.35;
    }

    const feeAmount = amount * percentage;
    const netCredits = amount - feeAmount;

    return {
        inputAmount: amount,
        serviceFeePercentage: percentage * 100,
        serviceFeeAmount: feeAmount,
        credits: netCredits
    };
};
