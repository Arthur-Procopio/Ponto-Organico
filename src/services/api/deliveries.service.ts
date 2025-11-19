import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço de API para gerenciar entregas
 * Centraliza todas as operações relacionadas a entregas orgânicas
 */
export const deliveriesService = {
  /**
   * Busca todas as entregas de um usuário
   * @param userId - ID do usuário
   * @returns Lista de entregas
   */
  async getUserDeliveries(userId: string) {
    const { data, error } = await supabase
      .from('entregas')
      .select('*')
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Cria uma nova entrega
   * @param deliveryData - Dados da entrega
   * @returns Entrega criada
   */
  async createDelivery(deliveryData: {
    usuario_id: string;
    local: string;
    peso: number;
    pontos: number;
    materiais: string[];
    titulo: string;
    descricao?: string;
    imagem?: string;
    status?: string;
  }) {
    const { data, error } = await supabase
      .from('entregas')
      .insert(deliveryData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atualiza o status de validação de uma entrega
   * @param deliveryId - ID da entrega
   * @param status - Novo status ('pendente', 'aprovado', 'rejeitado')
   * @returns Entrega atualizada
   */
  async updateDeliveryStatus(deliveryId: number, status: string) {
    const updateData: any = { status };
    
    if (status === 'aprovado') {
      updateData.validado_em = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('entregas')
      .update(updateData)
      .eq('id', deliveryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Busca entregas por status
   * @param status - Status da entrega
   * @returns Lista de entregas filtradas
   */
  async getDeliveriesByStatus(status: string) {
    const { data, error } = await supabase
      .from('entregas')
      .select('*')
      .eq('status', status)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Busca todas as entregas (apenas para administradores)
   * @returns Lista de todas as entregas com informações do usuário
   */
  async getAllDeliveries() {
    const { data, error } = await supabase
      .from('entregas')
      .select(`
        *,
        usuario:usuarios!entregas_usuario_id_fkey(nome, email, bairro)
      `)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data;
  }
};
