// Members are always Indian mobile numbers, stored as "+91" + 10 digits with
// no separators (e.g. "+919876543210") so substring search never breaks on
// spaces or formatting. These helpers convert between that storage format
// and what the UI shows/accepts.

export const digitsOnly = (value = '') => String(value || '').replace(/\D/g, '');

// Last 10 digits of whatever's stored — handles "+91 98765 43210",
// "9876543210", "091-98765-43210", etc. Not a real 10-digit number (e.g. the
// "Not provided" placeholder on bulk-imported members) collapses to ''.
export const localDigitsFromStored = (stored = '') => {
  const digits = digitsOnly(stored);
  return digits.length >= 10 ? digits.slice(-10) : '';
};

export const toStoredPhone = (localDigits = '') => (localDigits.length === 10 ? `+91${localDigits}` : localDigits);

export const formatPhoneDisplay = (stored = '') => {
  const digits = localDigitsFromStored(stored);
  if (!digits) return stored || '';
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
};
