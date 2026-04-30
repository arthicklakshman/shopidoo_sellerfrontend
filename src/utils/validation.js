
export const validateRequired = (value, fieldName) => {
  if (!value || String(value).trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || email.trim() === '') return 'Email ID is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validateMobile = (phone) => {
  if (!phone || phone.trim() === '') return 'Mobile number is required';
  const phoneRegex = /^\d{10}$/;
  // Strips everything except digits before checking
  if (!phoneRegex.test(phone.replace(/\D/g, ''))) return 'Mobile number must be exactly 10 digits';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
};




export const validatePAN = (pan) => {
  if (!pan || pan.trim() === '') return 'PAN Number is required';
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i;
  if (!panRegex.test(pan)) return 'Invalid PAN format (e.g., ABCDE1234F)';
  return null;
};

export const validatePincode = (pincode) => {
  if (!pincode || String(pincode).trim() === '') return 'Pincode is required';
  const pinRegex = /^\d{6}$/;
  if (!pinRegex.test(String(pincode).trim())) return 'Pincode must be exactly 6 digits';
  return null;
};


export const validateGST = (gst) => {
  if (!gst || gst.trim() === '') return 'GST Number is required';
  // Standard Indian GST Regex
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
  if (!gstRegex.test(gst)) return 'Invalid GST format';
  return null;
};





export const validateAccountNumber = (account) => {
  if (!account || String(account).trim() === '') return 'Account number is required';
  // Allows 6 to 20 alphanumeric characters
  const accRegex = /^[a-zA-Z0-9]{6,20}$/; 
  if (!accRegex.test(String(account).trim())) return 'Account number must be 6-20 characters';
  return null;
};

export const validateRoutingNumber = (routing) => {
  if (!routing || String(routing).trim() === '') return 'Routing/IFSC is required';
  // Allows a 9-digit Routing Number OR an 11-character Indian IFSC code (like SBIN0070387)
  const routingRegex = /^([0-9]{9}|[A-Z]{4}0[A-Z0-9]{6})$/i; 
  if (!routingRegex.test(String(routing).trim())) return 'Enter a valid 9-digit Routing or 11-char IFSC code';
  return null;
};

export const validateSwiftCode = (swift) => {
  if (!swift || String(swift).trim() === '') return 'SWIFT/BIC code is required';
  // Allows standard 8 or 11 character SWIFT codes
  const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i; 
  if (!swiftRegex.test(String(swift).trim())) return 'Invalid SWIFT/BIC code format';
  return null;
};





export const validateIFSC = (ifsc) => {
  if (!ifsc || String(ifsc).trim() === '') return 'IFSC code is required';
  // Standard Indian IFSC format: 4 letters, a zero, then 6 alphanumeric characters
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/i; 
  if (!ifscRegex.test(String(ifsc).trim())) return 'Invalid IFSC code (e.g., SBIN0070387)';
  return null;
};







//   update password   
export const validateSecurity = (form) => {
  let errors = {};

  const isChangingPassword =
    form.currentPassword ||
    form.newPassword ||
    form.confirmPassword;

  if (isChangingPassword) {

    if (!form.currentPassword) {
      errors.currentPassword = "Current password is required";
    }

    if (!form.newPassword) {
      errors.newPassword = "New password is required";
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = "Confirm password is required";
    }

    // ❌ new === current
    if (
      form.currentPassword &&
      form.newPassword &&
      form.currentPassword === form.newPassword
    ) {
      errors.newPassword = "New password must be different from current password";
    }

    // ❌ mismatch
    if (
      form.newPassword &&
      form.confirmPassword &&
      form.newPassword !== form.confirmPassword
    ) {
      errors.confirmPassword = "Passwords do not match";
    }

    // 🔐 Optional strong password rule
    if (form.newPassword && form.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
  }

  return errors;
};