import { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Trash2, ShoppingCart, ChevronLeft, ArrowRight, Search } from 'lucide-react';
import { getPriceForQuantity } from '@/lib/priceTiers';

export default function Cart() {
  const { user, setCartCount } = useOutletContext();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cep, setCep] = useState('');
  const [searchingCep, setSearchingCep] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!user) return;
    base44.entities.CartItem.filter({ buyer_id: user.id }).then(data => {
      setItems(data);
      setLoading(false);
    });
  }, [user]);

  const removeItem = async (itemId) => {
    try {
      await base44.entities.CartItem.delete(itemId);
      setItems(items.filter(i => i.id !== itemId));
      setCartCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      toast({ title: 'Erro ao remover item', variant: 'destructive' });
    }
  };

  const updateQuantity = async (item, newQty) => {
    if (newQty < 1) return;
    let newPrice = item.unit_price;
    try {
      const [product] = await base44.entities.Product.filter({ id: item.product_id });
      if (product) newPrice = getPriceForQuantity(product, newQty);
    } catch {}
    
    try {
      await base44.entities.CartItem.update(item.id, { quantity: newQty, unit_price: newPrice });
      setItems(items.map(i => i.id === item.id ? { ...i, quantity: newQty, unit_price: newPrice } : i));
    } catch (e) {
      toast({ title: 'Erro ao atualizar quantidade', variant: 'destructive' });
    }
  };

  const handleCepSearch = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    
    setSearchingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setShippingAddress(`${data.logradouro}, Número, ${data.bairro}, ${data.localidade} - ${data.uf}, ${data.cep}`);
      } else {
        toast({ title: 'CEP não encontrado', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Erro ao buscar CEP', variant: 'destructive' });
    } finally {
      setSearchingCep(false);
    }
  };

  const total = items.reduce((acc, i) => acc + (i.unit_price * i.quantity), 0);

  const grouped = items.reduce((acc, item) => {
    const key = item.supplier_id || 'unknown';
    if (!acc[key]) acc[key] = { supplier_name: item.supplier_name, items: [] };
    acc[key].items.push(item);
    return acc;
  }, {});

  const handleCheckout = async () => {
    if (!shippingAddress.trim()) {
      toast({ title: 'Endereço obrigatório', description: 'Informe o endereço de entrega.', variant: 'destructive' });
      return;
    }
    
    setSubmitting(true);

    try {
      for (const [supplierId, group] of Object.entries(grouped)) {
        const supplierTotal = group.items.reduce((acc, i) => acc + i.unit_price * i.quantity, 0);

        // Agrupando dados extras no items_json para evitar erros de SQL no backend
        const orderData = {
          buyer_id: user.id,
          supplier_id: supplierId,
          status: 'pending',
          total_amount: supplierTotal,
          items_json: JSON.stringify({
            items: group.items,
            buyer_name: user.full_name,
            buyer_email: user.email,
            supplier_name: group.supplier_name,
            shipping_address: shippingAddress,
            notes: notes
          })
        };

        await base44.entities.Order.create(orderData);
      }

      for (const item of items) {
        await base44.entities.CartItem.delete(item.id);
      }
      
      setItems([]);
      setCartCount(0);
      toast({ title: 'Pedido realizado!', description: 'Seus pedidos foram enviados aos fornecedores.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao processar o pedido. Tente novamente.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" /> Continuar comprando
      </Link>

      <h1 className="font-heading font-bold text-2xl mb-6 flex items-center gap-3">
        <ShoppingCart className="h-6 w-6" /> Carrinho
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Seu carrinho está vazio</p>
          <Link to="/" className="text-primary text-sm hover:underline mt-2 inline-block">Explorar produtos</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {Object.entries(grouped).map(([supplierId, group]) => (
              <div key={supplierId} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-muted/50 border-b border-border">
                  <p className="text-sm font-medium">{group.supplier_name || 'Fornecedor'}</p>
                </div>
                <div className="divide-y divide-border">
                  {group.items.map(item => (
                    <div key={item.id} className="flex gap-4 p-4">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden shrink-0">
                        {item.product_image && <img src={item.product_image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product_id}`} className="text-sm font-medium hover:text-primary transition-colors line-clamp-1">
                          {item.product_title}
                        </Link>
                        <p className="text-sm text-primary font-semibold mt-1">R$ {item.unit_price?.toFixed(2)}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-border rounded-lg">
                            <button onClick={() => updateQuantity(item, item.quantity - 1)} className="px-2 py-1 hover:bg-muted text-xs">−</button>
                            <span className="px-3 py-1 text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item, item.quantity + 1)} className="px-2 py-1 hover:bg-muted text-xs">+</button>
                          </div>
                          <span className="text-sm text-muted-foreground">= R$ {(item.unit_price * item.quantity).toFixed(2)}</span>
                          <button onClick={() => removeItem(item.id)} className="ml-auto text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 sticky top-20">
              <h3 className="font-heading font-semibold">Resumo do Pedido</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.length} itens)</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 font-semibold text-base">
                  <span>Total</span>
                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-sm font-medium">CEP</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={cep}
                      onChange={e => setCep(e.target.value)}
                      onBlur={handleCepSearch}
                      placeholder="00000-000"
                    />
                    <Button type="button" variant="outline" onClick={handleCepSearch} disabled={searchingCep}>
                      {searchingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Endereço de entrega *</label>
                  <Textarea
                    value={shippingAddress}
                    onChange={e => setShippingAddress(e.target.value)}
                    placeholder="Rua, número, bairro, cidade, estado, CEP"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Observações</label>
                  <Input
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Instruções especiais..."
                    className="mt-1"
                  />
                </div>
              </div>

              <Button className="w-full gap-2" size="lg" onClick={handleCheckout} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Finalizar Pedido
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}