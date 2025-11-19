import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço de API para gerenciar usuários
 * Centraliza todas as operações relacionadas a perfis de usuários
 */
export const usersService = {
  /**
   * Busca o perfil de um usuário
   * @param userId - ID do usuário
   * @returns Dados do perfil do usuário
   */
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Atualiza o perfil de um usuário
   * @param userId - ID do usuário
   * @param updates - Dados a serem atualizados
   * @returns Perfil atualizado
   */
  async updateUserProfile(userId: string, updates: {
    nome?: string;
    bairro?: string;
    email?: string;
  }) {
    const { data, error } = await supabase
      .from('usuarios')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Busca todos os usuários ordenados por pontos (ranking)
   * @param limit - Número máximo de usuários a retornar
   * @returns Lista de usuários ordenada por pontos
   */
  async getUsersRanking(limit: number = 100) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nome, bairro, pontos, nivel, entregas_validadas, peso_total')
      .order('pontos', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  /**
   * Atualiza os pontos de um usuário
   * @param userId - ID do usuário
   * @param points - Pontos a adicionar (pode ser negativo para deduzir)
   * @returns Perfil atualizado
   */
  async updateUserPoints(userId: string, points: number) {
    const { data: user } = await supabase
      .from('usuarios')
      .select('pontos')
      .eq('id', userId)
      .single();

    if (!user) throw new Error('Usuário não encontrado');

    const { data, error } = await supabase
      .from('usuarios')
      .update({
        pontos: (user.pontos || 0) + points
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
