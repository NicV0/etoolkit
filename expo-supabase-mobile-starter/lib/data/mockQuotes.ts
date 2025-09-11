export type Quote = { 
  id: string; 
  clientId: string; 
  total: number; 
  status: 'open' | 'approved' | 'rejected'; 
  createdAt: Date; 
};

export const quotes: Quote[] = [
  { 
    id: '1', 
    clientId: '1', 
    total: 1800.00, 
    status: 'open', 
    createdAt: new Date('2024-01-25') 
  },
  { 
    id: '2', 
    clientId: '2', 
    total: 950.00, 
    status: 'open', 
    createdAt: new Date('2024-01-28') 
  },
  { 
    id: '3', 
    clientId: '3', 
    total: 3200.00, 
    status: 'approved', 
    createdAt: new Date('2024-01-20') 
  },
  { 
    id: '4', 
    clientId: '1', 
    total: 750.00, 
    status: 'rejected', 
    createdAt: new Date('2024-01-18') 
  },
];

