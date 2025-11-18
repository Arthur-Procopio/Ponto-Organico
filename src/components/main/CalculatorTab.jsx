import { useState, useEffect } from 'react';
import { Cartao, ConteudoCartao, CabecalhoCartao, TituloCartao } from '@/components/ui/cartao';
import { Selecao, ConteudoSelecao, ItemSelecao, GatilhoSelecao, ValorSelecao } from '@/components/ui/selecao';
import { Entrada } from '@/components/ui/entrada';
import { Rotulo } from '@/components/ui/rotulo';
import { Botao } from '@/components/ui/botao';
import { Calculator, Droplets, Leaf, TreePine, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function CalculatorTab() {
  const [organicItems, setOrganicItems] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    loadOrganicItems();
  }, []);

  const loadOrganicItems = async () => {
    const { data } = await supabase
      .from('tipos_materiais_organicos')
      .select('*')
      .order('nome');
    
    if (data) {
      setOrganicItems(data);
      if (data.length > 0) {
        setSelectedItemId(data[0].id.toString());
      }
    }
  };

  const addItem = () => {
    if (!selectedItemId || quantity <= 0) return;

    const organicItem = organicItems.find(i => i.id.toString() === selectedItemId);
    if (!organicItem) return;

    const weightPerUnit = organicItem.peso_por_unidade || 0.1;
    const totalKg = quantity * weightPerUnit;

    const newItem = {
      id: Date.now().toString(),
      organicItemId: selectedItemId,
      organicItemName: organicItem.nome,
      quantity: quantity,
      totalKg: totalKg
    };

    setItems([...items, newItem]);
    setQuantity(0);
  };

  const removeItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const calculateTotalImpact = () => {
    const totalKg = items.reduce((sum, item) => sum + item.totalKg, 0);
    
    let totalPoints = 0;
    items.forEach(item => {
      const organicItem = organicItems.find(i => i.id.toString() === item.organicItemId);
      if (organicItem) {
        totalPoints += item.totalKg * (organicItem.pontos_por_kg || 10);
      }
    });

    return {
      points: totalPoints,
      xp: totalKg * 5,
      water: totalKg * 50,
      co2: totalKg * 2,
      trees: totalKg * 0.1
    };
  };

  const impact = calculateTotalImpact();
  const totalKg = items.reduce((sum, item) => sum + item.totalKg, 0);

  return (
    <div className="space-y-4">
      <Cartao>
        <CabecalhoCartao>
          <TituloCartao className="text-green-800 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Calculadora de Impacto
          </TituloCartao>
        </CabecalhoCartao>
        <ConteudoCartao className="space-y-4">
          <div className="space-y-2">
            <Rotulo htmlFor="item">Adicionar Item Orgânico</Rotulo>
            <Selecao value={selectedItemId} onValueChange={setSelectedItemId}>
              <GatilhoSelecao>
                <ValorSelecao placeholder="Selecione um item" />
              </GatilhoSelecao>
              <ConteudoSelecao>
                {organicItems.map(item => (
                  <ItemSelecao key={item.id} value={item.id.toString()}>
                    {item.icone} {item.nome}
                  </ItemSelecao>
                ))}
              </ConteudoSelecao>
            </Selecao>
          </div>

          <div className="space-y-2">
            <Rotulo htmlFor="quantity">Quantidade</Rotulo>
            <div className="flex gap-2">
              <Entrada
                id="quantity"
                type="number"
                min="0"
                step="1"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                placeholder="Quantos itens?"
                className="flex-1"
              />
              <Botao 
                onClick={addItem}
                disabled={!selectedItemId || quantity <= 0}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
              </Botao>
            </div>
          </div>

          {items.length > 0 && (
            <div className="space-y-2">
              <Rotulo>Itens Adicionados</Rotulo>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.organicItemName}</p>
                      <p className="text-xs text-gray-600">{item.quantity}x = {item.totalKg.toFixed(1)} kg</p>
                    </div>
                    <Botao
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Botao>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm font-semibold text-gray-900">
                  Total: {totalKg.toFixed(1)} kg
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <Leaf className="w-6 h-6 mx-auto mb-1 text-green-600" />
              <p className="text-xs text-gray-600">Pontos</p>
              <p className="text-lg font-bold text-green-700">{impact.points.toFixed(0)}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <Droplets className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <p className="text-xs text-gray-600">Água (L)</p>
              <p className="text-lg font-bold text-blue-700">{impact.water.toFixed(1)}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <TreePine className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
              <p className="text-xs text-gray-600">Árvores</p>
              <p className="text-lg font-bold text-emerald-700">{impact.trees.toFixed(2)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="w-6 h-6 mx-auto mb-1 text-gray-600 font-bold text-sm flex items-center justify-center">CO₂</div>
              <p className="text-xs text-gray-600">Reduzido (g)</p>
              <p className="text-lg font-bold text-gray-700">{impact.co2.toFixed(1)}</p>
            </div>
          </div>
        </ConteudoCartao>
      </Cartao>
    </div>
  );
}

