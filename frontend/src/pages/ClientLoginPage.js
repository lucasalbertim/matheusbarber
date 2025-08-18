import { toast } from 'react-toastify';
import api from '../services/api';
import { formatCPF, formatPhoneBR, isValidCPF, isValidEmail, isValidPhoneBR, onlyDigits, normalizeEmail } from '../utils/formatters';