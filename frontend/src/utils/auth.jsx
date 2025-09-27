// Auth utility functions
export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    // Check if token is expired
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-IN').format(number);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const calculateReturns = (currentValue, investedAmount) => {
  if (investedAmount === 0) return { amount: 0, percentage: 0 };
  
  const returns = currentValue - investedAmount;
  const percentage = (returns / investedAmount) * 100;
  
  return {
    amount: returns,
    percentage: percentage
  };
};

export const getReturnsColor = (returns) => {
  if (returns > 0) return 'text-success-600';
  if (returns < 0) return 'text-danger-600';
  return 'text-gray-600';
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePAN = (pan) => {
  const re = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return re.test(pan);
};

export const validatePhone = (phone) => {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
};
