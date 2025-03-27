const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => password?.length >= 8;

const validateUserInput = (data) => {
  const errors = [];
  if (data.email && !validateEmail(data.email)) errors.push('Invalid email');
  if (data.password && !validatePassword(data.password)) errors.push('Password must be at least 8 characters');
  return { isValid: errors.length === 0, errors };
};

module.exports = { validateUserInput };