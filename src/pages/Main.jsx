import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Botao } from '@/components/ui/botao';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progresso } from '@/components/ui/progresso';
import { toast } from '@/hooks/use-toast';
import {
  Home,
  Gift,
  Trophy,
  User,
  Calculator,
  Award,
  Recycle,
  Leaf,
  Loader2,
  MapPin,
  ShoppingBag,
  Menu,
  X,
  Shield,
  Store
} from 'lucide-react';
import { HomeTab } from '@/components/main/HomeTab';
import { LocationsTab } from '@/components/main/LocationsTab';
import { CalculatorTab } from '@/components/main/CalculatorTab';
import { CertificatesTab } from '@/components/main/CertificatesTab';
import { RewardsTab } from '@/components/main/RewardsTab';
import { RedeemedTab } from '@/components/main/RedeemedTab';
import { RankingTab } from '@/components/main/RankingTab';
import { ProfileTab } from '@/components/main/ProfileTab';
import { AbaVendedorRecompensas } from '@/components/main/AbaVendedorRecompensas';

const navigationItems = [
  { id: 'home', label: 'Início', icon: Home },
  { id: 'locations', label: 'Locais', icon: MapPin },
  { id: 'calculator', label: 'Calculadora', icon: Calculator },
  { id: 'certificates', label: 'Certificados', icon: Award },
  { id: 'rewards', label: 'Recompensas', icon: Gift },
  { id: 'redeemed', label: 'Resgatados', icon: ShoppingBag },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
  { id: 'profile', label: 'Perfil', icon: User },
];

