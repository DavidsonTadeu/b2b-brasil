import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import moment from 'moment';

const ORDER_STATUS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  pending: 'Pendente', confirmed: 'Confirmado', processing: 'Em Preparo',
  shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};

export default function SupplierOrdersTab({ orders, setOrders }) {
  const updateStatus = async (orderId, newStatus) => {
    await base44.entities.Order.update(orderId, { status: newStatus });
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast({ title: `Pedido atualizado para ${STATUS_LABELS[newStatus]}` });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Pedido</th>
              <th className="text-left px-4 py-3 font-medium">Comprador</th>
              <th className="text-left px-4 py-3 font-medium">Itens</th>
              <th className="text-left px-4 py-3 font-medium">Valor Líquido</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map(o => {
              // Desempacota os dados do JSON
              let parsedData = {};
              try {
                parsedData = typeof o.items_json === 'string' ? JSON.parse(o.items_json) : (o.items_json || {});
              } catch (e) {}

              const buyerName = parsedData.buyer_name || 'Desconhecido';
              const itemsCount = parsedData.items?.length || 0;
              // Calcula o valor líquido descontando a taxa de 7% da plataforma
              const supplierAmount = o.total_amount ? o.total_amount * 0.93 : 0;

              return (
                <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">#{o.id?.slice(-6)}</td>
                  <td className="px-4 py-3">{buyerName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{itemsCount} itens</td>
                  <td className="px-4 py-3 font-semibold text-green-600">R$ {supplierAmount.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Select value={o.status} onValueChange={v => updateStatus(o.id, v)}>
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <Badge className={ORDER_STATUS[o.status]}>{STATUS_LABELS[o.status]}</Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{moment(o.created_date).format('DD/MM/YY')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum pedido recebido ainda</p>}
      </div>
    </div>
  );
}