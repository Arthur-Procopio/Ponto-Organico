import { useState, useEffect } from 'react';
import { Cartao, ConteudoCartao, CabecalhoCartao, TituloCartao } from '@/components/ui/cartao';
import { Botao } from '@/components/ui/botao';
import { Entrada } from '@/components/ui/entrada';
import { Rotulo } from '@/components/ui/rotulo';
import { Selecao, ConteudoSelecao, ItemSelecao, GatilhoSelecao, ValorSelecao } from '@/components/ui/selecao';
import { Dialogo, ConteudoDialogo, CabecalhoDialogo, TituloDialogo } from '@/components/ui/dialogo';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Gift, Plus, Edit, Trash2, MapPin, Loader2, Camera, Upload, X } from 'lucide-react';
import VisualizacaoMapa from './VisualizacaoMapa';

export function AbaVendedorRecompensas({ idVendedor, isVendedor }) {
  const [recompensas, setRecompensas] = useState([]);
  const [locais, setLocais] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [dialogoAberto, setDialogoAberto] = useState(false);
  const [recompensaEditando, setRecompensaEditando] = useState(null);
  const [dialogoLocalAberto, setDialogoLocalAberto] = useState(false);
  const [novoLocal, setNovoLocal] = useState({
    nome: '',
    endereco: '',
    latitude: null,
    longitude: null
  });
  const [geocodificando, setGeocodificando] = useState(false);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [arquivoFoto, setArquivoFoto] = useState(null);
  const [cameraAberta, setCameraAberta] = useState(false);
  const [stream, setStream] = useState(null);
  const [videoRef, setVideoRef] = useState(null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const [dadosFormulario, setDadosFormulario] = useState({
    titulo: '',
    descricao: '',
    pontos: '',
    quantidade_disponivel: '',
    categoria: 'Alimentos',
    mercados: [],
    imagem: ''
  });

  useEffect(() => {
    carregarDados();
  }, [idVendedor]);

  useEffect(() => {
    return () => {
      pararCamera();
    };
  }, []);

  const pararCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraAberta(false);
    if (videoRef) {
      videoRef.srcObject = null;
    }
  };

  const iniciarCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      setCameraAberta(true);
      if (videoRef) {
        videoRef.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Erro', 
        description: 'Não foi possível acessar a câmera. Verifique as permissões ou use o upload de arquivo.' 
      });
    }
  };

  const capturarFoto = () => {
    if (!videoRef) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `foto-recompensa-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setArquivoFoto(file);
        setFotoPreview(canvas.toDataURL('image/jpeg'));
        pararCamera();
        toast({ title: 'Sucesso', description: 'Foto capturada com sucesso!' });
      }
    }, 'image/jpeg', 0.9);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setArquivoFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fazerUploadFoto = async () => {
    if (!arquivoFoto) return null;

    try {
      setEnviandoFoto(true);
      const nomeArquivo = `recompensas/${Date.now()}-${arquivoFoto.name}`;
      const { data, error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(nomeArquivo, arquivoFoto, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('imagens')
        .getPublicUrl(nomeArquivo);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao fazer upload da foto: ' + error.message });
      return null;
    } finally {
      setEnviandoFoto(false);
    }
  };

  const mercadosFixos = [
    { id: -1, nome: 'Supermercado Recibom', endereco: 'Av. Norte Miguel Arraes de Alencar, S/N - Encruzilhada, Recife - PE', tipo: 'supermercado' },
    { id: -2, nome: 'BERSO - Cidade Universitária', endereco: 'R. Padre Albuquerque, 398 - Cidade Universitária, Recife - PE', tipo: 'supermercado' },
    { id: -3, nome: 'Padaria Central', endereco: 'Estr. do Barbalho, 403 - Iputinga, Recife - PE, 50800-290', tipo: 'padaria' },
    { id: -4, nome: 'Mercadinho São José', endereco: 'R. São Bento do Norte, 17 - Cordeiro, Recife - PE, 50771-550', tipo: 'mercado' },
    { id: -5, nome: 'Mercearia Natural', endereco: 'R. Guimarães Peixoto, 15 - Tamarineira, Recife - PE, 52051-305', tipo: 'mercearia' },
    { id: -6, nome: 'Hortimercado Verdfruit', endereco: 'R. do Futuro, 1309 - Graças, Recife - PE, 52050-660', tipo: 'hortimercado' },
    { id: -7, nome: 'UCI Cinemas - Shopping Recife', endereco: 'Shopping Recife. Av. Padre Carapuceiro, 777 Loja BV.174 - Boa Viagem, Recife - PE, 51020-900', tipo: 'cinema' }
  ];

  const carregarDados = async () => {
    try {
      setCarregando(true);
      
      const queryRecompensas = supabase
        .from('recompensas')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (isVendedor) {
        queryRecompensas.eq('vendedor_id', idVendedor);
      }
      
      const [recompensasData, locaisData] = await Promise.all([
        queryRecompensas,
        supabase.from('locais_compostagem').select('*').order('nome')
      ]);

      if (recompensasData.error) throw recompensasData.error;
      if (locaisData.error) throw locaisData.error;

      setRecompensas(recompensasData.data || []);
      const todosLocais = [...mercadosFixos, ...(locaisData.data || [])];
      setLocais(todosLocais);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao carregar dados: ' + error.message });
    } finally {
      setCarregando(false);
    }
  };

  const geocodificarEndereco = async (endereco) => {
    try {
      setGeocodificando(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setNovoLocal(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }));
        toast({ title: 'Sucesso', description: 'Coordenadas encontradas!' });
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      } else {
        toast({ variant: 'destructive', title: 'Erro', description: 'Endereço não encontrado. Tente ser mais específico.' });
        return null;
      }
    } catch (error) {
      console.error('Erro ao geocodificar:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao buscar coordenadas.' });
      return null;
    } finally {
      setGeocodificando(false);
    }
  };

  const adicionarLocal = async () => {
    if (!novoLocal.nome || !novoLocal.endereco) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Preencha nome e endereço do local.' });
      return;
    }

    try {
      let coordenadas = { latitude: novoLocal.latitude, longitude: novoLocal.longitude };
      
      if (!coordenadas.latitude || !coordenadas.longitude) {
        const geocodificado = await geocodificarEndereco(novoLocal.endereco);
        if (!geocodificado) {
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível encontrar as coordenadas. Tente adicionar o local novamente com um endereço mais específico.' });
          return;
        }
        coordenadas = geocodificado;
      }

      const { data, error } = await supabase
        .from('locais_compostagem')
        .insert({
          nome: novoLocal.nome,
          endereco: novoLocal.endereco,
          latitude: coordenadas.latitude,
          longitude: coordenadas.longitude
        })
        .select()
        .single();

      if (error) throw error;

      setLocais([...locais, data]);
      setNovoLocal({ nome: '', endereco: '', latitude: null, longitude: null });
      setDialogoLocalAberto(false);
      toast({ title: 'Sucesso', description: 'Local adicionado com sucesso!' });
    } catch (error) {
      console.error('Erro ao adicionar local:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao adicionar local: ' + error.message });
    }
  };

  const abrirDialogo = (recompensa = null) => {
    if (recompensa) {
      if (recompensa.vendedor_id !== idVendedor) {
        toast({ variant: 'destructive', title: 'Erro', description: 'Você só pode editar suas próprias recompensas.' });
        return;
      }
      setRecompensaEditando(recompensa);
      setDadosFormulario({
        titulo: recompensa.titulo,
        descricao: recompensa.descricao || '',
        pontos: recompensa.pontos.toString(),
        quantidade_disponivel: recompensa.quantidade_disponivel?.toString() || '',
        categoria: recompensa.categoria || 'Alimentos',
        mercados: recompensa.mercados || [],
        imagem: recompensa.imagem || ''
      });
      setFotoPreview(recompensa.imagem || null);
      setArquivoFoto(null);
    } else {
      setRecompensaEditando(null);
      setDadosFormulario({
        titulo: '',
        descricao: '',
        pontos: '',
        quantidade_disponivel: '',
        categoria: 'Alimentos',
        mercados: [],
        imagem: ''
      });
      setFotoPreview(null);
      setArquivoFoto(null);
    }
    pararCamera();
    setDialogoAberto(true);
  };

  const salvarRecompensa = async () => {
    if (!dadosFormulario.titulo || !dadosFormulario.pontos) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Preencha título e pontos.' });
      return;
    }

    try {
      let urlImagem = dadosFormulario.imagem;
      
      if (arquivoFoto) {
        const urlUpload = await fazerUploadFoto();
        if (urlUpload) {
          urlImagem = urlUpload;
        } else {
          toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível fazer upload da imagem. Tente novamente.' });
          return;
        }
      }

      const dadosRecompensa = {
        titulo: dadosFormulario.titulo,
        descricao: dadosFormulario.descricao || null,
        pontos: parseInt(dadosFormulario.pontos),
        quantidade_disponivel: dadosFormulario.quantidade_disponivel ? parseInt(dadosFormulario.quantidade_disponivel) : null,
        quantidade_total: dadosFormulario.quantidade_disponivel ? parseInt(dadosFormulario.quantidade_disponivel) : null,
        categoria: dadosFormulario.categoria,
        mercados: dadosFormulario.mercados.length > 0 ? dadosFormulario.mercados : null,
        imagem: urlImagem || null
      };

      if (recompensaEditando) {
        if (recompensaEditando.vendedor_id !== idVendedor) {
          toast({ variant: 'destructive', title: 'Erro', description: 'Você só pode editar suas próprias recompensas.' });
          return;
        }
        
        const { error } = await supabase
          .from('recompensas')
          .update(dadosRecompensa)
          .eq('id', recompensaEditando.id)
          .eq('vendedor_id', idVendedor);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Recompensa atualizada com sucesso!' });
      } else {
        dadosRecompensa.vendedor_id = idVendedor;
        const { error } = await supabase
          .from('recompensas')
          .insert(dadosRecompensa);

        if (error) throw error;
        toast({ title: 'Sucesso', description: 'Recompensa criada com sucesso!' });
      }

      setDialogoAberto(false);
      setFotoPreview(null);
      setArquivoFoto(null);
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar recompensa:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao salvar recompensa: ' + error.message });
    }
  };

  const excluirRecompensa = async (idRecompensa, vendedorId) => {
    if (vendedorId !== idVendedor) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Você só pode excluir suas próprias recompensas.' });
      return;
    }

    if (!confirm('Tem certeza que deseja excluir esta recompensa?')) return;

    try {
      const { error } = await supabase
        .from('recompensas')
        .delete()
        .eq('id', idRecompensa)
        .eq('vendedor_id', idVendedor);

      if (error) throw error;
      toast({ title: 'Sucesso', description: 'Recompensa excluída com sucesso!' });
      carregarDados();
    } catch (error) {
      console.error('Erro ao excluir recompensa:', error);
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao excluir recompensa: ' + error.message });
    }
  };

  const alternarMercado = (nomeMercado) => {
    setDadosFormulario(prev => ({
      ...prev,
      mercados: prev.mercados.includes(nomeMercado)
        ? prev.mercados.filter(m => m !== nomeMercado)
        : [...prev.mercados, nomeMercado]
    }));
  };

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Cartao>
        <CabecalhoCartao>
          <div className="flex justify-between items-center">
            <TituloCartao className="text-green-800 flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Gerenciar Recompensas
            </TituloCartao>
            {isVendedor && (
              <Botao
                onClick={() => abrirDialogo()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Recompensa
              </Botao>
            )}
          </div>
        </CabecalhoCartao>
        <ConteudoCartao>
          {recompensas.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Gift className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma recompensa cadastrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recompensas.map((recompensa) => {
                const podeEditar = recompensa.vendedor_id === idVendedor;
                return (
                  <div key={recompensa.id} className="border rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
                    {recompensa.imagem && (
                      <img
                        src={recompensa.imagem}
                        alt={recompensa.titulo}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{recompensa.titulo}</h3>
                      {recompensa.descricao && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{recompensa.descricao}</p>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-green-600">{recompensa.pontos} pontos</span>
                        {recompensa.quantidade_disponivel !== null && (
                          <span className="text-xs text-gray-500">
                            {recompensa.quantidade_disponivel} disponíveis
                          </span>
                        )}
                      </div>
                      {recompensa.mercados && recompensa.mercados.length > 0 && (
                        <p className="text-xs text-gray-500 mb-2">
                          Locais: {recompensa.mercados.join(', ')}
                        </p>
                      )}
                      {podeEditar && (
                        <div className="flex gap-2 mt-3">
                          <Botao
                            size="sm"
                            variant="outline"
                            onClick={() => abrirDialogo(recompensa)}
                            className="flex-1"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Botao>
                          <Botao
                            size="sm"
                            variant="destructive"
                            onClick={() => excluirRecompensa(recompensa.id, recompensa.vendedor_id)}
                            className="flex-1"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Botao>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ConteudoCartao>
      </Cartao>

      <Dialogo open={dialogoAberto} onOpenChange={setDialogoAberto}>
        <ConteudoDialogo className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <CabecalhoDialogo>
            <TituloDialogo>
              {recompensaEditando ? 'Editar Recompensa' : 'Nova Recompensa'}
            </TituloDialogo>
          </CabecalhoDialogo>
          <div className="space-y-4">
            <div className="space-y-2">
              <Rotulo htmlFor="titulo">Nome do Produto *</Rotulo>
              <Entrada
                id="titulo"
                value={dadosFormulario.titulo}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, titulo: e.target.value })}
                placeholder="Ex: Café Orgânico 250g"
              />
            </div>

            <div className="space-y-2">
              <Rotulo htmlFor="descricao">Descrição</Rotulo>
              <Textarea
                id="descricao"
                value={dadosFormulario.descricao}
                onChange={(e) => setDadosFormulario({ ...dadosFormulario, descricao: e.target.value })}
                placeholder="Descrição do produto..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Rotulo htmlFor="pontos">Pontos para Resgatar *</Rotulo>
                <Entrada
                  id="pontos"
                  type="number"
                  min="0"
                  value={dadosFormulario.pontos}
                  onChange={(e) => setDadosFormulario({ ...dadosFormulario, pontos: e.target.value })}
                  placeholder="Ex: 100"
                />
              </div>

              <div className="space-y-2">
                <Rotulo htmlFor="quantidade">Quantidade Disponível</Rotulo>
                <Entrada
                  id="quantidade"
                  type="number"
                  min="0"
                  value={dadosFormulario.quantidade_disponivel}
                  onChange={(e) => setDadosFormulario({ ...dadosFormulario, quantidade_disponivel: e.target.value })}
                  placeholder="Deixe vazio para ilimitado"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Rotulo htmlFor="categoria">Categoria</Rotulo>
              <Selecao
                value={dadosFormulario.categoria}
                onValueChange={(value) => setDadosFormulario({ ...dadosFormulario, categoria: value })}
              >
                <GatilhoSelecao>
                  <ValorSelecao placeholder="Selecione a categoria" />
                </GatilhoSelecao>
                <ConteudoSelecao>
                  <ItemSelecao value="Alimentos">Alimentos</ItemSelecao>
                  <ItemSelecao value="Descontos">Descontos</ItemSelecao>
                  <ItemSelecao value="Experiências">Experiências</ItemSelecao>
                  <ItemSelecao value="Produtos">Produtos</ItemSelecao>
                </ConteudoSelecao>
              </Selecao>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Rotulo>Locais de Retirada</Rotulo>
                <Botao
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setDialogoLocalAberto(true)}
                >
                  <MapPin className="w-4 h-4 mr-1" />
                  Adicionar Local
                </Botao>
              </div>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {locais.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">Nenhum local disponível</p>
                ) : (
                  locais.map((local) => (
                    <label key={local.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dadosFormulario.mercados.includes(local.nome)}
                        onChange={() => alternarMercado(local.nome)}
                        className="rounded"
                      />
                      <span className="text-sm">{local.nome}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Rotulo>Foto do Produto</Rotulo>
              {cameraAberta ? (
                <div className="border-2 border-dashed rounded-lg p-4 bg-black relative">
                  <video
                    ref={(el) => {
                      setVideoRef(el);
                      if (el && stream) {
                        el.srcObject = stream;
                      }
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover rounded"
                  />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    <Botao
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={pararCamera}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Botao>
                    <Botao
                      type="button"
                      size="sm"
                      onClick={capturarFoto}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Capturar
                    </Botao>
                  </div>
                </div>
              ) : fotoPreview ? (
                <div className="border-2 border-dashed rounded-lg p-4">
                  <div className="space-y-2">
                    <img src={fotoPreview} alt="Preview" className="w-full h-40 object-cover rounded" />
                    <div className="flex gap-2">
                      <Botao
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setArquivoFoto(null);
                          setFotoPreview(null);
                          setDadosFormulario({ ...dadosFormulario, imagem: '' });
                        }}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remover
                      </Botao>
                      <Botao
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={iniciarCamera}
                        className="flex-1"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Nova Foto
                      </Botao>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-4">
                  <div className="text-center space-y-3">
                    <Camera className="w-12 h-12 mx-auto text-gray-400" />
                    <div className="flex flex-col gap-2">
                      <Botao
                        type="button"
                        variant="outline"
                        onClick={iniciarCamera}
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Tirar Foto com Câmera
                      </Botao>
                      <div className="relative">
                        <Rotulo htmlFor="foto" className="cursor-pointer">
                          <Botao
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => document.getElementById('foto').click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Fazer Upload de Foto
                          </Botao>
                        </Rotulo>
                        <Entrada
                          id="foto"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleFotoChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2 mt-2">
                <Rotulo htmlFor="imagem">Ou cole uma URL da Imagem</Rotulo>
                <Entrada
                  id="imagem"
                  value={dadosFormulario.imagem}
                  onChange={(e) => {
                    setDadosFormulario({ ...dadosFormulario, imagem: e.target.value });
                    if (e.target.value && !arquivoFoto) {
                      setFotoPreview(e.target.value);
                    }
                  }}
                  placeholder="https://exemplo.com/imagem.png"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Botao
                onClick={salvarRecompensa}
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={enviandoFoto}
              >
                {enviandoFoto ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  recompensaEditando ? 'Atualizar' : 'Publicar'
                )}
              </Botao>
              <Botao
                variant="outline"
                onClick={() => setDialogoAberto(false)}
                className="flex-1"
              >
                Cancelar
              </Botao>
            </div>
          </div>
        </ConteudoDialogo>
      </Dialogo>

      <Dialogo open={dialogoLocalAberto} onOpenChange={setDialogoLocalAberto}>
        <ConteudoDialogo className="max-w-2xl">
          <CabecalhoDialogo>
            <TituloDialogo>Adicionar Novo Local</TituloDialogo>
          </CabecalhoDialogo>
          <div className="space-y-4">
            <div className="space-y-2">
              <Rotulo htmlFor="localNome">Nome do Local *</Rotulo>
              <Entrada
                id="localNome"
                value={novoLocal.nome}
                onChange={(e) => setNovoLocal({ ...novoLocal, nome: e.target.value })}
                placeholder="Ex: Padaria Central"
              />
            </div>

            <div className="space-y-2">
              <Rotulo htmlFor="localEndereco">Endereço Completo *</Rotulo>
              <div className="flex gap-2">
                <Entrada
                  id="localEndereco"
                  value={novoLocal.endereco}
                  onChange={(e) => setNovoLocal({ ...novoLocal, endereco: e.target.value })}
                  placeholder="Ex: Rua Exemplo, 123 - Bairro, Cidade - PE"
                  className="flex-1"
                />
                <Botao
                  type="button"
                  variant="outline"
                  onClick={() => geocodificarEndereco(novoLocal.endereco)}
                  disabled={!novoLocal.endereco || geocodificando}
                >
                  {geocodificando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </Botao>
              </div>
              <p className="text-xs text-gray-500">
                Clique no ícone para buscar coordenadas automaticamente
              </p>
            </div>

            {novoLocal.latitude && novoLocal.longitude && (
              <div className="space-y-2">
                <Rotulo>Localização no Mapa</Rotulo>
                <VisualizacaoMapa
                  latitude={novoLocal.latitude}
                  longitude={novoLocal.longitude}
                  locationName={novoLocal.nome}
                  address={novoLocal.endereco}
                />
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Botao
                onClick={adicionarLocal}
                disabled={geocodificando}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {geocodificando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  'Adicionar Local'
                )}
              </Botao>
              <Botao
                variant="outline"
                onClick={() => {
                  setDialogoLocalAberto(false);
                  setNovoLocal({ nome: '', endereco: '', latitude: null, longitude: null });
                }}
                className="flex-1"
              >
                Cancelar
              </Botao>
            </div>
          </div>
        </ConteudoDialogo>
      </Dialogo>
    </div>
  );
}

