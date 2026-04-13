import { Badge } from '@/components/ui/badge';

export default function AdminProductsTab({ products }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Produto</th>
              <th className="text-left px-4 py-3 font-medium">Categoria</th>
              <th className="text-left px-4 py-3 font-medium">Fornecedor</th>
              <th className="text-left px-4 py-3 font-medium">Preço</th>
              <th className="text-left px-4 py-3 font-medium">Estoque</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium">{p.title}</td>
                <td className="px-4 py-3"><Badge variant="secondary">{p.category}</Badge></td>
                <td className="px-4 py-3 text-muted-foreground">{p.supplier_name || '—'}</td>
                <td className="px-4 py-3">R$ {p.price?.toFixed(2)}</td>
                <td className="px-4 py-3">{p.stock || 0}</td>
                <td className="px-4 py-3">
                  <Badge className={p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                    {p.status === 'active' ? 'Ativo' : p.status === 'inactive' ? 'Inativo' : 'Pendente'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum produto cadastrado</p>}
      </div>
    </div>
  );
}