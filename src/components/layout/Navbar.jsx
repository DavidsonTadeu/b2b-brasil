import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, User, LogOut, LayoutDashboard, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function Navbar({ user, cartCount = 0 }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'supplier') return '/supplier';
    return '/buyer';
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-lg">B</span>
            </div>
            <span className="font-heading font-bold text-lg text-foreground hidden sm:block">BrasilB2B</span>
          </Link>

          {/* Search - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
            <div className="flex w-full rounded-lg border border-border overflow-hidden bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos, fornecedores..."
                className="flex-1 px-4 py-2 bg-transparent text-sm focus:outline-none" />
              
              <button type="submit" className="px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {user?.role === 'buyer' && user?.account_status === 'approved' &&
            <Link to="/cart" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 &&
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground">
                    {cartCount}
                  </Badge>
              }
              </Link>
            }

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {!user ? (
                  <DropdownMenuItem onClick={() => navigate('/login')}>
                    <LogIn className="mr-2 h-4 w-4" /> Entrar / Cadastrar
                  </DropdownMenuItem>
                ) : (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role} • {user.account_status === 'approved' ? 'Aprovado' : user.account_status === 'pending' ? 'Pendente' : 'Rejeitado'}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate(getDashboardLink())}>
                      <LayoutDashboard className="mr-2 h-4 w-4" /> Painel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" /> Meu Perfil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => base44.auth.logout()}>
                      <LogOut className="mr-2 h-4 w-4" /> Sair
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {mobileOpen &&
        <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="flex rounded-lg border border-border overflow-hidden bg-background">
              <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar produtos..."
              className="flex-1 px-4 py-2 bg-transparent text-sm focus:outline-none" />
              
              <button type="submit" className="px-4 bg-primary text-primary-foreground">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        }
      </div>
    </header>
  );
}