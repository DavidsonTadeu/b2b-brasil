import { Package, ShoppingCart, DollarSign, MessageSquare } from 'lucide-react';

export default function SupplierStats({ orders, products, quotes }) {
  const totalRevenue = orders.reduce((acc, o) => acc + (o.supplier_amount || 0), 0);
  const pendingQuotes = quotes.filter(q => q.status === 'pending').length;

  const stats = [
    { label: 'Produtos Ativos', value: products.filter(p => p.status === 'active').length, icon: Package, color: 'text-blue-600 bg-blue-100' },
    { label: 'Pedidos', value: orders.length, icon: ShoppingCart, color: 'text-green-600 bg-green-100' },
    { label: 'Receita Líquida', value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-purple-600 bg-purple-100' },
    { label: 'Cotações Pendentes', value: pendingQuotes, icon: MessageSquare, color: 'text-amber-600 bg-amber-100' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-xl font-heading font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
}