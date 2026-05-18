export type Service = {
  id: string;
  name: string;
  description: string;
  durationMin: number;
  price: number; // BRL
};

export const services: Service[] = [
  { id: "manicure-classica", name: "Manicure Clássica", description: "Cutilagem, lixamento e esmaltação tradicional.", durationMin: 50, price: 70 },
  { id: "manicure-russa", name: "Manicure Russa", description: "Técnica avançada de cutilagem sem corte da pele.", durationMin: 90, price: 130 },
  { id: "esmaltacao-gel", name: "Esmaltação em Gel", description: "Durabilidade de até 4 semanas com brilho intenso.", durationMin: 75, price: 110 },
  { id: "alongamento", name: "Alongamento em Fibra", description: "Modelagem personalizada e acabamento premium.", durationMin: 120, price: 220 },
  { id: "spa-maos", name: "Spa das Mãos", description: "Hidratação profunda, esfoliação e massagem.", durationMin: 40, price: 90 },
  { id: "nail-art", name: "Nail Art Autoral", description: "Desenhos exclusivos e técnicas decorativas.", durationMin: 60, price: 80 },
];

export const PREPAY_DISCOUNT = 0.1; // 10%

export const availableSlots = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00",
];

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
