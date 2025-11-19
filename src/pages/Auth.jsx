import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Botao } from '@/components/ui/botao';
import { Entrada } from '@/components/ui/entrada';
import { Rotulo } from '@/components/ui/rotulo';
import { Cartao, ConteudoCartao, DescricaoCartao, CabecalhoCartao, TituloCartao } from '@/components/ui/cartao';
import { toast } from '@/hooks/use-toast';
import { Leaf, Loader2 } from 'lucide-react';
import {
  Selecao,
  ConteudoSelecao,
  ItemSelecao,
  GatilhoSelecao,
  ValorSelecao,
} from "@/components/ui/selecao";

const availableNeighborhoods = [
  'Boa Viagem',
  'Casa Forte',
  'Santo Amaro',
  'Afogados',
  'Boa Vista',
  'Graças',
  'Espinheiro',
  'Tamarineira',
  'Torre',
  'Madalena',
  'Pina',
  'Piedade',
  'Cajueiro',
  'Ilha do Leite',
  'Outro'
];

export default function Auth() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    neighborhood: ''
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              neighborhood: formData.neighborhood
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (signUpError) throw signUpError;

        if (signUpData.user) {
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const { error: profileError } = await supabase
            .from('usuarios')
            .upsert({
              id: signUpData.user.id,
              email: formData.email,
              nome: formData.fullName || 'Usuário',
              bairro: formData.neighborhood || 'Não informado',
              pontos: 0,
              peso_total: 0,
              entregas_validadas: 0,
              total_entregas: 0
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('Erro ao criar perfil:', profileError);
            toast({ 
              variant: 'destructive', 
              title: 'Aviso', 
              description: 'Conta criada, mas houve um problema ao salvar o perfil. Tente fazer login novamente.' 
            });
          } else {
            const { error: updateError } = await supabase
              .from('usuarios')
              .update({ 
                nome: formData.fullName,
                bairro: formData.neighborhood
              })
              .eq('id', signUpData.user.id);
            
            if (updateError) {
              console.error('Erro ao atualizar nome:', updateError);
            }
          }
        }

        toast({ 
          title: 'Sucesso', 
          description: 'Conta criada com sucesso! Verifique seu email para autenticar sua conta e começar a usar o Ponto Orgânico! 🌱📧' 
        });
        navigate('/');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        toast({ title: 'Sucesso', description: 'Login realizado com sucesso! 🌱' });
        navigate('/');
      }
      } catch (error) {
        toast({ variant: 'destructive', title: 'Erro', description: error.message || 'Erro ao processar sua solicitação' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center p-4">
      <Cartao className="w-full max-w-md shadow-2xl border-2 border-green-200">
        <CabecalhoCartao className="text-center space-y-4 pb-8">
          <div className="mx-auto mb-2 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-green-200">
            <img src="/logo-pontorganico.png" alt="Ponto Orgânico" className="w-20 h-20" />
          </div>
          <TituloCartao className="text-3xl font-bold text-green-800">
            Ponto Orgânico
          </TituloCartao>
          <DescricaoCartao className="text-base">
            {isSignUp ? 'Crie sua conta e comece a fazer a diferença 🌱' : 'Entre na sua conta e continue sua jornada verde 🌿'}
          </DescricaoCartao>
        </CabecalhoCartao>
        <ConteudoCartao>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <>
                <div className="space-y-2">
                  <Rotulo htmlFor="fullName">Nome Completo</Rotulo>
                  <Entrada
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Rotulo htmlFor="neighborhood">Bairro</Rotulo>
                  <Selecao
                    value={formData.neighborhood}
                    onValueChange={(value) => setFormData({ ...formData, neighborhood: value })}
                    required
                  >
                    <GatilhoSelecao>
                      <ValorSelecao placeholder="Selecione seu bairro" />
                    </GatilhoSelecao>
                    <ConteudoSelecao>
                      {availableNeighborhoods.map((neighborhood) => (
                        <ItemSelecao key={neighborhood} value={neighborhood}>
                          {neighborhood}
                        </ItemSelecao>
                      ))}
                    </ConteudoSelecao>
                  </Selecao>
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Rotulo htmlFor="email">Email</Rotulo>
              <Entrada
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Rotulo htmlFor="password">Senha</Rotulo>
              <Entrada
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <Botao 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                isSignUp ? 'Criar Conta' : 'Entrar'
              )}
            </Botao>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-green-600 hover:underline"
              >
                {isSignUp ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Cadastre-se'}
              </button>
            </div>
          </form>
        </ConteudoCartao>
      </Cartao>
    </div>
  );
}

