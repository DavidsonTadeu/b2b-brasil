import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Star, Package } from 'lucide-react';

export default function ProductCard({ product }) {
  let parsedImages = [];
  try { 
    parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : (product.images || []); 
  } catch(e) {}
  
  const imageUrl = parsedImages[0] || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&q=80';

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300">
      
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img 
          src={imageUrl}
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {product.min_order > 1 &&
        <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground text-xs">
            Mín. {product.min_order} {product.unit || 'un.'}
          </Badge>
        }
      </div>
      <div className="p-4 space-y-2">
        <p className="text-xs text-muted-foreground">{product.supplier_name || 'Fornecedor'}</p>
        <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold font-heading text-primary">
            R$ {product.price?.toFixed(2)}
          </span>
          <span className="text-xs text-muted-foreground">/{product.unit || 'un.'}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <Badge variant="secondary" className="text-xs font-normal">
            {product.category}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Package className="h-3 w-3" />
            {product.stock || 0} em estoque
          </div>
        </div>
      </div>
    </Link>
  );
}