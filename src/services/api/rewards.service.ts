import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço de API para gerenciar recompensas
 * Centraliza todas as operações relacionadas a recompensas e resgates
 */
export const rewardsService = {
  /**
   * Busca todas as recompensas disponíveis
   * @returns Lista de recompensas disponíveis
   */
  async getAvailableRewards() {
    const { data, error } = await supabase
      .from('recompensas')
      .select('*')
      .gt('quantidade_disponivel', 0)
      .order('pontos', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Resgata uma recompensa
   * @param rewardData - Dados do resgate
   * @returns Resgate criado
   */
  async redeemReward(rewardData: {
    usuario_id: string;
    recompensa_id: number;
    nome: string;
    cpf: string;
    telefone: string;
    numero_pedido: string;
    recompensa_titulo: string;
    recompensa_pontos: number;
    recompensa_mercados?: string[];
  }) {
    const { data, error } = await supabase
      .from('resgates')
      .insert(rewardData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Busca todos os resgates de um usuário
   * @param userId - ID do usuário
   * @returns Lista de resgates com dados das recompensas
   */
  async getUserRedemptions(userId: string) {
    const { data, error } = await supabase
      .from('resgates')
      .select(`
        *,
        recompensas (
          titulo,
          descricao,
          imagem,
          categoria,
          pontos
        )
      `)
      .eq('usuario_id', userId)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Atualiza a quantidade disponível de uma recompensa
   * @param rewardId - ID da recompensa
   * @param quantity - Nova quantidade
   * @returns Recompensa atualizada
   */
  async updateRewardQuantity(rewardId: number, quantity: number) {
    const { data, error } = await supabase
      .from('recompensas')
      .update({ quantidade_disponivel: quantity })
      .eq('id', rewardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
