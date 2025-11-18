import { Cartao, ConteudoCartao, CabecalhoCartao, TituloCartao } from '@/components/ui/cartao';
import { Botao } from '@/components/ui/botao';
import { Dialogo, ConteudoDialogo, DescricaoDialogo, CabecalhoDialogo, TituloDialogo } from '@/components/ui/dialogo';
import { MapPin, Star, Phone, Mail, Instagram, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import VisualizacaoMapa from './VisualizacaoMapa';

const locationConfig = {
  'BERSO': {
    imagem: '/logos/berso.png',
    horario: '09:00–17:00',
    telefone: 'Não disponível',
    email: 'berso.den@ufpe.br',
    instagram: 'https://www.instagram.com/bersoufpe/'
  },
  'Recife Minhocas e Compostagem': {
    imagem: '/logos/minhocas.png',
    horario: '08:00–18:00',
    telefone: '(81) 98777-0328',
    email: 'Não disponível',
    instagram: 'https://www.instagram.com/recifeminhocas1/'
  },
  'Comunidade dos Pequenos Profetas': {
    imagem: '/logos/profetas.png',
    horario: '07:00–15:00',
    telefone: '(81) 3424-7481',
    email: 'contatocppclarion@gmail.com.br',
    instagram: 'https://www.instagram.com/pequenos_profetas/'
  }
};

const getLocationConfig = (nome) => {
  if (!nome) return null;
  const nomeLower = nome.toLowerCase().trim();
  for (const [key, config] of Object.entries(locationConfig)) {
    const keyLower = key.toLowerCase();
    if (nomeLower === keyLower || nomeLower.includes(keyLower) || keyLower.includes(nomeLower)) {
      return config;
    }
    if (nomeLower.includes('berso') && keyLower.includes('berso')) return config;
    if (nomeLower.includes('minhocas') && keyLower.includes('minhocas')) return config;
    if (nomeLower.includes('profetas') && keyLower.includes('profetas')) return config;
    if (nomeLower.includes('pequenos') && keyLower.includes('pequenos')) return config;
  }
  return null;
};

const openInstagram = (url) => {
  const cleanUrl = url.split('?')[0].replace(/\/$/, '');
  const username = cleanUrl.split('/').pop();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) {
    const appUrl = `instagram://user?username=${username}`;
    window.location.href = appUrl;
    setTimeout(() => {
      window.open(cleanUrl, '_blank');
    }, 1000);
  } else {
    window.open(cleanUrl, '_blank');
  }
};

export function LocationsTab({ collectionPoints }) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const handleShowLocation = (point) => {
    if (point.latitude && point.longitude) {
      setSelectedLocation(point);
      setIsMapOpen(true);
    } else {
      toast({ variant: 'destructive', title: 'Erro', description: 'Coordenadas não disponíveis para este local' });
    }
  };

  const handleContact = (point) => {
    setSelectedLocation(point);
    setIsContactOpen(true);
  };

  return (
    <div className="space-y-4">
      <Cartao>
        <CabecalhoCartao>
          <TituloCartao className="text-green-800 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Pontos de Coleta
          </TituloCartao>
        </CabecalhoCartao>
        <ConteudoCartao>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collectionPoints.map((point) => {
              const config = getLocationConfig(point.nome);
              return (
              <div key={point.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-white">
                {config?.imagem && (
                  <div className="w-full h-32 bg-gray-50 overflow-hidden border-b" id={`logo-container-${point.id}`}>
                    <img 
                      src={config.imagem} 
                      alt={`Logo ${point.nome}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const container = document.getElementById(`logo-container-${point.id}`);
                        if (container && !container.querySelector('.placeholder-text')) {
                          const placeholder = document.createElement('div');
                          placeholder.className = 'placeholder-text text-xs text-gray-400 text-center flex items-center justify-center h-full';
                          placeholder.textContent = 'Logo em breve';
                          container.appendChild(placeholder);
                        }
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{point.nome}</h3>
                    {point.avaliacao && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{point.avaliacao}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    {point.endereco}
                  </p>
                
                <div className="flex gap-2 mb-2">
                  <Botao 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleShowLocation(point)}
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Localização
                  </Botao>
                  <Botao 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleContact(point)}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Contato
                  </Botao>
                </div>
                  {point.materiais && point.materiais.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {point.materiais.map((material, idx) => (
                        <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {material}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        </ConteudoCartao>
      </Cartao>

      <Dialogo open={isMapOpen} onOpenChange={setIsMapOpen}>
        <ConteudoDialogo className="max-w-3xl">
          <CabecalhoDialogo>
            <TituloDialogo className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {selectedLocation?.nome}
            </TituloDialogo>
            <DescricaoDialogo>
              Localização no mapa
            </DescricaoDialogo>
          </CabecalhoDialogo>
          {selectedLocation && (
            <div className="space-y-4">
                  <VisualizacaoMapa
                latitude={selectedLocation.latitude}
                longitude={selectedLocation.longitude}
                locationName={selectedLocation.nome}
                address={selectedLocation.endereco}
              />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">{selectedLocation.endereco}</p>
                {(() => {
                  const config = getLocationConfig(selectedLocation.nome);
                  const horario = config?.horario || selectedLocation.horario;
                  return horario && (
                    <p className="flex items-center gap-2 mt-2">
                      <Clock className="w-4 h-4" />
                      <strong>Horário:</strong> {horario}
                    </p>
                  );
                })()}
              </div>
            </div>
          )}
        </ConteudoDialogo>
      </Dialogo>

      <Dialogo open={isContactOpen} onOpenChange={setIsContactOpen}>
        <ConteudoDialogo className="max-w-md">
          <CabecalhoDialogo>
            <TituloDialogo className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contato - {selectedLocation?.nome}
            </TituloDialogo>
            <DescricaoDialogo>
              Informações de contato
            </DescricaoDialogo>
          </CabecalhoDialogo>
          {selectedLocation && (() => {
            const config = getLocationConfig(selectedLocation.nome);
            return (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Telefone</p>
                    <p className="text-sm text-gray-600">{config?.telefone || selectedLocation.telefone || 'Não disponível'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    {config?.email && config.email !== 'Não disponível' ? (
                      <a 
                        href={`mailto:${config.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {config.email}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-600">Não disponível</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Instagram className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">Instagram</p>
                    {config?.instagram ? (
                      <button
                        onClick={() => openInstagram(config.instagram)}
                        className="text-sm text-blue-600 hover:underline text-left"
                      >
                        {config.instagram}
                      </button>
                    ) : (
                      <p className="text-sm text-gray-600">Não disponível</p>
                    )}
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
