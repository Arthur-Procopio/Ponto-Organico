import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço de API para gerenciar locais de compostagem
 * Centraliza todas as operações relacionadas a locais de coleta
 */
export const locationsService = {
  /**
   * Busca todos os locais de compostagem
   * @returns Lista de locais de compostagem
   */
  async getAllLocations() {
    const { data, error } = await supabase
      .from('locais_compostagem')
      .select('*')
      .order('nome', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Busca um local de compostagem específico
   * @param locationId - ID do local
   * @returns Dados do local de compostagem
   */
  async getLocationById(locationId: number) {
    const { data, error } = await supabase
      .from('locais_compostagem')
      .select('*')
      .eq('id', locationId)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Busca locais de compostagem por tipo
   * @param type - Tipo do local
   * @returns Lista de locais filtrados por tipo
   */
  async getLocationsByType(type: string) {
    const { data, error } = await supabase
      .from('locais_compostagem')
      .select('*')
      .eq('tipo', type);

    if (error) throw error;
    return data;
  },

  /**
   * Busca locais de compostagem que estão abertos
   * @returns Lista de locais abertos
   */
  async getOpenLocations() {
    const { data, error } = await supabase
      .from('locais_compostagem')
      .select('*')
      .eq('esta_aberto', true);

    if (error) throw error;
    return data;
  },

  /**
   * Busca todos os locais com informações básicas
   * @returns Lista simplificada de locais
   */
  async getLocationsBasicInfo() {
    const { data, error } = await supabase
      .from('locais_compostagem')
      .select('id, nome, endereco, tipo, horario, telefone, esta_aberto, avaliacao');

    if (error) throw error;
    return data;
  }
};
