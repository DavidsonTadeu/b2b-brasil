import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Loader2, MessageSquare, Check, X } from 'lucide-react';
import moment from 'moment';

const STATUS_MAP = {
  pending: { label: 'Pendente', class: 'bg-amber-100 text-amber-700' },
  responded: { label: 'Respondida', class: 'bg-blue-100 text-blue-700' },
  accepted: { label: 'Aceita', class: 'bg-green-100 text-green-700' },
  rejected: { label: 'Recusada', class: 'bg-red-100 text-red-700' },
  expired: { label: 'Expirada', class: 'bg-gray-100 text-gray-700' },
};

export default function SupplierQuotesTab({ quotes, setQuotes }) {
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [quotedPrice, setQuotedPrice] = useState('');
  const [response, setResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRespond = async () => {
    if (!quotedPrice) {
      toast({ title: 'Informe o preço cotado', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    await base44.entities.Quote.update(selectedQuote.id, {
      quoted_price: Number(quotedPrice),
      supplier_response: response,
      status: 'responded',
    });
    setQuotes(quotes.map(q => q.id === selectedQuote.id ? { ...q, quoted_price: Number(quotedPrice), supplier_response: response, status: 'responded' } : q));
    toast({ title: 'Cotação respondida!' });
    setSelectedQuote(null);
    setSubmitting(false);
  };

  const handleReject = async (quoteId) => {
    await base44.entities.Quote.update(quoteId, { status: 'rejected' });
    setQuotes(quotes.map(q => q.id === quoteId ? { ...q, status: 'rejected' } : q));
    toast({ title: 'Cotação recusada.' });
  };

  return (
    <div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Produto</th>
                <th className="text-left px-4 py-3 font-medium">Comprador</th>
                <th className="text-left px-4 py-3 font-medium">Qtd. Solicitada</th>
                <th className="text-left px-4 py-3 font-medium">Preço Cotado</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Data</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {quotes.map(q => {
                const status = STATUS_MAP[q.status] || STATUS_MAP.pending;
                return (
                  <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{q.product_title}</td>
                    <td className="px-4 py-3">{q.buyer_name}</td>
                    <td className="px-4 py-3">{q.requested_quantity}</td>
                    <td className="px-4 py-3">{q.quoted_price ? `R$ ${q.quoted_price.toFixed(2)}` : '—'}</td>
                    <td className="px-4 py-3"><Badge className={status.class}>{status.label}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">{moment(q.created_date).format('DD/MM/YY')}</td>
                    <td className="px-4 py-3 text-right">
                      {q.status === 'pending' && (
                        <div className="flex items-center gap-1 justify-end">
                          <Button size="sm" variant="outline" className="gap-1 text-green-700" onClick={() => { setSelectedQuote(q); setQuotedPrice(''); setResponse(''); }}>
                            <Check className="h-3.5 w-3.5" /> Responder
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 gap-1" onClick={() => handleReject(q.id)}>
                            <X className="h-3.5 w-3.5" /> Recusar
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {quotes.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma cotação recebida</p>}
        </div>
      </div>

      <Dialog open={!!selectedQuote} onOpenChange={() => setSelectedQuote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Responder Cotação</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <div className="space-y-4 pt-2">
              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                <p><strong>Produto:</strong> {selectedQuote.product_title}</p>
                <p><strong>Comprador:</strong> {selectedQuote.buyer_name}</p>
                <p><strong>Quantidade:</strong> {selectedQuote.requested_quantity}</p>
                {selectedQuote.buyer_message && <p><strong>Mensagem:</strong> {selectedQuote.buyer_message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Preço por unidade (R$) *</label>
                <Input type="number" step="0.01" value={quotedPrice} onChange={e => setQuotedPrice(e.target.value)} className="mt-1" />
                {quotedPrice && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Total estimado: R$ {(Number(quotedPrice) * selectedQuote.requested_quantity).toFixed(2)}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium">Sua resposta</label>
                <Textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Condições, prazo de entrega..." rows={3} className="mt-1" />
              </div>
              <Button className="w-full" onClick={handleRespond} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Enviar Cotação
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}