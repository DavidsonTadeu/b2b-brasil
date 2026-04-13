import { Tag } from 'lucide-react';

export default function PriceTierTable({ product, currentQty }) {
  const tiers = product?.price_tiers;
  if (!tiers || tiers.length === 0) return null;

  const sorted = [...tiers].sort((a, b) => a.min_qty - b.min_qty);
  const basePrice = sorted[0].price;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border">
        <Tag className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">Preços por Quantidade</span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-4 py-2 font-medium text-muted-foreground">Quantidade</th>
            <th className="text-left px-4 py-2 font-medium text-muted-foreground">Preço/un.</th>
            <th className="text-left px-4 py-2 font-medium text-muted-foreground">Desconto</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((tier, i) => {
            const isActive = currentQty >= tier.min_qty && (i === sorted.length - 1 || currentQty < sorted[i + 1].min_qty);
            const discount = basePrice > 0 ? ((basePrice - tier.price) / basePrice * 100) : 0;
            const rangeLabel = tier.max_qty
              ? `${tier.min_qty} – ${tier.max_qty} un.`
              : `+${tier.min_qty} un.`;

            return (
              <tr
                key={i}
                className={`transition-colors ${isActive ? 'bg-primary/5 font-semibold' : 'hover:bg-muted/20'}`}
              >
                <td className="px-4 py-2.5">
                  <span className={isActive ? 'text-primary' : ''}>{rangeLabel}</span>
                  {isActive && (
                    <span className="ml-2 text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">Atual</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <span className={isActive ? 'text-primary text-base' : ''}>
                    R$ {tier.price.toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  {discount > 0 ? (
                    <span className="text-green-600 font-medium">-{discount.toFixed(0)}%</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}