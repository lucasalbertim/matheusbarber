export const isValidPhoneBR = (phone) => {
  const digits = onlyDigits(phone);
  return digits.length === 10 || digits.length === 11;
};
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("pt-BR");
};

export const formatDateTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleString("pt-BR");
};

export const formatCPF = (cpf) => {
  if (!cpf) return "";
  const clean = cpf.replace(/[^\d]/g, "");
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const formatPhone = (phone) => {
  if (!phone) return "";
  const clean = phone.replace(/[^\d]/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
};

// alias para compatibilidade
export const formatPhoneBR = formatPhone;

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins}min`;
};

// =========================
// 🔥 Funções adicionais
// =========================

export const onlyDigits = (value) => value.replace(/\D/g, "");


export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const normalizeEmail = (email) => {
  return email.trim().toLowerCase();
};
