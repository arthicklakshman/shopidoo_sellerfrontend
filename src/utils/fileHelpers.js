/**
 * Converts a file (image/pdf) into a Base64 string for database storage.
 * @param {File} file - The file object from an input element
 * @returns {Promise<string>} - The Base64 string
 */
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    
    fileReader.onload = () => {
      resolve(fileReader.result);
    };
    
    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};