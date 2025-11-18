import { useState, useEffect } from 'react';
import { Cartao, ConteudoCartao, CabecalhoCartao, TituloCartao } from '@/components/ui/cartao';
import { Botao } from '@/components/ui/botao';
import { Dialogo, ConteudoDialogo, DescricaoDialogo, CabecalhoDialogo, TituloDialogo } from '@/components/ui/dialogo';
import { Gift, Leaf, MapPin, Phone, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import VisualizacaoMapa from './VisualizacaoMapa';

const rewardConfig = {
  'Café Orgânico 250g': {
    imagem: '/recompensas/cafe-organico.png',
    endereco: 'Estr. do Barbalho, 403 - Iputinga, Recife - PE, 50800-290',
    horario: '06:00–20:00',
    telefone: '(81) 99793-0217',
    local: 'Padaria Central',
    latitude: -8.0333,
    longitude: -34.9478
  },
  'Arroz Orgânico 1kg': {
    imagem: '/recompensas/arroz-organico.png',
    endereco: 'R. São Bento do Norte, 17 - Cordeiro, Recife - PE, 50771-550',
    horario: '06:30–20:30',
    telefone: '(81) 3446-6356',
    local: 'Mercadinho São José',
    latitude: -8.0500,
    longitude: -34.9200
  },
  'Feijão Orgânico 1kg': {
    imagem: '/recompensas/feijao-organico.png',
    endereco: 'R. São Bento do Norte, 17 - Cordeiro, Recife - PE, 50771-550',
    horario: '06:30–20:30',
    telefone: '(81) 3446-6356',
    local: 'Mercadinho São José',
    latitude: -8.0500,
    longitude: -34.9200
  },
  'Mel Orgânico 300g': {
    imagem: '/recompensas/mel-organico.png',
    endereco: 'R. Guimarães Peixoto, 15 - Tamarineira, Recife - PE, 52051-305',
    horario: '08:00–19:00',
    telefone: '(81) 99204-8379',
    local: 'Mercearia Natural',
    latitude: -8.0300,
    longitude: -34.9000
  },
  'Desconto Feira Orgânica': {
    imagem: '/recompensas/desconto-feira.png',
    endereco: 'R. do Futuro, 1309 - Graças, Recife - PE, 52050-660',
    horario: '06:00–22:00',
    telefone: '(81) 99201-8526',
    local: 'Hortimercado Verdfruit',
    latitude: -8.0500,
    longitude: -34.9000
  },
  'Azeite Extra Virgem 500ml': {
    imagem: '/recompensas/azeite.png',
    endereco: 'Av. Norte Miguel Arraes de Alencar, S/N - Encruzilhada, Recife - PE, 52041-005',
    horario: '07:00–22:00',
    telefone: '(81) 98942-6899',
    local: 'Supermercado Recibom',
    latitude: -8.0400,
    longitude: -34.8800
  },
  'Vale Cinema': {
    imagem: '/recompensas/vale-cinema.png',
    endereco: 'Shopping Recife. Av. Padre Carapuceiro, 777 Loja BV.174 - Boa Viagem, Recife - PE, 51020-900',
    horario: '13:00–22:00',
    telefone: 'Não Disponível',
    local: 'UCI Cinemas - Shopping Recife',
    latitude: -8.1197,
    longitude: -34.9047
  },
  'Camiseta Eco': {
    imagem: '/recompensas/camiseta-eco.png',
    endereco: 'Av. Sul Gov. Cid Sampaio, 110 - São José, Recife - PE, 50090-010',
    horario: '07:00–15:00',
    telefone: '(81) 3424-7481',
    local: 'Comunidade dos Pequenos Profetas',
    latitude: -8.0600,
    longitude: -34.8700
  },
  'Curso Compostagem': {
    imagem: '/recompensas/curso-compostagem.png',
    endereco: 'R. Padre Albuquerque, 398 - Cidade Universitária, Recife - PE, 50740-520',
    horario: '09:00–17:00',
    telefone: 'Não Disponível',
    local: 'BERSO - Cidade Universitária',
    latitude: -8.0131,
    longitude: -34.9458
  },
  'Kit Jardinagem': {
    imagem: '/recompensas/kit-jardinagem.png',
    endereco: 'Rua Sairé, Nº 005 - Casa A, Barra de Jangada, Jaboatão dos Guararapes, PE, 54495-405',
    horario: '08:00–18:00',
    telefone: '(81) 98777-0328',
    local: 'Recife Minhocas e Compostagem',
    latitude: -8.1500,
    longitude: -34.9500
  }
};

const getRewardConfig = (titulo) => {
  if (!titulo) return null;
  for (const [key, config] of Object.entries(rewardConfig)) {
    if (titulo.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(titulo.toLowerCase())) {
      return config;
    }
  }
  return null;
};

export function RewardsTab({ products, userPoints, userId, onRefresh }) {
  const [localProducts, setLocalProducts] = useState(products);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  const handleShowLocation = (product) => {
    setSelectedReward(product);
    setIsLocationOpen(true);
  };

  const handleRedeem = async (product) => {
    if (userPoints < product.pontos) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Pontos insuficientes!' });
      return;
    }

    if (product.quantidade_disponivel !== null && product.quantidade_disponivel <= 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Produto esgotado!' });
      return;
    }

    try {
      const orderNumber = `ORD-${Date.now()}`;
      const rewardConfig = getRewardConfig(product.titulo);
      const imagemProduto = rewardConfig?.imagem || product.imagem;

      const { error: redemptionError } = await supabase
        .from('resgates')
        .insert({
          usuario_id: userId,
          recompensa_id: product.id,
          recompensa_titulo: product.titulo,
          recompensa_pontos: product.pontos,
          recompensa_mercados: product.mercados,
          recompensa_imagem: imagemProduto,
          numero_pedido: orderNumber,
          nome: 'Usuário',
          cpf: '000.000.000-00',
          telefone: '(00) 00000-0000',
          status: 'resgatado'
        });

      if (redemptionError) {
        console.error('Erro ao criar resgate:', redemptionError);
        throw redemptionError;
      }

      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ pontos: userPoints - product.pontos })
        .eq('id', userId);

      if (updateError) {
        console.error('Erro ao atualizar pontos:', updateError);
        throw updateError;
      }

      if (product.quantidade_disponivel !== null && product.quantidade_disponivel > 0) {
        const novaQuantidade = product.quantidade_disponivel - 1;
        
        setLocalProducts(prevProducts => 
          prevProducts.map(p => 
            p.id === product.id 
              ? { ...p, quantidade_disponivel: novaQuantidade }
              : p
          )
        );
        
        const { data: updatedData, error: stockError } = await supabase
          .from('recompensas')
          .update({ quantidade_disponivel: novaQuantidade })
          .eq('id', product.id)
          .select('id, quantidade_disponivel');

        if (stockError) {
          console.error('Erro ao atualizar estoque:', stockError);
          setLocalProducts(prevProducts => 
            prevProducts.map(p => 
              p.id === product.id 
                ? { ...p, quantidade_disponivel: product.quantidade_disponivel }
                : p
            )
          );
          toast({ 
            variant: 'destructive', 
            title: 'Aviso', 
            description: `Resgate criado, mas estoque não foi atualizado. Erro: ${stockError.message}` 
          });
        } else {
          if (!updatedData || updatedData.length === 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const { data: checkData, error: checkError } = await supabase
              .from('recompensas')
              .select('id, quantidade_disponivel')
              .eq('id', product.id)
              .single();
            
            if (checkError) {
              console.error('Erro ao verificar:', checkError);
            } else {
              if (checkData.quantidade_disponivel !== novaQuantidade) {
                console.error('Atualização não foi aplicada');
                setLocalProducts(prevProducts => 
                  prevProducts.map(p => 
                    p.id === product.id 
                      ? { ...p, quantidade_disponivel: product.quantidade_disponivel }
                      : p
                  )
                );
                toast({ 
                  variant: 'destructive', 
                  title: 'Erro', 
                  description: 'A atualização do estoque não foi aplicada.' 
                });
              }
            }
          }
        }
      }

      toast({ title: 'Sucesso', description: `Produto resgatado! Número do pedido: ${orderNumber}` });
      
      setTimeout(() => {
        onRefresh();
      }, 1000);
    } catch (error) {
      console.error('Erro completo:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao resgatar produto: ' + error.message });
    }
  };

  return (
    <div className="space-y-4">
      <Cartao>
        <CabecalhoCartao>
          <TituloCartao className="text-green-800 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Recompensas Disponíveis
          </TituloCartao>
          <p className="text-sm text-gray-600 mt-2">
            Resgate sua recompensa e vá até o local presencialmente para adquirir!
          </p>
        </CabecalhoCartao>
        <ConteudoCartao>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {localProducts.map((product) => {
              const config = getRewardConfig(product.titulo);
              return (
                <div key={product.id} className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                  {config?.imagem && (
                    <div className="w-full h-32 bg-gray-50 overflow-hidden border-b" id={`reward-container-${product.id}`}>
                      <img
                        src={config.imagem}
                        alt={`Foto ${product.titulo}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const container = document.getElementById(`reward-container-${product.id}`);
                          if (container && !container.querySelector('.placeholder-text')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'placeholder-text text-xs text-gray-400 text-center flex items-center justify-center h-full';
                            placeholder.textContent = 'Foto em breve';
                            container.appendChild(placeholder);
                          }
                        }}
                      />
                    </div>
                  )}
                  {!config?.imagem && product.imagem && (
                    <div className="w-full h-32 overflow-hidden border-b">
                      <img 
                        src={product.imagem} 
                        alt={product.titulo}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {product.titulo}
                    </h3>
                    
                    {product.descricao && (
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {product.descricao}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-green-600" />
                        <span className="text-sm font-bold text-green-600">
                          {product.pontos} pontos
                        </span>
                      </div>
                      {product.quantidade_disponivel !== null && (
                        <span className="text-xs text-gray-500">
                          {product.quantidade_disponivel} {product.quantidade_disponivel === 1 ? 'disponível' : 'disponíveis'}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Botao
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleShowLocation(product)}
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        Localização
                      </Botao>
                      {product.quantidade_disponivel !== null && product.quantidade_disponivel <= 0 ? (
                        <Botao 
                          size="sm" 
                          className="flex-1 bg-gray-400 cursor-not-allowed text-gray-600"
                          disabled
                        >
                          Esgotado
                        </Botao>
                      ) : (
                        <Botao 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          disabled={userPoints < product.pontos}
                          onClick={() => handleRedeem(product)}
                        >
                          Resgatar
                        </Botao>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ConteudoCartao>
      </Cartao>

      <Dialogo open={isLocationOpen} onOpenChange={setIsLocationOpen}>
        <ConteudoDialogo className="max-w-3xl">
          <CabecalhoDialogo>
            <TituloDialogo className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localização - {selectedReward?.titulo}
            </TituloDialogo>
            <DescricaoDialogo>
              Localização no mapa e informações de contato
            </DescricaoDialogo>
          </CabecalhoDialogo>
          {selectedReward && (() => {
            const config = getRewardConfig(selectedReward.titulo);
            return (
              <div className="space-y-4">
                {config?.latitude && config?.longitude ? (
                  <VisualizacaoMapa
                    latitude={config.latitude}
                    longitude={config.longitude}
                    locationName={config.local || selectedReward.mercados?.[0] || selectedReward.titulo}
                    address={config.endereco || 'Não disponível'}
                  />
                ) : null}
                
                <div className="text-sm text-muted-foreground space-y-3">
                  <div>
                    <p className="font-medium">{config?.local || selectedReward.mercados?.[0] || 'Não disponível'}</p>
                    <p className="text-xs text-gray-500 mt-1">{config?.endereco || 'Não disponível'}</p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Clock className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Horário de Atendimento</p>
                      <p className="text-sm text-gray-600">{config?.horario || 'Não disponível'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Telefone</p>
                      <p className="text-sm text-gray-600">{config?.telefone || 'Não disponível'}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </ConteudoDialogo>
      </Dialogo>
    </div>
  );
}
