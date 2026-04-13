import { Users, ShoppingCart, DollarSign, Package, AlertCircle, TrendingUp } from 'lucide-react';

export default function AdminStatsCards({ totalUsers, pendingUsers, totalOrders, totalRevenue, totalFees, totalProducts }) {
  const stats = [
    { label: 'Usuários', value: totalUsers, icon: Users, color: 'text-blue-600 bg-blue-100' },
    { label: 'Aprovações Pendentes', value: pendingUsers, icon: AlertCircle, color: 'text-amber-600 bg-amber-100' },
    { label: 'Pedidos', value: totalOrders, icon: ShoppingCart, color: 'text-green-600 bg-green-100' },
    { label: 'Faturamento Total', value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-purple-600 bg-purple-100' },
    { label: 'Comissão (7%)', value: `R$ ${totalFees.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-100' },
    { label: 'Produtos', value: totalProducts, icon: Package, color: 'text-indigo-600 bg-indigo-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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