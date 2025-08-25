export type Client = { id: string; name: string; email: string; status: 'active' | 'inactive' };
export const clients: Client[] = [
  { id: '1', name: 'Acme Plumbing',   email: 'office@acmeplumb.com',  status: 'active' },
  { id: '2', name: 'Green Leaf HVAC', email: 'hello@greenleaffl.com', status: 'active' },
  { id: '3', name: 'Sunrise Roofing', email: 'info@sunroofs.com',     status: 'inactive' },
];
