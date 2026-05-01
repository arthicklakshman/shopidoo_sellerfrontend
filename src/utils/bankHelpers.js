export const findBankName = (ifscCode = '') => {
  const code = ifscCode.trim().toUpperCase();
  if (!code || code.length < 4) return '';

  const bankCodes = {
    SBIN: 'State Bank of India',
    HDFC: 'HDFC Bank',
    ICIC: 'ICICI Bank',
    UTIB: 'Axis Bank',
    PUNB: 'Punjab National Bank',
    BARB: 'Bank of Baroda',
    CNRB: 'Canara Bank',
    IDIB: 'Indian Bank',
    KKBK: 'Kotak Mahindra Bank',
    YESB: 'Yes Bank',
    INDB: 'IndusInd Bank',
    FDRL: 'Federal Bank',
  };

  return bankCodes[code.slice(0, 4)] || 'Bank will be verified from IFSC';
};
