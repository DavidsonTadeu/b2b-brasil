import { useState } from 'react';
import PriceTierEditor from './PriceTierEditor';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Plus, Loader2, Pencil, Trash2 } from 'lucide-react';

const CATEGORIES = ['Eletrônicos', 'Têxtil e Confecção', 'Máquinas e Equipamentos', 'Alimentos e Bebidas', 'Embalagens', 'Construção Civil', 'Automotivo', 'Químicos', 'Móveis e Decoração', 'Saúde e Beleza', 'Agronegócio', 'Outros'];
const UNITS = ['unidade', 'caixa', 'kg', 'metro', 'litro', 'pacote'];

const emptyForm = { title: '', description: '', category: '', price: '', min_order: 1, stock: 0, unit: 'unidade', images: [], tags: '', price_tiers: [] };

export default function SupplierProductsTab({ products, setProducts, user }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const openNew = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };
  
  const openEdit = (p) => {
    let parsedImages = [];
    let parsedTags = '';
    let parsedTiers = [];
    
    try { parsedImages = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []); } catch(e) {}
    try { parsedTags = typeof p.tags === 'string' ? JSON.parse(p.tags).join(', ') : (p.tags?.join(', ') || ''); } catch(e) {}
    try { parsedTiers = typeof p.price_tiers === 'string' ? JSON.parse(p.price_tiers) : (p.price_tiers || []); } catch(e) {}

    setForm({
      title: p.title || '', 
      description: p.description || '', 
      category: p.category || '',
      price: p.price || '', 
      min_order: p.min_order || 1, 
      stock: p.stock || 0,
      unit: p.unit || 'unidade', 
      images: parsedImages, 
      tags: parsedTags,
      price_tiers: parsedTiers,
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setForm({ ...form, images: [...form.images, imageUrl.trim()] });
      setImageUrl('');
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast({ title: 'Atenção', description: 'Para testar localmente, use a opção de Colar URL da imagem.', variant: 'destructive' });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.category || !form.price) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const data = {
        title: form.title,
        description: form.description,
        category: form.category,
        price: Number(form.price),
        min_order: Number(form.min_order),
        stock: Number(form.stock),
        supplier_id: user.id,
        supplier_name: user.company_name || user.full_name,
        status: 'active',
        images: JSON.stringify(form.images),
        tags: JSON.stringify(form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []),
        price_tiers: JSON.stringify(form.price_tiers.map(t => ({ ...t, price: Number(t.price), min_qty: Number(t.min_qty), max_qty: t.max_qty ? Number(t.max_qty) : null })))
      };

      if (editingId) {
        await base44.entities.Product.update(editingId, data);
        setProducts(products.map(p => p.id === editingId ? { ...p, ...data } : p));
        toast({ title: 'Produto atualizado!' });
      } else {
        const created = await base44.entities.Product.create(data);
        setProducts([created, ...products]);
        toast({ title: 'Produto criado!' });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ title: 'Erro', description: error.message || 'Falha ao salvar o produto.', variant: 'destructive' });
    } finally {
      setSubmitting(false); 
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.Product.delete(id);
      setProducts(products.filter(p => p.id !== id));
      toast({ title: 'Produto removido.' });
    } catch(err) {
      toast({ title: 'Erro ao remover', variant: 'destructive'});
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Novo Produto</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <label className="text-sm font-medium">Título *</label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Descrição</label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Categoria *</label>
                  <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Unidade</label>
                  <Select value={form.unit} onValueChange={v => setForm({ ...form, unit: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Preço (R$) *</label>
                  <Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Pedido Mín.</label>
                  <Input type="number" value={form.min_order} onChange={e => setForm({ ...form, min_order: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Estoque</label>
                  <Input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className="mt-1" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">Imagens</label>
                <div className="flex gap-2 mt-1">
                  <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Cole URL da imagem" className="flex-1" />
                  <Button type="button" variant="outline" size="sm" onClick={addImageUrl}>Adicionar</Button>
                </div>
                <div className="mt-2">
                  <label className="text-xs text-muted-foreground cursor-pointer hover:text-primary">
                    <input type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
                    Ou faça upload de uma imagem
                  </label>
                </div>
                {form.images.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {form.images.map((img, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl-lg p-0.5">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium">Tags (separadas por vírgula)</label>
                <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="industrial, atacado, premium" className="mt-1" />
              </div>

              <div className="border-t border-border pt-4">
                <PriceTierEditor
                  tiers={form.price_tiers}
                  onChange={(tiers) => setForm({ ...form, price_tiers: tiers })}
                />
              </div>

              <Button className="w-full mt-4" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingId ? 'Atualizar Produto' : 'Criar Produto'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium">Produto</th>
                <th className="text-left px-4 py-3 font-medium">Categoria</th>
                <th className="text-left px-4 py-3 font-medium">Preço</th>
                <th className="text-left px-4 py-3 font-medium">Estoque</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{p.category}</Badge></td>
                  <td className="px-4 py-3">R$ {p.price?.toFixed(2)}</td>
                  <td className="px-4 py-3">{p.stock || 0}</td>
                  <td className="px-4 py-3">
                    <Badge className={p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                      {p.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum produto cadastrado. Clique em "Novo Produto" para começar.</p>}
        </div>
      </div>
    </div>
  );
}