import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ProductCard from '@/components/products/ProductCard';
import CategoryGrid from '@/components/products/CategoryGrid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, SlidersHorizontal, X, TrendingUp, Shield, Truck } from 'lucide-react';

const CATEGORIES = ['Eletrônicos', 'Têxtil e Confecção', 'Máquinas e Equipamentos', 'Alimentos e Bebidas', 'Embalagens', 'Construção Civil', 'Automotivo', 'Químicos', 'Móveis e Decoração', 'Saúde e Beleza', 'Agronegócio', 'Outros'];

export default function Home() {
  const { user } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('-created_date');

  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search') || '';
  const categoryParam = urlParams.get('category') || '';

  useEffect(() => {
    if (categoryParam && !selectedCategory) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    setLoading(true);
    const filter = { status: 'active' };
    const cat = selectedCategory || categoryParam;
    if (cat) filter.category = cat;

    base44.entities.Product.filter(filter, sortBy, 50).then(data => {
      let filtered = data;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = data.filter(p =>
          p.title?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some(t => t.toLowerCase().includes(q))
        );
      }
      setProducts(filtered);
      setLoading(false);
    });
  }, [selectedCategory, sortBy, searchQuery, categoryParam]);

  const clearFilters = () => {
    setSelectedCategory('');
    window.history.replaceState({}, '', '/');
  };

  const activeCategory = selectedCategory || categoryParam;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight">
              O Marketplace B2B
              <span className="text-primary"> do Brasil</span>
            </h1>
            <p className="mt-4 text-muted-foreground text-lg">
              Conecte-se diretamente com fornecedores verificados. Negocie volumes, solicite cotações e faça compras com segurança.
            </p>
          </div>
          <div className="flex gap-6 mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              <span>Fornecedores verificados</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Preços por volume</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" />
              <span>Logística integrada</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Categories */}
        <section>
          <h2 className="font-heading font-semibold text-xl mb-4">Explore por categoria</h2>
          <CategoryGrid />
        </section>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filtros</span>
            {activeCategory && (
              <Badge variant="secondary" className="gap-1">
                {activeCategory}
                <button onClick={clearFilters}><X className="h-3 w-3" /></button>
              </Badge>
            )}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                "{searchQuery}"
                <button onClick={() => window.history.replaceState({}, '', '/')}><X className="h-3 w-3" /></button>
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48 h-9 text-sm">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-created_date">Mais recentes</SelectItem>
                <SelectItem value="price">Menor preço</SelectItem>
                <SelectItem value="-price">Maior preço</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Nenhum produto encontrado</p>
            <p className="text-sm text-muted-foreground mt-1">Tente ajustar os filtros de busca</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}