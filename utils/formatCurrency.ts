export function formatCurrency(amount: number | string, options?: Intl.NumberFormatOptions): string {
    const numericAmount = Number(amount);

    const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
        ...options,
    }).format(numericAmount);

    return `${formattedAmount}`;
}
