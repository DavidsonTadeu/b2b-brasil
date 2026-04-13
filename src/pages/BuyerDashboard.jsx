import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, MessageSquare, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import moment from 'moment';

const ORDER_STATUS = {
  pending: { label: 'Pendente', class: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmado', class: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Em Preparo', class: 'bg-purple-100 text-purple-700' },
  shipped: { label: 'Enviado', class: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Entregue', class: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-700' },
};

const QUOTE_STATUS = {
  pending: { label: 'Pendente', class: 'bg-amber-100 text-amber-700' },
  responded: { label: 'Respondida', class: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Aceita', class: 'bg-green-100 text-green-700' },
  rejected: { label: 'Recusada', class: 'bg-red-100 text-red-700' },
  expired: { label: 'Expirada', class: 'bg-gray-100 text-gray-700' },
};

export default function BuyerDashboard() {
  const { user } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'buyer') return;
    Promise.all([
      base44.entities.Order.filter({ buyer_id: user.id }, '-created_date', 50),
      base44.entities.Quote.filter({ buyer_id: user.id }, '-created_date', 50),
    ]).then(([o, q]) => {
      setOrders(o);
      setQuotes(q);
      setLoading(false);
    });
  }, [user]);

  if (user?.role !== 'buyer') {
    return <div className="text-center py-20"><p className="text-muted-foreground">Acesso restrito a compradores</p></div>;
  }

  if (user?.account_status !== 'approved') {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-7 w-7 text-amber-600" />
        </div>
        <h2 className="font-heading font-bold text-xl mb-2">Conta pendente de aprovação</h2>
        <p className="text-muted-foreground">O administrador precisa aprovar sua conta antes que você possa acessar a plataforma.</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const totalSpent = orders.reduce((acc, o) => acc + (o.total || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading font-bold text-2xl mb-6">Minha Conta</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-blue-100 text-blue-600"><ShoppingCart className="h-4 w-4" /></div>
          <p className="text-xl font-heading font-bold">{orders.length}</p>
          <p className="text-xs text-muted-foreground">Pedidos</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-purple-100 text-purple-600"><MessageSquare className="h-4 w-4" /></div>
          <p className="text-xl font-heading font-bold">{quotes.length}</p>
          <p className="text-xs text-muted-foreground">Cotações</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-green-100 text-green-600"><CheckCircle className="h-4 w-4" /></div>
          <p className="text-xl font-heading font-bold">R$ {totalSpent.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Total em Compras</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 bg-amber-100 text-amber-600"><Package className="h-4 w-4" /></div>
          <p className="text-xl font-heading font-bold">{quotes.filter(q => q.status === 'responded').length}</p>
          <p className="text-xs text-muted-foreground">Cotações Respondidas</p>
        </div>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="mb-4">
          <TabsTrigger value="orders" className="gap-2"><ShoppingCart className="h-4 w-4" /> Meus Pedidos</TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2"><MessageSquare className="h-4 w-4" /> Minhas Cotações</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Pedido</th>
                    <th className="text-left px-4 py-3 font-medium">Fornecedor</th>
                    <th className="text-left px-4 py-3 font-medium">Itens</th>
                    <th className="text-left px-4 py-3 font-medium">Total</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map(o => {
                    const status = ORDER_STATUS[o.status] || ORDER_STATUS.pending;
                    return (
                      <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">#{o.id?.slice(-6)}</td>
                        <td className="px-4 py-3">{o.supplier_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{o.items?.length || 0} itens</td>
                        <td className="px-4 py-3 font-semibold">R$ {o.total?.toFixed(2)}</td>
                        <td className="px-4 py-3"><Badge className={status.class}>{status.label}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{moment(o.created_date).format('DD/MM/YY')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {orders.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum pedido realizado</p>
                  <Link to="/" className="text-primary text-sm hover:underline mt-1 inline-block">Explorar produtos</Link>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quotes">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">Produto</th>
                    <th className="text-left px-4 py-3 font-medium">Fornecedor</th>
                    <th className="text-left px-4 py-3 font-medium">Qtd.</th>
                    <th className="text-left px-4 py-3 font-medium">Preço Cotado</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {quotes.map(q => {
                    const status = QUOTE_STATUS[q.status] || QUOTE_STATUS.pending;
                    return (
                      <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <Link to={`/product/${q.product_id}`} className="hover:text-primary">{q.product_title}</Link>
                        </td>
                        <td className="px-4 py-3">{q.supplier_name}</td>
                        <td className="px-4 py-3">{q.requested_quantity}</td>
                        <td className="px-4 py-3">{q.quoted_price ? `R$ ${q.quoted_price.toFixed(2)}/un.` : '—'}</td>
                        <td className="px-4 py-3"><Badge className={status.class}>{status.label}</Badge></td>
                        <td className="px-4 py-3 text-muted-foreground">{moment(q.created_date).format('DD/MM/YY')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {quotes.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma cotação enviada</p>}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}