import { BorderOption, ExtraOption } from '@/types/pizza-customization';

export const borderOptions: BorderOption[] = [
  { id: 'none', name: 'Sem Borda', price: 0 },
  { id: 'catupiry', name: 'Borda de Catupiry', price: 8.90 },
  { id: 'cheddar', name: 'Borda de Cheddar', price: 8.90 },
  { id: 'chocolate', name: 'Borda de Chocolate', price: 10.90 },
  { id: 'goiabada', name: 'Borda de Goiabada', price: 10.90 }
];

export const extraOptions: ExtraOption[] = [
  { id: 'extra_cheese', name: 'Extra Queijo', price: 5.00 },
  { id: 'extra_bacon', name: 'Extra Bacon', price: 7.00 },
  { id: 'extra_pepperoni', name: 'Extra Pepperoni', price: 8.00 },
  { id: 'extra_olives', name: 'Extra Azeitonas', price: 3.00 },
  { id: 'extra_onion', name: 'Extra Cebola', price: 2.00 },
  { id: 'extra_mushroom', name: 'Extra Champignon', price: 6.00 },
  { id: 'catupiry', name: 'Catupiry', price: 8.00 },
  { id: 'cream_cheese', name: 'Cream Cheese', price: 7.00 }
];

export const sauceOptions: ExtraOption[] = [
  { id: 'tomato', name: 'Molho de Tomate', price: 0 },
  { id: 'bbq', name: 'Molho Barbecue', price: 3.00 },
  { id: 'garlic', name: 'Molho de Alho', price: 3.00 },
  { id: 'pesto', name: 'Molho Pesto', price: 5.00 },
  { id: 'white', name: 'Molho Branco', price: 4.00 }
];
