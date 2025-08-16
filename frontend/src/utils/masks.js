// Máscaras para formatação de campos
export const cpfMask = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é dígito
  value = value.replace(/\D/g, '');
  
  // Aplica a máscara
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d)/, '$1.$2');
  value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  
  return value;
};

export const phoneMask = (value) => {
  if (!value) return '';
  
  // Remove tudo que não é dígito
  value = value.replace(/\D/g, '');
  
  // Aplica a máscara
  value = value.replace(/(\d{2})(\d)/, '($1) $2');
  value = value.replace(/(\d{5})(\d)/, '$1-$2');
  
  return value;
};

// Validações
export const validateCPF = (cpf) => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = 11 - (sum % 11);
  let digit1 = remainder < 2 ? 0 : remainder;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = 11 - (sum % 11);
  let digit2 = remainder < 2 ? 0 : remainder;
  
  return parseInt(cpf.charAt(9)) === digit1 && parseInt(cpf.charAt(10)) === digit2;
};

export const validatePhone = (phone) => {
  // Remove caracteres não numéricos
  phone = phone.replace(/\D/g, '');
  
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  return phone.length >= 10 && phone.length <= 11;
};