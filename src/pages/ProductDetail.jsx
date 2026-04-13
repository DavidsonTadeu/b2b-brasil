import { useState, useEffect } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Loader2, ShoppingCart, MessageSquare, Star, Minus, Plus, ChevronLeft, Package, Building2, CheckCircle } from 'lucide-react';
import ReviewSection from '@/components/products/ReviewSection';
import PriceTierTable from '@/components/products/PriceTierTable';
import { getPriceForQuantity } from '@/lib/priceTiers';

export default function ProductDetail() {
  const { id } = useParams();
  const { user, setCartCount } = useOutletContext();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariations, setSelectedVariations] = useState({});
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quoteQty, setQuoteQty] = useState(100);
  const [quoteMessage, setQuoteMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.entities.Product.filter({ id }).then(([p]) => {
      if (p) {
        try { p.images = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []); } catch(e) { p.images = []; }
        try { p.price_tiers = typeof p.price_tiers === 'string' ? JSON.parse(p.price_tiers) : (p.price_tiers || []); } catch(e) { p.price_tiers = []; }
        try { p.variations = typeof p.variations === 'string' ? JSON.parse(p.variations) : (p.variations || []); } catch(e) { p.variations = []; }
        try { p.tags = typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []); } catch(e) { p.tags = []; }
      }
      setProduct(p);
      if (p?.min_order) setQuantity(p.min_order);
      setLoading(false);
    });
  }, [id]);

  const unitPrice = product ? getPriceForQuantity(product, quantity) : 0;
  const basePrice = product?.price_tiers?.length > 0
    ? [...product.price_tiers].sort((a,b)=>a.min_qty-b.min_qty)[0].price
    : product?.price || 0;

  const handleAddToCart = async () => {
    if (!user || user.role !== 'buyer' || user.account_status !== 'approved') {
      toast({ title: 'Acesso restrito', description: 'Você precisa estar logado como um Comprador aprovado.', variant: 'destructive' });
      return;
    }
    
    setSubmitting(true);
    try {
      await base44.entities.CartItem.create({
        buyer_id: user.id,
        product_id: product.id,
        product_title: product.title,
        product_image: product.images?.[0] || '',
        supplier_id: product.supplier_id,
        supplier_name: product.supplier_name,
        quantity,
        unit_price: unitPrice,
        variations_selected: JSON.stringify(selectedVariations),
      });
      setCartCount(prev => prev + 1);
      toast({ title: 'Adicionado ao carrinho!' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível adicionar ao carrinho.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuoteSubmit = async () => {
    if (!user || user.role !== 'buyer' || user.account_status !== 'approved') {
      toast({ title: 'Acesso restrito', description: 'Você precisa estar logado como um Comprador aprovado.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    
    try {
      await base44.entities.Quote.create({
        buyer_id: user.id,
        buyer_name: user.full_name,
        buyer_email: user.email,
        supplier_id: product.supplier_id,
        supplier_name: product.supplier_name,
        product_id: product.id,
        product_title: product.title,
        requested_quantity: quoteQty,
        buyer_message: quoteMessage,
        status: 'pending',
      });
      toast({ title: 'Cotação enviada!', description: 'O fornecedor receberá sua solicitação.' });
      setQuoteOpen(false);
      setQuoteMessage('');
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível enviar a cotação.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!product) {
    return <div className="text-center py-20"><p>Produto não encontrado</p></div>;
  }

  const images = product.images?.length > 0 ? product.images : ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&q=80'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronLeft className="h-4 w-4" /> Voltar ao catálogo
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden bg-muted border border-border">
            <img src={images[selectedImage]} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${i === selectedImage ? 'border-primary' : 'border-border'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{product.category}</Badge>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                <CheckCircle className="h-3 w-3 mr-1" /> Em estoque
              </Badge>
            </div>
            <h1 className="font-heading font-bold text-2xl lg:text-3xl">{product.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <span>{product.supplier_name || 'Fornecedor'}</span>
            </div>
          </div>

          <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-primary">R$ {unitPrice.toFixed(2)}</span>
              <span className="text-muted-foreground">/{product.unit || 'un.'}</span>
              {unitPrice < basePrice && (
                <span className="text-sm line-through text-muted-foreground">R$ {basePrice.toFixed(2)}</span>
              )}
            </div>
            {product.min_order > 1 && (
              <p className="text-sm text-muted-foreground mt-1">
                <Package className="h-3.5 w-3.5 inline mr-1" />
                Pedido mínimo: {product.min_order} {product.unit || 'unidades'}
              </p>
            )}
          </div>

          {product.variations?.length > 0 && (
            <div className="space-y-3">
              {product.variations.map((v, i) => (
                <div key={i}>
                  <label className="text-sm font-medium mb-2 block">{v.name}</label>
                  <div className="flex flex-wrap gap-2">
                    {v.options?.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariations(prev => ({ ...prev, [v.name]: opt }))}
                        className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                          selectedVariations[v.name] === opt
                            ? 'border-primary bg-primary/10 text-primary font-medium'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {product.price_tiers?.length > 0 && (
            <PriceTierTable product={product} currentQty={quantity} />
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Quantidade</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(product.min_order || 1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.min_order || 1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center py-2 bg-transparent focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-muted transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm space-y-0.5">
                <div>Total: <strong className="text-foreground">R$ {(unitPrice * quantity).toFixed(2)}</strong></div>
                {unitPrice < basePrice && (
                  <div className="text-green-600 text-xs font-medium">
                    Economia: R$ {((basePrice - unitPrice) * quantity).toFixed(2)} ({((1 - unitPrice/basePrice)*100).toFixed(0)}% off)
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
              Adicionar ao Carrinho
            </Button>
            <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
              <DialogTrigger asChild>
                <Button size="lg" variant="outline" className="flex-1 gap-2" disabled={submitting}>
                  <MessageSquare className="h-4 w-4" /> Solicitar Cotação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Solicitar Cotação</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-muted-foreground">
                    Solicite um preço especial para o volume desejado de <strong>{product.title}</strong>
                  </p>
                  <div>
                    <label className="text-sm font-medium">Quantidade desejada</label>
                    <Input type="number" value={quoteQty} onChange={e => setQuoteQty(parseInt(e.target.value) || 1)} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mensagem (opcional)</label>
                    <Textarea value={quoteMessage} onChange={e => setQuoteMessage(e.target.value)} placeholder="Especificações, prazos, logística..." className="mt-1" rows={3} />
                  </div>
                  <Button className="w-full" onClick={handleQuoteSubmit} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Enviar Cotação
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {product.description && (
            <div className="pt-4 border-t border-border">
              <h3 className="font-heading font-semibold mb-2">Descrição do Produto</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12">
        <ReviewSection productId={product.id} user={user} />
      </div>
    </div>
  );
}