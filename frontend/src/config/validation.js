// Regras de validação para formulários
export const validationRules = {
  // Nome
  name: {
    required: "Nome é obrigatório",
    minLength: "Nome deve ter pelo menos 2 caracteres",
    maxLength: "Nome deve ter no máximo 100 caracteres",
    pattern: "Nome deve conter apenas letras e espaços",
  },
  
  // Telefone
  phone: {
    required: "Telefone é obrigatório",
    invalid: "Telefone inválido",
    pattern: "Telefone deve conter apenas números",
  },
  
  // Email
  email: {
    required: "Email é obrigatório",
    invalid: "Email inválido",
    pattern: "Email deve ter formato válido",
  },
  
  // Senha
  password: {
    required: "Senha é obrigatória",
    minLength: "Senha deve ter pelo menos 6 caracteres",
    maxLength: "Senha deve ter no máximo 50 caracteres",
    pattern: "Senha deve conter letras e números",
  },
  
  // Confirmação de senha
  confirmPassword: {
    required: "Confirmação de senha é obrigatória",
    mismatch: "Senhas não coincidem",
  },
  
  // Preço
  price: {
    required: "Preço é obrigatório",
    min: "Preço deve ser maior que zero",
    pattern: "Preço deve ser um número válido",
  },
  
  // Duração
  duration: {
    required: "Duração é obrigatória",
    min: "Duração deve ser maior que zero",
    max: "Duração deve ser menor que 480 minutos (8 horas)",
  },
  
  // Data
  date: {
    required: "Data é obrigatória",
    past: "Data não pode ser no passado",
    future: "Data deve ser no futuro",
  },
  
  // Horário
  time: {
    required: "Horário é obrigatório",
    invalid: "Horário inválido",
  },
  
  // Observações
  notes: {
    maxLength: "Observações devem ter no máximo 500 caracteres",
  },
};

// Funções de validação
export const validators = {
  // Validação de senha
  validatePassword: (password) => {
    if (!password) return validationRules.password.required;
    if (password.length < 6) return validationRules.password.minLength;
    if (password.length > 50) return validationRules.password.maxLength;
    
    // Verificar se contém letras e números
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) return validationRules.password.pattern;
    
    return null; // Senha válida
  },
  
  // Validação de preço
  validatePrice: (price) => {
    if (!price) return validationRules.price.required;
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) return validationRules.price.min;
    
    return null; // Preço válido
  },
  
  // Validação de duração
  validateDuration: (duration) => {
    if (!duration) return validationRules.duration.required;
    
    const numDuration = parseInt(duration);
    if (isNaN(numDuration) || numDuration <= 0) return validationRules.duration.min;
    if (numDuration > 480) return validationRules.duration.max;
    
    return null; // Duração válida
  },
  
  // Validação de data
  validateDate: (date, allowPast = false) => {
    if (!date) return validationRules.date.required;
    
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!allowPast && selectedDate < today) return validationRules.date.past;
    
    return null; // Data válida
  },
  
  // Validação de horário
  validateTime: (time) => {
    if (!time) return validationRules.time.required;
    
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) return validationRules.time.invalid;
    
    return null; // Horário válido
  },
  
  // Validação de campo obrigatório
  validateRequired: (value, fieldName) => {
    if (!value || (typeof value === "string" && value.trim().length === 0)) {
      return `${fieldName} é obrigatório`;
    }
    return null;
  },
  
  // Validação de comprimento mínimo
  validateMinLength: (value, minLength, fieldName) => {
    if (value && value.length < minLength) {
      return `${fieldName} deve ter pelo menos ${minLength} caracteres`;
    }
    return null;
  },
  
  // Validação de comprimento máximo
  validateMaxLength: (value, maxLength, fieldName) => {
    if (value && value.length > maxLength) {
      return `${fieldName} deve ter no máximo ${maxLength} caracteres`;
    }
    return null;
  },
};

// Função para validar formulário completo
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    // Validação de campo obrigatório
    if (fieldRules.required && !value) {
      errors[field] = fieldRules.required;
      return;
    }
    
    // Validações específicas
    if (value) {
      if (fieldRules.minLength && value.length < fieldRules.minLength) {
        errors[field] = fieldRules.minLength;
      } else if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
        errors[field] = fieldRules.maxLength;
      } else if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
        errors[field] = fieldRules.pattern;
      } else if (fieldRules.custom) {
        const customError = fieldRules.custom(value, formData);
        if (customError) errors[field] = customError;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validationRules,
  validators,
  validateForm,
};
