import { Category, Employee, Product, TableReport } from '../types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Hambúrgueres' },
  { id: '2', name: 'Pizzas' },
  { id: '3', name: 'Bebidas' },
  { id: '4', name: 'Porções' },
  { id: '5', name: 'Combos' },
];

export const mockProducts: Product[] = [
  {
    id: 'c1',
    name: 'Combo La Casa',
    description: '1 La Casa Clássico + Batata Rústica Assalto + Refri Lata.',
    price: 52.90,
    categoryId: '5',
    image: 'https://images.unsplash.com/photo-1594212202875-86ac1cf54388?auto=format&fit=crop&q=80&w=500',
    stock: 50,
    sales: 250
  },
  {
    id: 'p1',
    name: 'La Casa Clássico',
    description: 'Pão brioche, blend 160g, queijo cheddar, alface, tomate e maionese da casa.',
    price: 32.90,
    categoryId: '1',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=500',
    stock: 50,
    sales: 120
  },
  {
    id: 'p2',
    name: 'Berlim Bacon',
    description: 'Pão australiano, blend 200g, duplo cheddar, muito bacon crocante e molho barbecue.',
    price: 38.90,
    categoryId: '1',
    image: 'https://images.unsplash.com/photo-1594212202875-86ac1cf54388?auto=format&fit=crop&q=80&w=500',
    stock: 30,
    sales: 200
  },
  {
    id: 'p3',
    name: 'Tóquio Chicken',
    description: 'Pão brioche, frango empanado crocante, cream cheese, alface americana e molho teriyaki.',
    price: 29.90,
    categoryId: '1',
    image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&q=80&w=500',
    stock: 45,
    sales: 85
  },
  {
    id: 'p4',
    name: 'Pizza Professor (Calabresa)',
    description: 'Massa artesanal, molho de tomate, mussarela, calabresa fatiada e cebola.',
    price: 45.00,
    categoryId: '2',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=500',
    stock: 20,
    sales: 150
  },
  {
    id: 'p5',
    name: 'Pizza Lisboa (Marguerita)',
    description: 'Massa artesanal, molho de tomate, mussarela de búfala, manjericão fresco e tomate.',
    price: 48.00,
    categoryId: '2',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=500',
    stock: 15,
    sales: 90
  },
  {
    id: 'p6',
    name: 'Coca-Cola Lata 350ml',
    description: 'Refrigerante gelado.',
    price: 6.00,
    categoryId: '3',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=500',
    stock: 100,
    sales: 300
  },
  {
    id: 'p7',
    name: 'Batata Rústica Assalto',
    description: 'Porção de batatas rústicas com páprica, acompanha maionese temperada.',
    price: 22.00,
    categoryId: '4',
    image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&q=80&w=500',
    stock: 40,
    sales: 180
  }
];

export const mockEmployees: Employee[] = [
  { id: 'e1', name: 'Carlos Silva', role: 'Chapeiro', active: true },
  { id: 'e2', name: 'Ana Souza', role: 'Atendente', active: true },
  { id: 'e3', name: 'Ricardo Mendes', role: 'Entregador', active: true },
];

export const mockTables: TableReport[] = [
  { id: 't1', tableNumber: 1, status: 'free', currentTotal: 0 },
  { id: 't2', tableNumber: 2, status: 'occupied', currentTotal: 85.90 },
  { id: 't3', tableNumber: 3, status: 'closing', currentTotal: 145.00 },
  { id: 't4', tableNumber: 4, status: 'free', currentTotal: 0 },
];
