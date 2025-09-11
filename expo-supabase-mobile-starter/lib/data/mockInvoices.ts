export type Invoice = { 
  id: string; 
  clientId: string; 
  total: number; 
  status: 'paid' | 'unpaid' | 'overdue'; 
  createdAt: Date; 
  dueDate: Date; 
};

export const invoices: Invoice[] = [
  { 
    id: '1', 
    clientId: '1', 
    total: 1250.00, 
    status: 'unpaid', 
    createdAt: new Date('2024-01-15'), 
    dueDate: new Date('2024-02-15') 
  },
  { 
    id: '2', 
    clientId: '2', 
    total: 850.50, 
    status: 'paid', 
    createdAt: new Date('2024-01-10'), 
    dueDate: new Date('2024-02-10') 
  },
  { 
    id: '3', 
    clientId: '1', 
    total: 2100.00, 
    status: 'overdue', 
    createdAt: new Date('2024-01-05'), 
    dueDate: new Date('2024-01-20') 
  },
  { 
    id: '4', 
    clientId: '3', 
    total: 675.25, 
    status: 'unpaid', 
    createdAt: new Date('2024-01-20'), 
    dueDate: new Date('2024-02-20') 
  },
];

