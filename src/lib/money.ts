export const formatNaira = (amountKobo: number) => {
  const amount = Math.floor(amountKobo / 100);
  return `₦${amount.toLocaleString('en-NG')}`;
};

export const toKobo = (amountNaira: number) => Math.max(0, Math.round(amountNaira * 100));
