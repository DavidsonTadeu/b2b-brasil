import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Building2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAppState } = useAuth();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('buyer');

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast({ title: 'Preencha todos os campos', variant: 'destructive' });

    setLoading(true);
    try {
      const emailLimpo = email.toLowerCase().trim();
      await base44.auth.login({ email: emailLimpo, password });
      await checkAppState();
      navigate(from, { replace: true });
    } catch (error) {
      toast({ 
        title: 'Erro ao fazer login', 
        description: error.message || 'Credenciais inválidas', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !fullName) return toast({ title: 'Preencha todos os campos', variant: 'destructive' });

    setLoading(true);
    try {
      const emailLimpo = email.toLowerCase().trim();
      await base44.auth.register({ email: emailLimpo, password, full_name: fullName, role });
      await checkAppState();
      toast({ title: 'Conta criada com sucesso!' });
      navigate(from, { replace: true });
    } catch (error) {
      toast({ 
        title: 'Erro ao criar conta', 
        description: error.message || 'Ocorreu um erro', 
        variant: 'destructive' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-2">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-heading">Bem-vindo ao BrasilB2B</CardTitle>
          <CardDescription>Acesse sua conta ou cadastre-se para começar</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Entrar
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Nome Completo / Empresa</Label>
                  <Input id="reg-name" placeholder="Sua Empresa Ltda" value={fullName} onChange={e => setFullName(e.target.value)} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">E-mail</Label>
                  <Input id="reg-email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password">Senha</Label>
                  <Input id="reg-password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Conta</Label>
                  <Select value={role} onValueChange={setRole} disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">Comprador</SelectItem>
                      <SelectItem value="supplier">Fornecedor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Criar Conta
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}