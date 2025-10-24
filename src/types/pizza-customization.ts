export interface PizzaFlavor {
  id: string;
  name: string;
  price: number;
  fraction: number; // 0.5 for half, 0.33 for third, 0.25 for quarter
}

export interface BorderOption {
  id: string;
  name: string;
  price: number;
}

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
  applyToHalf?: boolean; // Se pode ser aplicado apenas em metade
}

export interface CustomPizza {
  flavors: PizzaFlavor[];
  border?: BorderOption;
  extras: ExtraOption[];
  observations?: string;
  size: 'P' | 'M' | 'G' | 'GG';
}

export interface CustomPizzaCartItem {
  id: string;
  customPizza: CustomPizza;
  quantity: number;
  totalPrice: number;
  image: string;
}
