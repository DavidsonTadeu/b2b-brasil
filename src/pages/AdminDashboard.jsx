import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, Package, ShoppingCart, FileText } from 'lucide-react';
import AdminUsersTab from '@/components/admin/AdminUsersTab';
import AdminOrdersTab from '@/components/admin/AdminOrdersTab';
import AdminProductsTab from '@/components/admin/AdminProductsTab';
import AdminStatsCards from '@/components/admin/AdminStatsCards';

export default function AdminDashboard() {
  const { user } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    Promise.all([
      base44.entities.User.list('-created_date', 100),
      base44.entities.Order.list('-created_date', 50),
      base44.entities.Product.list('-created_date', 50),
    ]).then(([u, o, p]) => {
      setUsers(u);
      setOrders(o);
      setProducts(p);
      setLoading(false);
    });
  }, [user]);

  if (user?.role !== 'admin') {
    return <div className="text-center py-20"><p className="text-muted-foreground">Acesso restrito a administradores</p></div>;
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalFees = orders.reduce((acc, o) => acc + (o.platform_fee || 0), 0);
  const pendingUsers = users.filter(u => u.account_status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading font-bold text-2xl mb-6">Painel Administrativo</h1>

      <AdminStatsCards
        totalUsers={users.length}
        pendingUsers={pendingUsers}
        totalOrders={orders.length}
        totalRevenue={totalRevenue}
        totalFees={totalFees}
        totalProducts={products.length}
      />

      <Tabs defaultValue="users" className="mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Usuários ({users.length})</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2"><ShoppingCart className="h-4 w-4" /> Pedidos ({orders.length})</TabsTrigger>
          <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" /> Produtos ({products.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <AdminUsersTab users={users} setUsers={setUsers} />
        </TabsContent>
        <TabsContent value="orders">
          <AdminOrdersTab orders={orders} />
        </TabsContent>
        <TabsContent value="products">
          <AdminProductsTab products={products} />
        </TabsContent>
      </Tabs>
    </div>
  );
}