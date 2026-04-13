import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Save, Building2, CheckCircle, Clock, XCircle } from 'lucide-react';

const STATUS_MAP = {
  approved: { label: 'Aprovado', icon: CheckCircle, class: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendente', icon: Clock, class: 'bg-amber-100 text-amber-700' },
  rejected: { label: 'Rejeitado', icon: XCircle, class: 'bg-red-100 text-red-700' },
};

export default function Profile() {
  const { user } = useOutletContext();
  const [form, setForm] = useState({
    company_name: user?.company_name || '',
    cnpj: user?.cnpj || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    about: user?.about || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(form);
      toast({ title: 'Perfil atualizado!' });
    } catch (error) {
      toast({ title: 'Erro ao atualizar perfil', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const status = STATUS_MAP[user.account_status] || STATUS_MAP.pending;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl">Meu Perfil</h1>
        <Badge className={status.class}>
          <StatusIcon className="h-3.5 w-3.5 mr-1" /> {status.label}
        </Badge>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{user.full_name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">
              {user.role === 'supplier' ? 'Fornecedor' : user.role === 'buyer' ? 'Comprador' : 'Administrador'}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Razão Social</label>
            <Input value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">CNPJ</label>
            <Input value={form.cnpj} onChange={e => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Telefone</label>
            <Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Estado</label>
            <Input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="Ex: SP" className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Cidade</label>
            <Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium">Endereço</label>
            <Input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="mt-1" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Sobre a empresa</label>
          <Textarea value={form.about} onChange={e => setForm({ ...form, about: e.target.value })} rows={3} className="mt-1" />
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}