export default function Main() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [products, setProducts] = useState([]);
  const [badges, setBadges] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    loadUserData();
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não encontrado');

      const { data: profile, error: profileError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Perfil não encontrado. Por favor, faça login novamente.' });
        await supabase.auth.signOut();
        navigate('/auth');
        return;
      }
      setUserProfile(profile);

      const { data: userDeliveries } = await supabase
        .from('entregas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('criado_em', { ascending: false });

      setDeliveries(userDeliveries || []);

      const { data: allProducts, error: productsError } = await supabase
        .from('recompensas')
        .select('*')
        .order('pontos', { ascending: true });

      if (productsError) {
        console.error('Erro ao carregar produtos:', productsError);
      } else {
        setProducts(allProducts || []);
      }

      const { data: allBadges } = await supabase
        .from('conquistas')
        .select('*')
        .order('valor_requerimento', { ascending: true });

      setBadges(allBadges || []);

      const { data: earnedBadges } = await supabase
        .from('conquistas_usuarios')
        .select('*, conquista:conquistas(*)')
        .eq('id_usuario', user.id);

      setUserBadges(earnedBadges || []);

      const { data: points } = await supabase
        .from('locais_compostagem')
        .select('*')
        .order('avaliacao', { ascending: false });

      setCollectionPoints(points || []);

      const { data: profiles } = await supabase
        .from('usuarios')
        .select('*')
        .order('pontos', { ascending: false });

      setAllProfiles(profiles || []);

      const adminEmails = ['admin@pontoorganico.com', 'arthur@example.com'];
      const userIsAdmin = profile.tipo === 'admin' || profile.role === 'admin' || adminEmails.includes(profile.email?.toLowerCase());
      const userIsSeller = profile.tipo === 'vendedor' || profile.role === 'vendedor';
      setIsAdmin(userIsAdmin);
      setIsSeller(userIsSeller);

    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao carregar dados: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
    toast({ title: 'Sucesso', description: 'Logout realizado com sucesso!' });
  };

  const getLevelProgress = (pontos, nivel) => {
    const levelLimits = {
      'Eco Iniciante': { min: 0, max: 99 },
      'Eco Amador': { min: 100, max: 499 },
      'Eco Intermediário': { min: 500, max: 999 },
      'Eco Avançado': { min: 1000, max: 2499 },
      'Eco Expert': { min: 2500, max: 4999 },
      'Eco Mestre': { min: 5000, max: Infinity }
    };

    const currentLevel = nivel || 'Eco Iniciante';
    const currentLimit = levelLimits[currentLevel] || levelLimits['Eco Iniciante'];
    const currentPoints = pontos || 0;

    if (currentLevel === 'Eco Mestre') {
      return 100;
    }

    const levels = ['Eco Iniciante', 'Eco Amador', 'Eco Intermediário', 'Eco Avançado', 'Eco Expert', 'Eco Mestre'];
    const currentIndex = levels.indexOf(currentLevel);
    const nextLevel = levels[currentIndex + 1];
    const nextLimit = levelLimits[nextLevel];

    if (!nextLimit) {
      return 100;
    }

    const pointsInCurrentLevel = currentPoints - currentLimit.min;
    const pointsNeededForNext = nextLimit.min - currentLimit.min;
    const progress = (pointsInCurrentLevel / pointsNeededForNext) * 100;

    return Math.min(100, Math.max(0, progress));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab userId={userProfile.id} deliveries={deliveries} onRefresh={loadUserData} />;
      case 'locations':
        return <LocationsTab collectionPoints={collectionPoints} />;
      case 'calculator':
        return <CalculatorTab />;
      case 'certificates':
        return <CertificatesTab badges={badges} userBadges={userBadges} userName={userProfile.nome} />;
      case 'rewards':
        return <RewardsTab products={products} userPoints={userProfile.pontos} userId={userProfile.id} onRefresh={loadUserData} />;
      case 'redeemed':
        return <RedeemedTab userId={userProfile.id} />;
      case 'ranking':
        return <RankingTab profiles={allProfiles} currentUserId={userProfile.id} currentUserNeighborhood={userProfile.bairro} />;
      case 'profile':
        return <ProfileTab userProfile={userProfile} />;
      case 'seller':
        return <AbaVendedorRecompensas idVendedor={userProfile.id} isVendedor={isSeller} />;
      default:
        return <HomeTab userId={userProfile.id} deliveries={deliveries} onRefresh={loadUserData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col h-full">
          <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="w-12 h-12 border-2 border-white">
                <AvatarImage src="" />
                <AvatarFallback className="bg-green-700">
                  {userProfile?.nome?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold truncate">{userProfile?.nome}</h2>
                <p className="text-sm text-green-100 truncate">{userProfile?.bairro}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs">Nível {userProfile?.nivel}</span>
                <span className="text-xs">{userProfile?.pontos} pts</span>
              </div>
              <Progresso 
                value={getLevelProgress(userProfile?.pontos, userProfile?.nivel)} 
                className="h-1.5 bg-white/20"
                indicatorClassName="bg-white"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-purple-700 hover:bg-purple-50 border-t border-gray-200 mt-2 pt-2"
                >
                  <Shield className="w-5 h-5" />
                  <span>Admin</span>
                </button>
              )}
              {isSeller && (
                <button
                  onClick={() => setActiveTab('seller')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border-t border-gray-200 mt-2 pt-2 ${
                    activeTab === 'seller'
                      ? 'bg-green-50 text-green-700 font-medium'
                      : 'text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <Store className="w-5 h-5" />
                  <span>Gerenciar Recompensas</span>
                </button>
              )}
            </div>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <Leaf className="w-4 h-4 mx-auto mb-1 text-green-600" />
                <p className="text-xs text-gray-600">Pontos</p>
                <p className="text-sm font-bold text-green-700">{userProfile?.pontos}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <Recycle className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                <p className="text-xs text-gray-600">Entregas</p>
                <p className="text-sm font-bold text-blue-700">{userProfile?.entregas_validadas || 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2 text-center">
                <Trophy className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                <p className="text-xs text-gray-600">Certif.</p>
                <p className="text-sm font-bold text-purple-700">{userBadges.length}</p>
              </div>
            </div>
            <Botao
              onClick={handleLogout}
              variant="outline"
              className="w-full mt-3"
              size="sm"
            >
              Sair
            </Botao>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64">
        <header className="lg:hidden bg-gradient-to-r from-green-600 to-green-500 text-white p-4 sticky top-0 z-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src="" />
                <AvatarFallback className="bg-green-700">
                  {userProfile?.nome?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-sm">{userProfile?.nome}</h2>
                <p className="text-xs text-green-100">{userProfile?.bairro}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-green-700 rounded-lg"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs">Nível {userProfile?.nivel}</span>
              <span className="text-xs">{userProfile?.pontos} pontos</span>
            </div>
            <Progresso 
              value={getLevelProgress(userProfile?.pontos, userProfile?.nivel)} 
              className="h-1.5 bg-white/20"
              indicatorClassName="bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <Leaf className="w-4 h-4 mx-auto mb-1" />
              <p className="text-xs text-green-100">Pontos</p>
              <p className="text-sm font-bold">{userProfile?.pontos}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <Recycle className="w-4 h-4 mx-auto mb-1" />
              <p className="text-xs text-green-100">Entregas</p>
              <p className="text-sm font-bold">{userProfile?.entregas_validadas || 0}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 text-center">
              <Trophy className="w-4 h-4 mx-auto mb-1" />
              <p className="text-xs text-green-100">Certif.</p>
              <p className="text-sm font-bold">{userBadges.length}</p>
            </div>
          </div>
        </header>

        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl">
              <div className="flex flex-col h-full">
                <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border-2 border-white">
                        <AvatarFallback className="bg-green-700">
                          {userProfile?.nome?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="font-semibold text-sm">{userProfile?.nome}</h2>
                        <p className="text-xs text-green-100">{userProfile?.bairro}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSidebarOpen(false)}
                      className="p-1 hover:bg-green-700 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <nav className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-1">
                    {navigationItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setSidebarOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            activeTab === item.id
                              ? 'bg-green-50 text-green-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setSidebarOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-purple-700 hover:bg-purple-50 border-t border-gray-200 mt-2 pt-2"
                      >
                        <Shield className="w-5 h-5" />
                        <span>Admin</span>
                      </button>
                    )}
                    {isSeller && (
                      <button
                        onClick={() => {
                          setActiveTab('seller');
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors border-t border-gray-200 mt-2 pt-2 ${
                          activeTab === 'seller'
                            ? 'bg-green-50 text-green-700 font-medium'
                            : 'text-blue-700 hover:bg-blue-50'
                        }`}
                      >
                        <Store className="w-5 h-5" />
                        <span>Gerenciar Recompensas</span>
                      </button>
                    )}
                  </div>
                </nav>
                <div className="p-4 border-t">
                  <Botao
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    Sair
                  </Botao>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="min-h-screen pb-20 lg:pb-0">
          <div className="max-w-7xl mx-auto p-4 lg:p-8">
            {renderTabContent()}
          </div>
        </main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
          <div className="grid grid-cols-4 py-2">
            {navigationItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center py-2 px-1 ${
                    activeTab === item.id ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-4 py-2 border-t border-gray-100">
            {navigationItems.slice(4).map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center py-2 px-1 ${
                    activeTab === item.id ? 'text-green-600' : 'text-gray-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
