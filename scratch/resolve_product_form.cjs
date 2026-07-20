const fs = require('fs');
const filePath = 'd:/Shop/shopidoo_sellerfrontend/src/pages/ProductForm/ProductForm.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n([\s\S]*?)\r?\n>>>>>>> (origin\/[^\r\n]*)/g;

let index = 0;
let newContent = content.replace(regex, (match, ours, theirs) => {
  console.log(`Resolving conflict ${index} in ProductForm.jsx...`);
  let resolved = '';
  if (index === 0) {
    resolved = `import { validateImage, IMAGE_RULES } from '../../utils/imageValidator';\nimport { fetchSettingsOnce } from '../../utils/settingsCache';`;
  } else if (index === 1) {
    resolved = `            name: p.name || '',
            description: p.description || '',
            price: p.price || '',
            compare_price: p.compare_price || '',
            stock_quantity: p.stock_quantity ?? '',
            sku: p.sku || '',
            condition: p.condition || 'new',
            category_id: p.category_id != null ? Number(p.category_id) : '',
            subcategory_id: p.subcategory_id != null ? Number(p.subcategory_id) : '',
            delivery_type: p.delivery_type || 'free',
            delivery_charge: p.delivery_charge || '',
            free_delivery_min_order: p.free_delivery_min_order || '',
            express_delivery_charge: p.express_delivery_charge || '',
            weight: p.weight || '',
            length: p.length || '',
            breadth: p.breadth || '',
            height: p.height || '',
            hsn_code: p.hsn_code || '',
            gst_rate: p.gst_rate != null ? String(p.gst_rate) : '',
            custom_category: p.custom_category || '',
          });`;
  }
  index++;
  return resolved;
});

fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully resolved ProductForm.jsx conflicts!');
