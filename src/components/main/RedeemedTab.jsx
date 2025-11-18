import { useEffect, useState } from 'react';
import { Cartao, ConteudoCartao } from '@/components/ui/cartao';
import { Botao } from '@/components/ui/botao';
import { Dialogo, ConteudoDialogo, DescricaoDialogo, CabecalhoDialogo, TituloDialogo } from '@/components/ui/dialogo';
import { ShoppingBag, MapPin, Leaf, Ticket, Phone, Clock, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import VisualizacaoMapa from './VisualizacaoMapa';
import jsPDF from 'jspdf';

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

export function RedeemedTab({ userId }) {
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  useEffect(() => {
    loadRedemptions();
  }, [userId]);

  const handleShowLocation = (redemption) => {
    setSelectedRedemption(redemption);
    setIsLocationOpen(true);
  };

  const handleDownloadPDF = async (redemption) => {
    try {
      const config = getRewardConfig(redemption.recompensa_titulo);
      const local = config?.local || redemption.recompensa_mercados?.[0] || 'Não disponível';
      
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      doc.setFillColor(16, 185, 129);
      doc.rect(0, 0, 210, 20, 'F');

      const addLogo = () => {
        return new Promise((resolve) => {
          const logoImg = new Image();
          const timeout = setTimeout(() => {
            console.warn('Timeout ao carregar logo');
            resolve();
          }, 3000);
          
          logoImg.onload = () => {
            clearTimeout(timeout);
            try {
              const displayWidth = 35;
              const displayHeight = 35;
              let finalWidth = displayWidth;
              let finalHeight = displayHeight;
              
              const aspectRatio = logoImg.width / logoImg.height;
              if (aspectRatio > 1) {
                finalHeight = displayWidth / aspectRatio;
              } else {
                finalWidth = displayHeight * aspectRatio;
              }
              
              const scale = 2;
              const canvas = document.createElement('canvas');
              canvas.width = finalWidth * 3.779527559 * scale;
              canvas.height = finalHeight * 3.779527559 * scale;
              const ctx = canvas.getContext('2d');
              
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height);
              const logoDataUrl = canvas.toDataURL('image/png', 1.0);
              
              const xPos = (210 - finalWidth) / 2;
              doc.addImage(logoDataUrl, 'PNG', xPos, 55, finalWidth, finalHeight);
              resolve();
            } catch (error) {
              console.warn('Erro ao processar logo:', error);
              resolve();
            }
          };
          
          logoImg.onerror = () => {
            clearTimeout(timeout);
            console.warn('Logo não encontrado');
            resolve();
          };
          
          logoImg.src = '/logo-+verde.png';
        });
      };

      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPROVANTE DE RESGATE', 105, 15, { align: 'center' });

      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);

      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
      doc.text('Este comprovante é válido e verificado pelo', 105, 35, { align: 'center' });
      doc.text('Grupo +Verde', 105, 42, { align: 'center' });

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(20, 50, 190, 50);

      await addLogo();

      let yPos = 100;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Recompensa:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      const rewardNameText = String(redemption.recompensa_titulo || 'Não informado');
      const rewardName = doc.splitTextToSize(rewardNameText, 170);
      doc.text(rewardName, 20, yPos + 7);
      yPos += 7 + (rewardName.length * 5);

      yPos += 5;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129);
      doc.text('Valor em Pontos:', 20, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      const pontosTexto = String(redemption.recompensa_pontos || 0) + ' pontos';
      doc.text(pontosTexto, 20, yPos + 8);
      yPos += 15;

      yPos += 5;
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Local de Retirada:', 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      const localTextString = String(local);
      const localText = doc.splitTextToSize(localTextString, 170);
      doc.text(localText, 20, yPos + 7);
      yPos += 7 + (localText.length * 5);

      yPos += 10;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(20, yPos, 170, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(100, 100, 100);
      doc.text('Número do Pedido:', 25, yPos + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      const numeroPedidoTexto = String(redemption.numero_pedido || redemption.id || 'Não disponível');
      doc.text(numeroPedidoTexto, 25, yPos + 15);
      yPos += 25;

      yPos += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      const dataResgate = format(new Date(redemption.criado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      doc.text('Resgatado em: ' + String(dataResgate), 20, yPos);

      yPos += 7;
      const dataValidade = format(addDays(new Date(redemption.criado_em), 30), "dd/MM/yyyy", { locale: ptBR });
      doc.text('Válido até: ' + String(dataValidade), 20, yPos);

      yPos = 280;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(20, yPos, 190, yPos);

      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text('Este documento é um comprovante válido de resgate de recompensa', 105, yPos + 5, { align: 'center' });
      doc.text('emitido pelo sistema Ponto Orgânico - Grupo +Verde', 105, yPos + 10, { align: 'center' });

      const fileName = `comprovante-resgate-${redemption.numero_pedido || redemption.id}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert(`Erro ao gerar o PDF: ${error.message || 'Erro desconhecido'}`);
    }
  };

  const loadRedemptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resgates')
        .select('*')
        .eq('usuario_id', userId)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setRedemptions(data || []);
    } catch (error) {
      console.error('Erro ao carregar resgates:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (redemptions.length === 0) {
    return (
      <Cartao>
        <ConteudoCartao className="py-8 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">Você ainda não resgatou nenhuma recompensa</p>
        </ConteudoCartao>
      </Cartao>
    );
  }

  return (
    <div className="space-y-4">
      {redemptions.map((redemption) => {
        const config = getRewardConfig(redemption.recompensa_titulo);
        const imagemProduto = redemption.recompensa_imagem || config?.imagem;
        
        return (
          <Cartao key={redemption.id} className="overflow-hidden">
            <div className="flex gap-4 p-4">
              {imagemProduto && (
                <div className="w-24 h-24 bg-gray-50 rounded-lg border flex-shrink-0 overflow-hidden" id={`redeemed-container-${redemption.id}`}>
                  <img
                    src={imagemProduto}
                    alt={redemption.recompensa_titulo}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const container = document.getElementById(`redeemed-container-${redemption.id}`);
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
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 line-clamp-2">
                  {redemption.recompensa_titulo}
                </h3>
                
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Ticket className="w-4 h-4" />
                    <span className="font-mono">{redemption.numero_pedido}</span>
                  </div>

                  {redemption.recompensa_mercados && redemption.recompensa_mercados.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <ShoppingBag className="w-4 h-4" />
                      <span>{redemption.recompensa_mercados[0]}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Leaf className="w-4 h-4" />
                    <span>{redemption.recompensa_pontos} pontos</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <Botao
                    size="sm"
                    variant="outline"
                    onClick={() => handleShowLocation(redemption)}
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Localização
                  </Botao>
                  <Botao
                    size="sm"
                    onClick={() => handleDownloadPDF(redemption)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Baixar PDF
                  </Botao>
                  <div className="inline-flex flex-col">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full w-fit">
                      Resgatado
                    </span>
                    <span className="text-xs text-gray-500 mt-1 ml-1">
                    Válido até {format(addDays(new Date(redemption.criado_em), 30), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Cartao>
        );
      })}

      <Dialogo open={isLocationOpen} onOpenChange={setIsLocationOpen}>
        <ConteudoDialogo className="max-w-3xl">
          <CabecalhoDialogo>
            <TituloDialogo className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Localização - {selectedRedemption?.recompensa_titulo}
            </TituloDialogo>
            <DescricaoDialogo>
              Localização no mapa e informações de contato
            </DescricaoDialogo>
          </CabecalhoDialogo>
          {selectedRedemption && (() => {
            const config = getRewardConfig(selectedRedemption.recompensa_titulo);
            return (
              <div className="space-y-4">
                {config?.latitude && config?.longitude ? (
                  <VisualizacaoMapa
                    latitude={config.latitude}
                    longitude={config.longitude}
                    locationName={config.local || selectedRedemption.recompensa_mercados?.[0] || selectedRedemption.recompensa_titulo}
                    address={config.endereco || 'Não disponível'}
                  />
                ) : null}
                
                <div className="text-sm text-muted-foreground space-y-3">
                  <div>
                    <p className="font-medium">{config?.local || selectedRedemption.recompensa_mercados?.[0] || 'Não disponível'}</p>
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
