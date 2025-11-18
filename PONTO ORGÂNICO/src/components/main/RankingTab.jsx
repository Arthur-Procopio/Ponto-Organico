import { useState } from 'react';
import { Cartao, ConteudoCartao, CabecalhoCartao, TituloCartao } from '@/components/ui/cartao';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Medal } from 'lucide-react';

export function RankingTab({ profiles, currentUserId, currentUserNeighborhood }) {
  const globalRanking = [...profiles].sort((a, b) => b.pontos - a.pontos);
  
  const neighborhoodStats = profiles.reduce((acc, profile) => {
    if (!acc[profile.bairro]) {
      acc[profile.bairro] = {
        bairro: profile.bairro,
        totalPoints: 0,
        userCount: 0
      };
    }
    acc[profile.bairro].totalPoints += profile.pontos;
    acc[profile.bairro].userCount += 1;
    return acc;
  }, {});

  const neighborhoodRanking = Object.values(neighborhoodStats)
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const getRankIcon = (position) => {
    if (position === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (position === 1) return <Award className="w-5 h-5 text-gray-400" />;
    if (position === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{position + 1}</span>;
  };

  const RankingList = ({ ranking, type }) => (
    <div className="space-y-2">
      {ranking.map((item, index) => {
        const isCurrentUser = type === 'global' && item.id === currentUserId;
        const isCurrentNeighborhood = type === 'neighborhoods' && item.bairro === currentUserNeighborhood;
        
        return (
          <div
            key={type === 'global' ? item.id : item.bairro}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isCurrentUser || isCurrentNeighborhood ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
            }`}
          >
            <div className="flex-shrink-0">
              {getRankIcon(index)}
            </div>
            <div className="flex-1 min-w-0">
              {type === 'global' ? (
                <>
                  <p className={`font-medium truncate ${isCurrentUser ? 'text-green-800' : 'text-gray-900'}`}>
                    {item.nome}
                  </p>
                  <p className="text-xs text-gray-500">{item.bairro}</p>
                </>
              ) : (
                <>
                  <p className={`font-medium truncate ${isCurrentNeighborhood ? 'text-green-800' : 'text-gray-900'}`}>
                    {item.bairro}
                  </p>
                  <p className="text-xs text-gray-500">{item.userCount} usuários</p>
                </>
              )}
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">
                {type === 'global' ? item.pontos : item.totalPoints}
              </p>
              <p className="text-xs text-gray-500">pts</p>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      <Cartao>
        <CabecalhoCartao>
          <TituloCartao className="text-green-800 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Rankings
          </TituloCartao>
        </CabecalhoCartao>
        <ConteudoCartao>
          <Tabs defaultValue="global" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="neighborhoods">Bairros</TabsTrigger>
            </TabsList>
            <TabsContent value="global" className="mt-4">
              <RankingList ranking={globalRanking} type="global" />
            </TabsContent>
            <TabsContent value="neighborhoods" className="mt-4">
              <RankingList ranking={neighborhoodRanking} type="neighborhoods" />
            </TabsContent>
          </Tabs>
        </ConteudoCartao>
      </Cartao>
    </div>
  );
}

