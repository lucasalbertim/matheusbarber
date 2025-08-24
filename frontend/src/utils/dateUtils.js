/**
 * Utilitários para datas e horários usando o fuso horário de Recife (UTC-3)
 */

/**
 * Obtém a data/hora atual no fuso horário de Recife
 * @returns {string} Data/hora em formato ISO string
 */
export const getRecifeDateTime = () => {
  const now = new Date();
  const recifeTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // UTC-3
  return recifeTime.toISOString();
};

/**
 * Obtém apenas a data atual no fuso horário de Recife
 * @returns {string} Data em formato YYYY-MM-DD
 */
export const getRecifeDate = () => {
  const now = new Date();
  const recifeTime = new Date(now.getTime() - (3 * 60 * 60 * 1000)); // UTC-3
  return recifeTime.toISOString().split('T')[0];
};

/**
 * Formata uma data para o fuso horário de Recife
 * @param {string|Date} date - Data a ser formatada
 * @returns {string} Data formatada no fuso horário de Recife
 */
export const formatToRecifeTime = (date) => {
  const dateObj = new Date(date);
  const recifeTime = new Date(dateObj.getTime() - (3 * 60 * 60 * 1000)); // UTC-3
  return recifeTime.toISOString();
};

/**
 * Converte uma data UTC para o fuso horário de Recife
 * @param {string|Date} utcDate - Data em UTC
 * @returns {Date} Data no fuso horário de Recife
 */
export const utcToRecife = (utcDate) => {
  const dateObj = new Date(utcDate);
  return new Date(dateObj.getTime() - (3 * 60 * 60 * 1000)); // UTC-3
};