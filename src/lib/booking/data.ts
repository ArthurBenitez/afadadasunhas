export type Service = {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number; // BRL
};

export const PREPAY_DISCOUNT = 0.1; // 10%

export const availableSlots = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
