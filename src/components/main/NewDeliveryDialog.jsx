import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialogo, ConteudoDialogo, CabecalhoDialogo, TituloDialogo, GatilhoDialogo } from '@/components/ui/dialogo';
import { Botao } from '@/components/ui/botao';
import { Entrada } from '@/components/ui/entrada';
import { Rotulo } from '@/components/ui/rotulo';
import { Selecao, ConteudoSelecao, ItemSelecao, GatilhoSelecao, ValorSelecao } from '@/components/ui/selecao';
import { CaixaSelecao } from '@/components/ui/caixa-selecao';
import { toast } from '@/hooks/use-toast';
import { Plus, Loader2, Camera, Upload, X, Check } from 'lucide-react';

const getCurrentDateTime = () => {
  const now = new Date();
  const date = now.toISOString().split('T')[0];
  const time = now.toTimeString().slice(0, 5);
  return { date, time };
};

export function NewDeliveryDialog({ userId, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collectionPoints, setCollectionPoints] = useState([]);
  const [organicItems, setOrganicItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [videoRef, setVideoRef] = useState(null);
  
  const { date: defaultDate, time: defaultTime } = getCurrentDateTime();

  const [formData, setFormData] = useState({
    weight_kg: '',
    collection_point_id: '',
    scheduled_date: defaultDate,
    scheduled_time: defaultTime
  });

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
    if (videoRef) {
      videoRef.srcObject = null;
    }
  };

  useEffect(() => {
    if (open) {
      loadData();
      const { date: currentDate, time: currentTime } = getCurrentDateTime();
      setFormData(prev => ({
        ...prev,
        scheduled_date: currentDate,
        scheduled_time: currentTime
      }));
    } else {
      stopCamera();
    }
  }, [open]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const loadData = async () => {
    const { data: points } = await supabase
      .from('locais_compostagem')
      .select('*')
      .order('nome');
    
    const { data: items } = await supabase
      .from('tipos_materiais_organicos')
      .select('*')
      .order('nome');
    
    setCollectionPoints(points || []);
    setOrganicItems(items || []);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
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

  const capturePhoto = () => {
    if (!videoRef) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `foto-entrega-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setPhotoFile(file);
        setPhotoPreview(canvas.toDataURL('image/jpeg'));
        stopCamera();
        toast({ title: 'Sucesso', description: 'Foto capturada com sucesso!' });
      }
    }, 'image/jpeg', 0.9);
  };

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!photoFile) {
      toast({ variant: 'destructive', title: 'Erro', description: 'É obrigatório adicionar uma foto da entrega!' });
      return;
    }

    if (selectedItems.length === 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Selecione pelo menos um item orgânico!' });
      return;
    }

    setLoading(true);

    try {
      const collectionPoint = collectionPoints.find(p => p.id.toString() === formData.collection_point_id);
      const pointsPerKg = collectionPoint?.pontos_por_kg || 10;
      const weight = parseFloat(formData.weight_kg);
      const points = Math.floor(weight * pointsPerKg);
      
      const materiaisNomes = selectedItems.map(itemId => {
        const item = organicItems.find(i => i.id.toString() === itemId);
        return item ? item.nome : 'Item desconhecido';
      });

      const { error } = await supabase
        .from('entregas')
        .insert({
          usuario_id: userId,
          peso: weight,
          local: collectionPoint?.nome || 'Local não especificado',
          materiais: materiaisNomes.length > 0 ? materiaisNomes : ['Orgânicos'],
          pontos: points,
          titulo: `Entrega de ${weight}kg`,
          descricao: `Entrega feita no dia ${formData.scheduled_date} às ${formData.scheduled_time}`,
          imagem: photoPreview || null,
          status: 'pendente'
        });

      if (error) throw error;

      toast({ title: 'Sucesso', description: 'Entrega registrada e em análise!' });
      setOpen(false);
      const { date: resetDate, time: resetTime } = getCurrentDateTime();
      setFormData({ weight_kg: '', collection_point_id: '', scheduled_date: resetDate, scheduled_time: resetTime });
      setSelectedItems([]);
      setPhotoFile(null);
      setPhotoPreview(null);
      onSuccess();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Erro ao registrar entrega: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialogo open={open} onOpenChange={setOpen}>
      <GatilhoDialogo asChild>
        <Botao className="w-full bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Entrega
        </Botao>
      </GatilhoDialogo>
      <ConteudoDialogo className="max-h-[90vh] overflow-y-auto">
        <CabecalhoDialogo>
          <TituloDialogo>Registrar Nova Entrega</TituloDialogo>
        </CabecalhoDialogo>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Rotulo htmlFor="weight">Peso (KG) *</Rotulo>
            <Entrada
              id="weight"
              type="number"
              step="0.1"
              min="0"
              required
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              placeholder="Ex: 2.5"
            />
          </div>

          <div className="space-y-2">
            <Rotulo htmlFor="point">Local de Entrega *</Rotulo>
            <Selecao
              value={formData.collection_point_id}
              onValueChange={(value) => setFormData({ ...formData, collection_point_id: value })}
              required
            >
              <GatilhoSelecao>
                <ValorSelecao placeholder="Selecione o local" />
              </GatilhoSelecao>
              <ConteudoSelecao>
                {collectionPoints.map(point => (
                  <ItemSelecao key={point.id} value={point.id.toString()}>
                    {point.nome} - {point.endereco}
                  </ItemSelecao>
                ))}
              </ConteudoSelecao>
            </Selecao>
          </div>

          <div className="space-y-2">
            <Rotulo htmlFor="date">Data da Entrega *</Rotulo>
            <Entrada
              id="date"
              type="date"
              required
              max={defaultDate}
              value={formData.scheduled_date}
              onChange={(e) => {
                const selectedDate = e.target.value;
                const { date: currentDate } = getCurrentDateTime();
                
                if (selectedDate > currentDate) {
                  toast({ variant: 'destructive', title: 'Erro', description: 'Não é possível selecionar uma data futura!' });
                  return;
                }
                
                setFormData({ ...formData, scheduled_date: selectedDate });
              }}
            />
          </div>

          <div className="space-y-2">
            <Rotulo htmlFor="time">Horário *</Rotulo>
            <Entrada
              id="time"
              type="time"
              required
              value={formData.scheduled_time}
              onChange={(e) => {
                const selectedTime = e.target.value;
                const { date: currentDate, time: currentTime } = getCurrentDateTime();
                const selectedDate = formData.scheduled_date || currentDate;
                
                if (selectedDate === currentDate && selectedTime > currentTime) {
                  toast({ variant: 'destructive', title: 'Erro', description: 'Não é possível selecionar um horário futuro!' });
                  return;
                }
                
                setFormData({ ...formData, scheduled_time: selectedTime });
              }}
            />
          </div>

          <div className="space-y-2">
            <Rotulo>Itens Orgânicos Entregues *</Rotulo>
            <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
              {organicItems.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-2">Carregando materiais...</p>
              ) : (
                organicItems.map(item => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <CaixaSelecao
                      id={item.id.toString()}
                      checked={selectedItems.includes(item.id.toString())}
                      onCheckedChange={() => handleItemToggle(item.id.toString())}
                    />
                    <label
                      htmlFor={item.id.toString()}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {item.icone} {item.nome}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Rotulo>Foto da Entrega *</Rotulo>
            {isCameraOpen ? (
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
                    onClick={stopCamera}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Botao>
                  <Botao
                    type="button"
                    size="sm"
                    onClick={capturePhoto}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Capturar
                  </Botao>
                </div>
              </div>
            ) : photoPreview ? (
              <div className="border-2 border-dashed rounded-lg p-4">
                <div className="space-y-2">
                  <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover rounded" />
                  <div className="flex gap-2">
                    <Botao
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPhotoFile(null);
                        setPhotoPreview(null);
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
                      onClick={startCamera}
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
                      onClick={startCamera}
                      className="w-full"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Tirar Foto com Câmera
                    </Botao>
                    <div className="relative">
                      <Rotulo htmlFor="photo" className="cursor-pointer">
                        <Botao
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={() => document.getElementById('photo').click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Fazer Upload de Foto
                        </Botao>
                      </Rotulo>
                      <Entrada
                        id="photo"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Botao type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registrando...
              </>
            ) : (
              'Registrar Entrega'
            )}
          </Botao>
        </form>
      </ConteudoDialogo>
    </Dialogo>
  );
}

