import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const STATUS_BADGE = {
  approved: { label: 'Aprovado', class: 'bg-green-100 text-green-700' },
  pending: { label: 'Pendente', class: 'bg-amber-100 text-amber-700' },
  rejected: { label: 'Rejeitado', class: 'bg-red-100 text-red-700' },
};

export default function AdminUsersTab({ users, setUsers }) {
  const handleApproval = async (userId, newStatus) => {
    await base44.entities.User.update(userId, { account_status: newStatus });
    setUsers(users.map(u => u.id === userId ? { ...u, account_status: newStatus } : u));
    toast({ title: newStatus === 'approved' ? 'Usuário aprovado!' : 'Usuário rejeitado.' });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 font-medium">Empresa</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-right px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(u => {
              const status = STATUS_BADGE[u.account_status] || STATUS_BADGE.pending;
              return (
                <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role === 'supplier' ? 'Fornecedor' : u.role === 'buyer' ? 'Comprador' : 'Admin'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.company_name || '—'}</td>
                  <td className="px-4 py-3"><Badge className={status.class}>{status.label}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    {u.account_status === 'pending' && u.role !== 'admin' && (
                      <div className="flex items-center gap-2 justify-end">
                        <Button size="sm" variant="outline" className="text-green-700 border-green-200 hover:bg-green-50 gap-1" onClick={() => handleApproval(u.id, 'approved')}>
                          <CheckCircle className="h-3.5 w-3.5" /> Aprovar
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-700 border-red-200 hover:bg-red-50 gap-1" onClick={() => handleApproval(u.id, 'rejected')}>
                          <XCircle className="h-3.5 w-3.5" /> Rejeitar
                        </Button>
                      </div>
                    )}
                    {u.account_status === 'approved' && u.role !== 'admin' && (
                      <Button size="sm" variant="ghost" className="text-red-600 gap-1" onClick={() => handleApproval(u.id, 'rejected')}>
                        <XCircle className="h-3.5 w-3.5" /> Bloquear
                      </Button>
                    )}
                    {u.account_status === 'rejected' && (
                      <Button size="sm" variant="ghost" className="text-green-600 gap-1" onClick={() => handleApproval(u.id, 'approved')}>
                        <CheckCircle className="h-3.5 w-3.5" /> Reativar
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}