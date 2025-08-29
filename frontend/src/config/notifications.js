import { toast } from 'react-toastify';

// Configuração padrão do toast
export const toastConfig = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Funções de notificação personalizadas
export const showSuccess = (message) => {
  toast.success(message, {
    ...toastConfig,
    icon: "✅",
  });
};

export const showError = (message) => {
  toast.error(message, {
    ...toastConfig,
    icon: "❌",
    autoClose: 7000,
  });
};

export const showWarning = (message) => {
  toast.warning(message, {
    ...toastConfig,
    icon: "⚠️",
  });
};

export const showInfo = (message) => {
  toast.info(message, {
    ...toastConfig,
    icon: "ℹ️",
  });
};

export const showLoading = (message) => {
  return toast.loading(message, {
    ...toastConfig,
    icon: "⏳",
  });
};

export const updateToast = (toastId, message, type = "success") => {
  toast.update(toastId, {
    render: message,
    type: type,
    isLoading: false,
    autoClose: 3000,
  });
};

// Notificações específicas do sistema
export const notifications = {
  // Clientes
  clientCreated: "Cliente criado com sucesso!",
  clientUpdated: "Cliente atualizado com sucesso!",
  clientDeleted: "Cliente excluído com sucesso!",
  clientReactivated: "Cliente reativado com sucesso!",
  
  // Serviços
  serviceCreated: "Serviço criado com sucesso!",
  serviceUpdated: "Serviço atualizado com sucesso!",
  serviceDeleted: "Serviço excluído com sucesso!",
  
  // Atendimentos
  attendanceCreated: "Agendamento realizado com sucesso!",
  attendanceUpdated: "Atendimento atualizado com sucesso!",
  attendanceCancelled: "Atendimento cancelado com sucesso!",
  
  // Autenticação
  loginSuccess: "Login realizado com sucesso!",
  logoutSuccess: "Logout realizado com sucesso!",
  passwordChanged: "Senha alterada com sucesso!",
  
  // Erros
  generalError: "Ocorreu um erro. Tente novamente.",
  networkError: "Erro de conexão. Verifique sua internet.",
  validationError: "Por favor, verifique os dados informados.",
  unauthorized: "Acesso não autorizado.",
  notFound: "Recurso não encontrado.",
  
  // Confirmações
  confirmDelete: "Tem certeza que deseja excluir este item?",
  confirmCancel: "Tem certeza que deseja cancelar?",
  confirmLogout: "Tem certeza que deseja sair?",
};

export default {
  toastConfig,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  updateToast,
  notifications,
};
