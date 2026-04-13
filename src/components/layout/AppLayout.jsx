import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';

export default function AppLayout() {
  // Agora usamos o contexto global que atualiza instantaneamente no login
  const { user, isLoadingAuth } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user?.role === 'buyer' && user?.account_status === 'approved') {
      base44.entities.CartItem.filter({ buyer_id: user.id }).then(items => {
        setCartCount(items.length);
      }).catch(() => {});
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} cartCount={cartCount} />
      <main>
        <Outlet context={{ user, loading: isLoadingAuth, cartCount, setCartCount }} />
      </main>
    </div>
  );
}