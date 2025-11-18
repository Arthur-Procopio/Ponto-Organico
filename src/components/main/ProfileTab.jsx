import { Cartao, ConteudoCartao, CabecalhoCartao, TituloCartao } from '@/components/ui/cartao';
import { User, Droplets, TreePine, Leaf } from 'lucide-react';

const calculateWaterSaved = (pesoTotal) => {
  return (pesoTotal || 0) * 50;
};

const calculateTreesSaved = (pesoTotal) => {
  return (pesoTotal || 0) * 0.1;
};

export function ProfileTab({ userProfile }) {
  const aguaEconomizada = calculateWaterSaved(userProfile?.peso_total);
  const arvoresSalvas = calculateTreesSaved(userProfile?.peso_total);

  return (
    <div className="space-y-4">
      <Cartao>
        <CabecalhoCartao>
          <TituloCartao className="text-green-800 flex items-center gap-2">
            <User className="w-5 h-5" />
            Meu Impacto Ambiental
          </TituloCartao>
        </CabecalhoCartao>
        <ConteudoCartao>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Leaf className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-xs text-gray-600">KG Coletados</p>
              <p className="text-2xl font-bold text-green-700">{userProfile?.peso_total || 0}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Droplets className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-xs text-gray-600">Água Economizada (L)</p>
              <p className="text-2xl font-bold text-blue-700">{aguaEconomizada.toFixed(1)}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 text-center">
              <TreePine className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <p className="text-xs text-gray-600">Árvores Salvas</p>
              <p className="text-2xl font-bold text-emerald-700">{arvoresSalvas.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 text-gray-600 font-bold text-lg flex items-center justify-center">Nível</div>
              <p className="text-xs text-gray-600">Nível Atual</p>
              <p className="text-2xl font-bold text-gray-700">{userProfile?.nivel || 'Eco Iniciante'}</p>
            </div>
          </div>
        </ConteudoCartao>
      </Cartao>

      <Cartao>
        <CabecalhoCartao>
          <TituloCartao className="text-green-800">Estatísticas</TituloCartao>
        </CabecalhoCartao>
        <ConteudoCartao>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total de Entregas</span>
              <span className="font-bold text-green-600">{userProfile?.entregas_validadas || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Nível Atual</span>
              <span className="font-bold text-green-600">{userProfile?.nivel || 'Eco Iniciante'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pontos Totais</span>
              <span className="font-bold text-green-600">{userProfile?.pontos || 0}</span>
            </div>
          </div>
        </ConteudoCartao>
      </Cartao>
    </div>
  );
}

