// Shared by the public ReTendance landing page and deterministic assistant calculator.
export const ATTENDANCE_PRICES = {
  free: { display: "Rp0", amount: 0, maximum: 10 },
  pro: { display: "Rp12.500", amount: 12500 },
  business: { display: "Rp20.000", amount: 20000 },
} as const;
