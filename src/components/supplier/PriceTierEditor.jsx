import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Tag } from 'lucide-react';

export default function PriceTierEditor({ tiers, onChange }) {
  const addTier = () => {
    const last = tiers[tiers.length - 1];
    const newMin = last ? (last.max_qty ? last.max_qty + 1 : last.min_qty + 100) : 1;
    onChange([...tiers, { min_qty: newMin, max_qty: null, price: '' }]);
  };

  const updateTier = (index, field, value) => {
    const updated = tiers.map((t, i) =>
      i === index ? { ...t, [field]: value === '' ? null : field === 'price' ? value : Number(value) } : t
    );
    onChange(updated);
  };

  const removeTier = (index) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-primary" />
          <label className="text-sm font-medium">Preços por Quantidade (Atacado)</label>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={addTier} className="gap-1 text-xs">
          <Plus className="h-3.5 w-3.5" /> Adicionar Faixa
        </Button>
      </div>

      {tiers.length === 0 && (
        <p className="text-xs text-muted-foreground pl-1">
          Nenhuma faixa definida. Será usado o preço base para todas as quantidades.
        </p>
      )}

      {tiers.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-px bg-border text-xs font-medium text-muted-foreground">
            <div className="bg-muted/50 px-3 py-2">Qtd. Mínima</div>
            <div className="bg-muted/50 px-3 py-2">Qtd. Máxima</div>
            <div className="bg-muted/50 px-3 py-2">Preço/un. (R$)</div>
            <div className="bg-muted/50 px-3 py-2"></div>
          </div>
          {tiers.map((tier, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-px bg-border">
              <div className="bg-card p-2">
                <Input
                  type="number"
                  min="1"
                  value={tier.min_qty ?? ''}
                  onChange={e => updateTier(i, 'min_qty', e.target.value)}
                  className="h-8 text-sm"
                  placeholder="ex: 1"
                />
              </div>
              <div className="bg-card p-2">
                <Input
                  type="number"
                  min="1"
                  value={tier.max_qty ?? ''}
                  onChange={e => updateTier(i, 'max_qty', e.target.value)}
                  className="h-8 text-sm"
                  placeholder="vazio = ilimitado"
                />
              </div>
              <div className="bg-card p-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={tier.price ?? ''}
                  onChange={e => updateTier(i, 'price', e.target.value)}
                  className="h-8 text-sm"
                  placeholder="ex: 4.50"
                />
              </div>
              <div className="bg-card p-2 flex items-center">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeTier(i)}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tiers.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Deixe "Qtd. Máxima" em branco na última faixa para indicar sem limite.
        </p>
      )}
    </div>
  );
}