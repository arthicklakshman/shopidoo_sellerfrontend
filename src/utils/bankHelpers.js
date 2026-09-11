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
    UBIN: 'Union Bank of India',
    IDIB: 'Indian Bank',
    BKID: 'Bank of India',
    CBIN: 'Central Bank of India',
    IOBA: 'Indian Overseas Bank',
    UCBA: 'UCO Bank',
    MAHB: 'Bank of Maharashtra',
    PSIB: 'Punjab & Sind Bank',
    KKBK: 'Kotak Mahindra Bank',
    YESB: 'Yes Bank',
    INDB: 'IndusInd Bank',
    FDRL: 'Federal Bank',
    IDFB: 'IDFC FIRST Bank',
    CIUB: 'City Union Bank',
    KVBL: 'Karur Vysya Bank',
    SIBL: 'South Indian Bank',
    RATN: 'RBL Bank',
    BDBL: 'Bandhan Bank',
    SCBL: 'Standard Chartered Bank',
    HSBC: 'HSBC Bank',
  };

  return bankCodes[code.slice(0, 4)] || 'Bank will be verified from IFSC';
};
