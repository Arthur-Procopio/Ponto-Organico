/**
 * API Services
 * 
 * Centraliza todos os serviços de API do aplicativo
 * Separa a lógica de comunicação com o backend (Supabase) dos componentes React
 * 
 * Benefícios:
 * - Código mais organizado e reutilizável
 * - Facilita testes e manutenção
 * - Separa concerns (UI vs. lógica de dados)
 * - Facilita mudanças futuras no backend
 */

export { deliveriesService } from './deliveries.service';
export { usersService } from './users.service';
export { rewardsService } from './rewards.service';
export { locationsService } from './locations.service';

/**
 * Como usar:
 * 
 * import { deliveriesService, usersService } from '@/services/api';
 * 
 * // Em um componente React:
 * const loadData = async () => {
 *   try {
 *     const deliveries = await deliveriesService.getUserDeliveries(userId);
 *     const profile = await usersService.getUserProfile(userId);
 *     // ... usar os dados
 *   } catch (error) {
 *     console.error('Erro ao carregar dados:', error);
 *   }
 * };
 */
