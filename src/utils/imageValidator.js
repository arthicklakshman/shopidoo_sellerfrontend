// src/utils/imageValidator.js

export const IMAGE_RULES = {
  product: {
    minSize: 10 * 1024, // 10 KB (Just to prevent corrupted/empty files)
    maxSize: 5 * 1024 * 1024, // 5 MB (Standard max for product uploads)
    minWidth: 1000, // 1000px minimum is required to enable hover-zoom features
    minHeight: 1000,
    maxWidth: 10000, // Amazon's upper limit
    maxHeight: 10000,
    requireSquare: true, // 1:1 ratio is standard for all main product galleries
  },
  banner: {
    minSize: 50 * 1024, // 50 KB 
    maxSize: 3 * 1024 * 1024, // 3 MB (Ideally should be compressed < 500KB before serving)
    minWidth: 1200, // Accommodates standard desktop viewports
    minHeight: 300,
    maxWidth: 2560, // Standard 2K/ultrawide monitor width. Anything higher is wasted bandwidth.
    maxHeight: 1200,
    requireSquare: false, 
  },
//   ONBOARDING_IMAGE = {
//   allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
//   minSize: 10 * 1024,       // 10 KB (Small enough for signatures)
//   maxSize: 5 * 1024 * 1024, // 5 MB (Large enough for phone camera photos)
//   minWidth: 200,            // Loose minimum width 
//   minHeight: 100,           // Loose minimum height 
// }
};

/**
 * Validates an image file's size and resolution.
 * @param {File} file - The image file from the input event.
 * @param {string} [imageType] - 'product', 'banner', etc.
 * @returns {Promise<File>} - Resolves with the file if valid, rejects with an error string.
 */
export const validateImage = (file, imageType) => {
  return new Promise((resolve, reject) => {
    const rules = IMAGE_RULES[imageType];

    // 1. Bypass check
    if (!rules) {
      console.warn(`No rules found for image type: ${imageType || 'unknown'}. Bypassing strict validation.`);
      return resolve(file); 
    }

    // 2. Validate File Size
    const minKB = Math.round(rules.minSize / 1024);
    const maxMB = rules.maxSize / (1024 * 1024);

    if (file.size < rules.minSize) {
      return reject(`File is too small. Minimum size is ${minKB}KB.`);
    }
    if (file.size > rules.maxSize) {
      return reject(`File is too large. Maximum size is ${maxMB}MB.`);
    }

    // 3. Validate Resolution
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl); 

      const { width, height } = img;

      // Check minimums
      if (width < rules.minWidth || height < rules.minHeight) {
        return reject(`Image too small. Minimum resolution is ${rules.minWidth}x${rules.minHeight}px (Uploaded: ${width}x${height}px).`);
      }

      // Check maximums
      if (width > rules.maxWidth || height > rules.maxHeight) {
        return reject(`Image too large. Maximum resolution is ${rules.maxWidth}x${rules.maxHeight}px (Uploaded: ${width}x${height}px).`);
      }

      // Check aspect ratio if square is required
      if (rules.requireSquare && width !== height) {
        return reject(`Image must be a perfect square (1:1 aspect ratio). Uploaded image is ${width}x${height}px.`);
      }

      resolve(file); 
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject("Failed to read the file. Please ensure it is a valid image.");
    };

    img.src = objectUrl;
  });
};






// // src/utils/imageValidator.js

// export const IMAGE_RULES = {
//   product: {
//     maxSize: 2 * 1024 * 1024, // 2MB in bytes
//     requiredWidth: 800,
//     requiredHeight: 800,
//   },
//   banner: {
//     maxSize: 5 * 1024 * 1024, // 5MB in bytes
//     requiredWidth: 1920,
//     requiredHeight: 1080,
//   }
// };

// /**
//  * Validates an image file's size and resolution.
//  * @param {File} file - The image file from the input event.
//  * @param {string} [imageType] - 'product', 'banner', etc.
//  * @returns {Promise<File>} - Resolves with the file if valid, rejects with an error string.
//  */
// export const validateImage = (file, imageType) => {
//   return new Promise((resolve, reject) => {
//     const rules = IMAGE_RULES[imageType];

//     // 1. Bypass check: If it's not a restricted type, let it pass.
//     if (!rules) {
//       console.warn(`No rules found for image type: ${imageType || 'unknown'}. Bypassing strict validation.`);
//       return resolve(file); 
//     }

//     // 2. Validate File Size
//     if (file.size > rules.maxSize) {
//       return reject(`File size must be less than ${rules.maxSize / (1024 * 1024)}MB.`);
//     }

//     // 3. Validate Resolution
//     const img = new Image();
//     const objectUrl = URL.createObjectURL(file);

//     img.onload = () => {
//       URL.revokeObjectURL(objectUrl); // Prevent memory leaks

//       const { width, height } = img;

//       if (width !== rules.requiredWidth || height !== rules.requiredHeight) {
//         return reject(`Invalid resolution. Expected ${rules.requiredWidth}x${rules.requiredHeight}px, but got ${width}x${height}px.`);
//       }

//       // Passes all checks
//       resolve(file); 
//     };

//     img.onerror = () => {
//       URL.revokeObjectURL(objectUrl);
//       reject("Failed to read the file. Please ensure it is a valid image.");
//     };

//     img.src = objectUrl;
//   });
// };