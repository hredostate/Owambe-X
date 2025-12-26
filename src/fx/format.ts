export const formatNaira = (amountKobo: number) => {
  const amount = Math.floor(amountKobo / 100);
  return `₦${amount.toLocaleString('en-NG')}`;
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
