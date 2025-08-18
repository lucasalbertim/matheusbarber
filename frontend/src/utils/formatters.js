export const onlyDigits = (value = '') => (value || '').replace(/\D/g, '');

export const formatCPF = (value = '') => {
  const digits = onlyDigits(value).slice(0, 11);
  if (!digits) return '';
  const part1 = digits.slice(0, 3);
  const part2 = digits.slice(3, 6);
  const part3 = digits.slice(6, 9);
  const part4 = digits.slice(9, 11);
  let out = part1;
  if (part2) out += `.${part2}`;
  if (part3) out += `.${part3}`;
  if (part4) out += `-${part4}`;
  return out;
};

export const formatPhoneBR = (value = '') => {
  const digits = onlyDigits(value).slice(0, 11);
  if (!digits) return '';
  const ddd = digits.slice(0, 2);
  const nine = digits.length > 10;
  const mid = nine ? digits.slice(2, 7) : digits.slice(2, 6);
  const end = nine ? digits.slice(7, 11) : digits.slice(6, 10);
  let out = `(${ddd}`;
  if (digits.length >= 2) out += `)`;
  if (mid) out += ` ${mid}`;
  if (end) out += `-${end}`;
  return out;
};

export const normalizeEmail = (value = '') => (value || '').trim().toLowerCase();

export const isValidEmail = (value = '') => {
  const email = normalizeEmail(value);
  if (!email) return false;
  // RFC 5322-ish simple validation
  const re = /^(?:[a-zA-Z0-9_'^&+`{}~!#$%*?/=|-]+(?:\.[a-zA-Z0-9_'^&+`{}~!#$%*?/=|-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return re.test(email);
};

export const isValidCPF = (value = '') => {
  const cpf = onlyDigits(value);
  if (!cpf || cpf.length !== 11) return false;
  // invalid repeated numbers
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const calcCheck = (base) => {
    let sum = 0;
    for (let i = 0; i < base.length; i += 1) {
      sum += parseInt(base.charAt(i), 10) * (base.length + 1 - i);
    }
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };
  const d1 = calcCheck(cpf.substring(0, 9));
  const d2 = calcCheck(cpf.substring(0, 9) + d1);
  return cpf.endsWith(`${d1}${d2}`);
};

export const isValidPhoneBR = (value = '') => {
  const digits = onlyDigits(value);
  return digits.length === 10 || digits.length === 11;
};

