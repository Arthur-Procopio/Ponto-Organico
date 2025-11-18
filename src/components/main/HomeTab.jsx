import { Cartao, ConteudoCartao, CabecalhoCartao, TituloCartao } from '@/components/ui/cartao';
import { Home, Recycle } from 'lucide-react';
import { NewDeliveryDialog } from './NewDeliveryDialog';

export function HomeTab({ userId, deliveries, onRefresh }) {
  return (
    <div className="space-y-4">
      <NewDeliveryDialog userId={userId} onSuccess={onRefresh} />
      
      <Cartao>
        <CabecalhoCartao>
          <TituloCartao className="text-green-800 flex items-center gap-2">
            <Home className="w-5 h-5" />
            Minhas Entregas
          </TituloCartao>
        </CabecalhoCartao>
        <ConteudoCartao>
          {deliveries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Recycle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma entrega registrada ainda</p>
              <p className="text-sm mt-1">Registre sua primeira entrega acima!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveries.map((delivery) => (
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
                      <div>
                        <h3 className="font-semibold text-gray-900">{delivery.titulo}</h3>
                        <p className="text-sm text-gray-600 mt-1">{delivery.peso} kg</p>
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {delivery.local}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(delivery.criado_em).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
                        delivery.status === 'validado' || delivery.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                        delivery.status === 'confirmado' ? 'bg-blue-100 text-blue-800' :
                        delivery.status === 'cancelado' || delivery.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                        delivery.status === 'analise' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {delivery.status === 'validado' || delivery.status === 'aprovado' ? 'Aprovado' :
                         delivery.status === 'confirmado' ? 'Confirmado' :
                         delivery.status === 'cancelado' || delivery.status === 'rejeitado' ? 'Rejeitado' :
                         delivery.status === 'analise' ? 'Em Análise' : 'Pendente'}
                      </span>
                    </div>
                    {delivery.descricao && (
                      <p className="text-sm text-gray-600 mb-2">{delivery.descricao}</p>
                    )}
                    {delivery.materiais && delivery.materiais.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {delivery.materiais.map((material, idx) => (
                          <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            {material}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Pontos ganhos:</span>
                        <span className="font-semibold text-green-600">+{delivery.pontos} pontos</span>
                      </div>
                    </div>
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

