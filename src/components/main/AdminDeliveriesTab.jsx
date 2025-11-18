import { useState, useEffect } from 'react';
import { Cartao, ConteudoCartao, CabecalhoCartao, TituloCartao } from '@/components/ui/cartao';
import { Botao } from '@/components/ui/botao';
import { Rotulo } from '@/components/ui/rotulo';
import { Selecao, ConteudoSelecao, ItemSelecao, GatilhoSelecao, ValorSelecao } from '@/components/ui/selecao';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { Entrada } from '@/components/ui/entrada';

export function AdminDeliveriesTab() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAllDeliveries();
  }, [filterStatus]);

  const loadAllDeliveries = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('entregas')
        .select(`
          *,
          usuario:usuarios!entregas_usuario_id_fkey(nome, email, bairro)
        `)
        .order('criado_em', { ascending: false });

      if (filterStatus !== 'todos') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao carregar entregas:', error);
        throw error;
      }

      setDeliveries(data || []);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao carregar entregas: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (deliveryId) => {
    try {
      const { data: delivery, error: fetchError } = await supabase
        .from('entregas')
        .select('*')
        .eq('id', deliveryId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('entregas')
        .update({ 
          status: 'aprovado',
          validado_em: new Date().toISOString()
        })
        .eq('id', deliveryId);

      if (updateError && updateError.message?.includes('check constraint')) {
        const { error: retryError } = await supabase
          .from('entregas')
          .update({ 
            status: 'validado',
            validado_em: new Date().toISOString()
          })
          .eq('id', deliveryId);
        
        if (retryError) {
          console.error('Erro ao atualizar status:', retryError);
          throw retryError;
        }
      } else if (updateError) {
        throw updateError;
      }

      if (delivery && delivery.usuario_id) {
        const { data: user, error: userError } = await supabase
          .from('usuarios')
          .select('pontos, entregas_validadas, peso_total')
          .eq('id', delivery.usuario_id)
          .single();

        if (!userError && user) {
          const novosPontos = (user.pontos || 0) + (delivery.pontos || 0);
          const novasEntregas = (user.entregas_validadas || 0) + 1;
          const novoPeso = (user.peso_total || 0) + (delivery.peso || 0);
          
          const { data: updatedUsers, error: updateUserError } = await supabase
            .from('usuarios')
            .update({
              pontos: novosPontos,
              entregas_validadas: novasEntregas,
              peso_total: novoPeso
            })
            .eq('id', delivery.usuario_id)
            .select('pontos, entregas_validadas, peso_total');
          
          if (updateUserError) {
            console.error('Erro ao atualizar pontos do usuário:', updateUserError);
            if (updateUserError.code === '42501' || updateUserError.message?.includes('permission') || updateUserError.message?.includes('policy')) {
              toast({ 
                variant: 'destructive', 
                title: 'Erro de Permissão', 
                description: 'Erro ao atualizar pontos. Verifique as permissões RLS.' 
              });
            }
            throw updateUserError;
          } else if (updatedUsers && updatedUsers.length > 0) {
            try {
              await supabase.rpc('check_and_award_certificates', {
                p_user_id: delivery.usuario_id
              });
            } catch (certErr) {
              console.warn('Erro ao verificar certificados:', certErr);
            }
          } else {
            await new Promise(resolve => setTimeout(resolve, 300));
            const { data: checkUser, error: checkError } = await supabase
              .from('usuarios')
              .select('pontos, entregas_validadas, peso_total')
              .eq('id', delivery.usuario_id)
              .single();
            
            if (checkError) {
              console.error('Erro ao verificar pontos:', checkError);
            } else if (checkUser && checkUser.pontos !== novosPontos) {
                toast({ 
                  variant: 'destructive', 
                  title: 'Aviso', 
                description: 'A entrega foi aprovada, mas os pontos podem não ter sido atualizados.' 
                });
            }
          }
        } else if (userError) {
          console.error('Erro ao buscar dados do usuário:', userError);
        }
      }

      toast({ title: 'Sucesso', description: 'Entrega aprovada com sucesso!' });
      loadAllDeliveries();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao aprovar entrega: ' + error.message });
    }
  };

  const handleReject = async (deliveryId) => {
    try {
      const { error } = await supabase
        .from('entregas')
        .update({ 
          status: 'cancelado'
        })
        .eq('id', deliveryId);

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Entrega rejeitada com sucesso!' });
      loadAllDeliveries();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao rejeitar entrega: ' + error.message });
    }
  };

  const getStatusBadge = (status) => {
    if (!status) {
      status = 'pendente';
    }

    const statusConfig = {
      'pendente': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendente', icon: Clock },
      'validado': { bg: 'bg-green-100', text: 'text-green-800', label: 'Validado', icon: CheckCircle },
      'cancelado': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado', icon: XCircle },
      'analise': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Em Análise', icon: Clock },
      'confirmado': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmado', icon: CheckCircle },
      'aprovado': { bg: 'bg-green-100', text: 'text-green-800', label: 'Aprovado', icon: CheckCircle },
      'rejeitado': { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeitado', icon: XCircle },
    };

    const config = statusConfig[status.toLowerCase()] || statusConfig['pendente'];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      delivery.titulo?.toLowerCase().includes(search) ||
      delivery.usuario?.nome?.toLowerCase().includes(search) ||
      delivery.usuario?.email?.toLowerCase().includes(search) ||
      delivery.local?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Cartao>
        <CabecalhoCartao>
          <TituloCartao className="text-green-800 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Gerenciar Entregas
          </TituloCartao>
        </CabecalhoCartao>
        <ConteudoCartao>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Rotulo htmlFor="status">Filtrar por Status</Rotulo>
              <Selecao value={filterStatus} onValueChange={setFilterStatus}>
                <GatilhoSelecao>
                  <ValorSelecao placeholder="Todos os status" />
                </GatilhoSelecao>
                <ConteudoSelecao>
                  <ItemSelecao value="todos">Todos</ItemSelecao>
                  <ItemSelecao value="pendente">Pendente</ItemSelecao>
                  <ItemSelecao value="analise">Em Análise</ItemSelecao>
                  <ItemSelecao value="validado">Validado</ItemSelecao>
                  <ItemSelecao value="confirmado">Confirmado</ItemSelecao>
                  <ItemSelecao value="cancelado">Cancelado</ItemSelecao>
                </ConteudoSelecao>
              </Selecao>
            </div>
            <div className="space-y-2">
              <Rotulo htmlFor="search">Buscar</Rotulo>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Entrada
                  id="search"
                  type="text"
                  placeholder="Buscar por título, usuário, email ou local..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Nenhuma entrega encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeliveries.map((delivery) => (
                <div key={delivery.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                  {delivery.imagem && (
                    <img 
                      src={delivery.imagem} 
                      alt="Foto da entrega"
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{delivery.titulo}</h3>
                          {getStatusBadge(delivery.status)}
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p><strong>Usuário:</strong> {delivery.usuario?.nome || 'N/A'} ({delivery.usuario?.email || 'N/A'})</p>
                          <p><strong>Bairro:</strong> {delivery.usuario?.bairro || 'N/A'}</p>
                          <p><strong>Peso:</strong> {delivery.peso} kg</p>
                          <p><strong>Local:</strong> {delivery.local}</p>
                          <p><strong>Pontos:</strong> {delivery.pontos} pontos</p>
                          <p><strong>Data:</strong> {new Date(delivery.criado_em).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</p>
                          {delivery.validado_em && (
                            <p><strong>Validado em:</strong> {new Date(delivery.validado_em).toLocaleDateString('pt-BR')}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {delivery.descricao && (
                      <p className="text-sm text-gray-600 mb-3">{delivery.descricao}</p>
                    )}

                    {delivery.materiais && delivery.materiais.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {delivery.materiais.map((material, idx) => (
                          <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            {material}
                          </span>
                        ))}
                      </div>
                    )}

                    {(!delivery.status || delivery.status === 'pendente' || delivery.status === 'analise') ? (
                      <div className="flex gap-2 pt-3 border-t">
                        <Botao
                          onClick={() => handleApprove(delivery.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprovar
                        </Botao>
                        <Botao
                          onClick={() => handleReject(delivery.id)}
                          variant="destructive"
                          className="flex-1"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeitar
                        </Botao>
                      </div>
                    ) : (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-gray-500">
                          Status: {delivery.status === 'validado' || delivery.status === 'aprovado' ? 'Aprovada' : delivery.status === 'cancelado' || delivery.status === 'rejeitado' ? 'Rejeitada' : delivery.status}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ConteudoCartao>
      </Cartao>
    </div>
  );
}

