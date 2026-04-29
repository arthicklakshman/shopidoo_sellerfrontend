// --- src/utils/bankHelpers.js ---

const bankMap = {
    "SBIN": "State Bank of India",
    "HDFC": "HDFC Bank",
    "ICIC": "ICICI Bank",
    "BARB": "Bank of Baroda",
    "PUNB": "Punjab National Bank",
    "AXIS": "Axis Bank",
    "KKBK": "Kotak Mahindra Bank",
    "UTIB": "Axis Bank",
    "IBKL": "IDBI Bank",
    "YESB": "Yes Bank",
    "CNRB": "Canara Bank",
    "IDFB": "IDFC First Bank",
};

/**
 * Derives the Bank Name from an 11-character IFSC string.
 */
export const findBankName = (ifsc) => {
    if (!ifsc || ifsc.length < 4) return "";
    
    const code = ifsc.substring(0, 4).toUpperCase();
    return bankMap[code] || "Unknown Bank";
};  