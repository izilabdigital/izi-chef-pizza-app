import { Product } from '@/types/product';
import heroPizza from '@/assets/hero-pizza.jpg';
import pizzaPepperoni from '@/assets/pizza-pepperoni.jpg';
import pizzaQueijos from '@/assets/pizza-queijos.jpg';
import pizzaMargherita from '@/assets/pizza-margherita.jpg';
import pizzaPortuguesa from '@/assets/pizza-portuguesa.jpg';

export const products: Product[] = [
  {
    id: '1',
    name: 'Margherita',
    description: 'Molho de tomate, mussarela, manjericão fresco e azeite',
    price: 42.90,
    image: pizzaMargherita,
    category: 'classicas'
  },
  {
    id: '2',
    name: 'Pepperoni',
    description: 'Molho de tomate, mussarela e pepperoni',
    price: 48.90,
    image: pizzaPepperoni,
    category: 'classicas'
  },
  {
    id: '3',
    name: 'Portuguesa',
    description: 'Molho de tomate, mussarela, presunto, ovos, cebola e azeitonas',
    price: 52.90,
    image: pizzaPortuguesa,
    category: 'classicas'
  },
  {
    id: '4',
    name: 'Quatro Queijos',
    description: 'Molho branco, mussarela, parmesão, gorgonzola e catupiry',
    price: 54.90,
    image: pizzaQueijos,
    category: 'especiais'
  },
  {
    id: '5',
    name: 'Chef Signature',
    description: 'Molho especial, mussarela de búfala, tomate seco e rúcula',
    price: 62.90,
    image: heroPizza,
    category: 'especiais'
  }
];
