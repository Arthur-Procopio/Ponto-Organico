import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Botao } from '@/components/ui/botao';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { Loader2, Shield, ArrowLeft } from 'lucide-react';
import { AdminDeliveriesTab } from '@/components/main/AdminDeliveriesTab';

export default function Admin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAuthAndAdmin();
  }, []);

  const checkAuthAndAdmin = async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Perfil não encontrado.' });
        navigate('/');
        return;
      }

      setUserProfile(profile);

      const adminEmails = ['admin@pontoorganico.com', 'arthur@example.com'];
      const isUserAdmin = profile.tipo === 'admin' || profile.role === 'admin' || adminEmails.includes(profile.email?.toLowerCase());
      
      if (!isUserAdmin) {
        toast({ variant: 'destructive', title: 'Acesso Negado', description: 'Você não tem permissão para acessar esta área.' });
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao verificar permissões: ' + error.message });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast({ title: 'Sucesso', description: 'Logout realizado com sucesso!' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4 lg:p-6 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Botao
              onClick={() => navigate('/')}
              variant="ghost"
              className="text-white hover:bg-green-700"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Botao>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" />
              <div>
                <h1 className="font-bold text-lg">Painel Administrativo</h1>
                <p className="text-sm text-green-100">{userProfile?.nome}</p>
              </div>
            </div>
          </div>
          <Botao
            onClick={handleLogout}
            variant="ghost"
            className="text-white hover:bg-green-700"
            size="sm"
          >
            Sair
          </Botao>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 lg:p-8">
        <AdminDeliveriesTab />
      </main>
    </div>
  );
}

