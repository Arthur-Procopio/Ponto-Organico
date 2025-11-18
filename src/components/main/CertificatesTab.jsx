import { useState } from 'react';
import { Cartao, ConteudoCartao, CabecalhoCartao, TituloCartao } from '@/components/ui/cartao';
import { Award } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { CertificateViewDialog } from './CertificateViewDialog';

export function CertificatesTab({ badges, userBadges, userName }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isUnlocked = (badgeId) => {
    return userBadges.some((ub) => ub.id_conquista === badgeId);
  };

  const getRequirementText = (type, value) => {
    switch(type) {
      case 'deliveries':
        return `${value} ${value === 1 ? 'entrega' : 'entregas'}`;
      case 'points':
        return `${value} pontos`;
      case 'weight_kg':
        return `${value}kg entregues`;
      default:
        return `${value}`;
    }
  };

  const getIcon = (iconName) => {
    const Icon = LucideIcons[iconName];
    return Icon ? Icon : LucideIcons.Award;
  };

  const handleBadgeClick = (badge) => {
    if (isUnlocked(badge.id)) {
      setSelectedBadge(badge);
      setDialogOpen(true);
    }
  };

  return (
    <div className="space-y-4">
      <Cartao>
        <CabecalhoCartao>
          <TituloCartao className="text-green-800 flex items-center gap-2">
            <Award className="w-5 h-5" />
            Certificados e Conquistas
          </TituloCartao>
        </CabecalhoCartao>
        <ConteudoCartao>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {badges.map((badge) => {
              const Icon = getIcon(badge.icone);
              const unlocked = isUnlocked(badge.id);
              
              return (
                <div
                  key={badge.id}
                  onClick={() => handleBadgeClick(badge)}
                  className={`border rounded-lg p-4 text-center transition-all ${
                    unlocked 
                      ? 'bg-green-50 border-green-300 cursor-pointer hover:shadow-lg hover:scale-105' 
                      : 'bg-gray-50 opacity-50'
                  }`}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${
                    unlocked ? 'text-green-600' : 'text-gray-400'
                  }`} />
                  <h3 className="font-medium text-sm text-gray-900 mb-1">
                    {badge.nome}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {badge.descrição}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {getRequirementText(badge.tipo_requerimento, badge.valor_requerimento)}
                  </p>
                  {unlocked && (
                    <p className="text-xs text-green-600 font-medium mt-2">
                      Clique para ver certificado
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </ConteudoCartao>
      </Cartao>

      <CertificateViewDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        badge={selectedBadge}
        userName={userName}
      />
    </div>
  );
}

