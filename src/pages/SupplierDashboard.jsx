import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Package, ShoppingCart, MessageSquare, BarChart3 } from 'lucide-react';
import SupplierProductsTab from '@/components/supplier/SupplierProductsTab';
import SupplierOrdersTab from '@/components/supplier/SupplierOrdersTab';
import SupplierQuotesTab from '@/components/supplier/SupplierQuotesTab';
import SupplierStats from '@/components/supplier/SupplierStats';

export default function SupplierDashboard() {
  const { user } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'supplier') return;
    
    // Adicionamos o .catch(() => []) para evitar que a tela trave se a tabela não existir no backend
    Promise.all([
      base44.entities.Product.filter({ supplier_id: user.id }, '-created_date', 50).catch(() => []),
      base44.entities.Order.filter({ supplier_id: user.id }, '-created_date', 50).catch(() => []),
      base44.entities.Quote.filter({ supplier_id: user.id }, '-created_date', 50).catch(() => []),
    ]).then(([p, o, q]) => {
      setProducts(p || []);
      setOrders(o || []);
      setQuotes(q || []);
      setLoading(false);
    });
  }, [user]);

  if (user?.role !== 'supplier') {
    return <div className="text-center py-20"><p className="text-muted-foreground">Acesso restrito a fornecedores</p></div>;
  }

  if (user?.account_status !== 'approved') {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-7 w-7 text-amber-600" />
        </div>
        <h2 className="font-heading font-bold text-xl mb-2">Conta pendente de aprovação</h2>
        <p className="text-muted-foreground">O administrador precisa aprovar sua conta antes que você possa acessar o painel do fornecedor.</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const pendingQuotes = quotes.filter(q => q.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading font-bold text-2xl mb-6">Painel do Fornecedor</h1>

      <SupplierStats orders={orders} products={products} quotes={quotes} />

      <Tabs defaultValue="products" className="mt-8">
        <TabsList className="mb-4">
          <TabsTrigger value="products" className="gap-2"><Package className="h-4 w-4" /> Produtos ({products.length})</TabsTrigger>
          <TabsTrigger value="orders" className="gap-2"><ShoppingCart className="h-4 w-4" /> Pedidos ({orders.length})</TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2 relative">
            <MessageSquare className="h-4 w-4" /> Cotações ({quotes.length})
            {pendingQuotes > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs flex items-center justify-center">{pendingQuotes}</span>}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <SupplierProductsTab products={products} setProducts={setProducts} user={user} />
        </TabsContent>
        <TabsContent value="orders">
          <SupplierOrdersTab orders={orders} setOrders={setOrders} />
        </TabsContent>
        <TabsContent value="quotes">
          <SupplierQuotesTab quotes={quotes} setQuotes={setQuotes} />
        </TabsContent>
      </Tabs>
    </div>
  );
}