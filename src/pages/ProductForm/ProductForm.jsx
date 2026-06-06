import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  IconButton, Chip, Divider, RadioGroup, FormControlLabel, Radio, Stack,
  Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Checkbox, ListItemText, Avatar, Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';
import { sellerService } from '../../services/seller.service';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getDeliverySummary } from '../../utils/shipping';
import api from '../../services/api';

// ─── Commission hint hook ─────────────────────────────────────────────────────
function useCommissionHint(price) {
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (price == null || price === '' || isNaN(Number(price)) || Number(price) <= 0) {
      setCommission(null);
      return;
    }
    setLoading(true);
    api.get('/settings')
      .then(res => {
        const raw = res.data?.dataValues || res.data?.data || res.data;
        let slabs = raw?.commissionSlabs;
        if (typeof slabs === 'string') {
          try { slabs = JSON.parse(slabs); } catch { slabs = []; }
        }
        if (!Array.isArray(slabs)) { setCommission(null); return; }
        const p = Number(price);
        const matched = slabs
          .sort((a, b) => b.minPrice - a.minPrice)
          .find(s =>
            p >= Number(s.minPrice) &&
            (s.maxPrice === null || s.maxPrice === '' || p <= Number(s.maxPrice))
          );
        setCommission(matched ? matched.commission : null);
      })
      .catch(() => setCommission(null))
      .finally(() => setLoading(false));
  }, [price]);

  return { commission, loading };
}

// ─── Constants ────────────────────────────────────────────────────────────────
const emptyForm = {
  name: '',
  description: '',
  price: '',
  compare_price: '',
  stock_quantity: '',
  sku: '',
  condition: 'new',
  category_id: '',
  subcategory_id: '',
  delivery_type: 'free',
  delivery_charge: '',
  free_delivery_min_order: '',
  express_delivery_charge: '',
  custom_category: '',
  hsn_code: '',
  gst_rate: '',
};

const MAX_PRODUCT_IMAGES = 6;

const primaryButtonStyle = {
  background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
  color: '#000',
  fontWeight: 700,
  '&:hover': {
    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
    color: '#000',
    opacity: 0.9,
  },
};

const secondaryButtonStyle = {
  borderColor: '#0FB9B1',
  color: '#0FB9B1',
  fontWeight: 600,
  '&:hover': {
    borderColor: '#0B8457',
    color: '#0B8457',
    backgroundColor: 'rgba(15, 185, 177, 0.08)',
  },
};

const formFocusStyles = {
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': { borderColor: '#0FB9B1' },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: '#0FB9B1' },
  '& .MuiRadio-root.Mui-checked': { color: '#0FB9B1' },
  '& .MuiCheckbox-root.Mui-checked': { color: '#0FB9B1' },
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#0FB9B1' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#0FB9B1' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const createColorGroup = (color = '') => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  color,
  sizes: [],
});

const emptySizeVariant = (defaults = {}) => ({
  size: '',
  stock_quantity: 0,
  price: defaults.price || '',
  compare_price: defaults.compare_price || '',
  sku: '',
});

const getVariantValue = (variant, names) => {
  const attrs = variant?.variant_attributes || {};
  const key = Object.keys(attrs).find(attrName => names.includes(String(attrName).toLowerCase()));
  return key ? attrs[key] : '';
};

const groupFashionVariants = (flatVariants = []) => {
  const groups = new Map();
  flatVariants.forEach(variant => {
    const color = getVariantValue(variant, ['color', 'colour']);
    const size = getVariantValue(variant, ['size', 'shoe size', 'footwear size', 'uk size', 'us size', 'eu size']);
    if (!color || !size) return;
    if (!groups.has(color)) groups.set(color, createColorGroup(color));
    groups.get(color).sizes.push({
      id: variant.id,
      size,
      stock_quantity: variant.stock_quantity ?? 0,
      price: variant.price ?? '',
      compare_price: variant.compare_price ?? '',
      sku: variant.sku || '',
      image_url: variant.image_url || '',
    });
  });
  return Array.from(groups.values());
};

const flattenCategories = (list, depth = 0, parent = null) => {
  const result = [];
  for (const cat of list) {
    const flatCategory = {
      id: cat.id, name: cat.name, slug: cat.slug,
      category_type: cat.category_type,
      parent_id: cat.parent_id ?? parent?.id ?? null,
      parent_name: parent?.name || null,
      parent_slug: parent?.slug || null,
      parent_category_type: parent?.category_type || null,
      depth,
    };
    result.push(flatCategory);
    if (cat.children?.length) result.push(...flattenCategories(cat.children, depth + 1, flatCategory));
  }
  return result;
};

const normalizeCategoryText = (value) => String(value || '').toLowerCase().trim();

const categoryHasAny = (category, matchers) => {
  const haystack = [
    category?.category_type, category?.name, category?.slug,
    category?.parent_category_type, category?.parent_name, category?.parent_slug,
  ].map(normalizeCategoryText).join(' ');
  return matchers.some(matcher => haystack.includes(normalizeCategoryText(matcher)));
};

const isColorAttributeName = (name) => ['color', 'colour'].includes(normalizeCategoryText(name));

const isSizeLikeAttributeName = (name) => {
  const normalized = normalizeCategoryText(name);
  return normalized === 'size' || normalized.includes('size') || normalized.includes('age group');
};

const emptyCustomSpec = () => ({ name: '', value: '', is_custom: true });

// ─── Sub-components ───────────────────────────────────────────────────────────
const CustomSpecsEditor = ({ customSpecs, onChange, onAdd, onRemove }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography variant="body2" fontWeight={600}>Custom Attributes</Typography>
      <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={onAdd} sx={secondaryButtonStyle}>
        Add Custom Attribute
      </Button>
    </Box>
    <Stack spacing={1.5}>
      {customSpecs.map((spec, index) => (
        <Grid container spacing={1.5} key={index}>
          <Grid item xs={12} sm={5}>
            <TextField label="Attribute" value={spec.name || ''} onChange={onChange(index, 'name')} fullWidth />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField label="Value" value={spec.value || ''} onChange={onChange(index, 'value')} fullWidth />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button color="error" onClick={() => onRemove(index)} fullWidth sx={{ height: '100%' }}>Remove</Button>
          </Grid>
        </Grid>
      ))}
      {customSpecs.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          Add one-off details like warranty, package contents, or regional variants.
        </Typography>
      )}
    </Stack>
  </Box>
);

const VariantImageUpload = ({ url, onUpload, onRemove }) => {
  const [loading, setLoading] = useState(false);
  const inputId = useMemo(() => `variant-image-upload-${Math.random().toString(36).substr(2, 9)}`, []);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const { data } = await sellerService.uploadImage(formData);
      onUpload(data.data.url);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <input accept="image/*" style={{ display: 'none' }} id={inputId} type="file" onChange={handleChange} />
      <label htmlFor={url ? '' : inputId}>
        <Tooltip title={url ? 'Click to change' : 'Upload Image'}>
          <Box sx={{ position: 'relative', cursor: 'pointer' }}>
            <Avatar src={url} variant="rounded" sx={{ width: 40, height: 40, border: '1px solid', borderColor: 'divider' }}>
              {loading ? <CircularProgress size={20} /> : <CloudUploadIcon fontSize="small" />}
            </Avatar>
          </Box>
        </Tooltip>
      </label>
      {url && (
        <IconButton size="small" color="error" onClick={onRemove}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

// ─── Commission Badge ─────────────────────────────────────────────────────────
const CommissionBadge = ({ price }) => {
  const { commission, loading } = useCommissionHint(price);

  if (!price || Number(price) <= 0) return null;
  if (loading) return (
    <Box mt={0.75} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <CircularProgress size={10} sx={{ color: '#0B8457' }} />
      <Typography fontSize={11} color="text.secondary">Calculating commission...</Typography>
    </Box>
  );
  if (commission === null) return null;

  return (
    <Box
      mt={0.75} px={1.5} py={0.6}
      sx={{
        background: 'linear-gradient(135deg, #e6f7f4, #d4f0ec)',
        borderRadius: 1.5,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        border: '1px solid #b2e4df',
      }}
    >
      <InfoOutlinedIcon sx={{ fontSize: 13, color: '#0B8457' }} />
      <Typography fontSize={12} color="#0B8457" fontWeight={700}>
        Platform fees for this price: ₹{commission}
      </Typography>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [variantAttributeValues, setVariantAttributeValues] = useState({});
  const [variants, setVariants] = useState([]);
  const [colorGroups, setColorGroups] = useState([]);
  const [customSpecs, setCustomSpecs] = useState([]);
  const [images, setImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [colorFiles, setColorFiles] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

  // ── Hooks must all be at top level, before any early returns ──
  const { commission } = useCommissionHint(form.price);

  const mrpWarning = useMemo(() => {
  const selling = parseFloat(form.price) || 0;
  const mrp = parseFloat(form.compare_price) || 0;
  const comm = commission ?? 0;
  if (mrp > 0 && mrp <= selling + comm) {
    return `MRP must be greater than ₹${(selling + comm).toLocaleString('en-IN')} (Selling ₹${selling} + Commission ₹${comm})`;
  }
  return null;
}, [form.price, form.compare_price, commission])
  const variantAttributes = useMemo(() => categoryAttributes.filter(a => a.is_variant), [categoryAttributes]);
  const colorAttribute = useMemo(() => variantAttributes.find(a => isColorAttributeName(a.name)), [variantAttributes]);
  const sizeAttribute = useMemo(() => variantAttributes.find(a => isSizeLikeAttributeName(a.name)), [variantAttributes]);

  const currentCategory = useMemo(() => {
    const catId = form.subcategory_id || form.category_id;
    return categories.find(c => Number(c.id) === Number(catId));
  }, [categories, form.category_id, form.subcategory_id]);

  const isFashionVariantCategory = useMemo(() => {
    if (!colorAttribute || !sizeAttribute) return false;
    return categoryHasAny(currentCategory, [
      'fashion', 'clothing', 'apparel', 'footwear', 'shoe',
      'sports clothing', 'kids clothing', 'kids-clothing',
    ]);
  }, [colorAttribute, sizeAttribute, currentCategory]);

  const uniqueColors = useMemo(() => {
    if (isFashionVariantCategory) return colorGroups.map(g => g.color).filter(Boolean);
    const colors = new Set();
    variants.forEach(v => {
      const color = v.variant_attributes?.Color || v.variant_attributes?.Colour;
      if (color) colors.add(color);
    });
    return Array.from(colors);
  }, [colorGroups, isFashionVariantCategory, variants]);

  useEffect(() => {
    sellerService.getCategories().then(({ data }) => {
      setCategories(flattenCategories(data.data || []));
    }).catch(() => {});

    if (isEdit) {
      import('../../services/api').then(({ default: api }) =>
        api.get(`/products/${id}`).then(({ data }) => {
          const p = data.data;
          setForm({
  name: p.name || '',
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
  hsn_code: p.hsn_code || '',        // ✅ added
  gst_rate: p.gst_rate || '',        // ✅ added
  custom_category: p.custom_category || '',  // ✅ added
});
          setAttributeValues(
            (p.specifications || []).reduce((acc, spec) => {
              if (spec.attribute_id && !spec.is_variant) acc[String(spec.attribute_id)] = spec.value || '';
              return acc;
            }, {})
          );
          if (p.variants && p.variants.length > 0) {
            setVariants(p.variants);
            setColorGroups(groupFashionVariants(p.variants));
            const reconstructedVariantAttrs = {};
            p.variants.forEach(v => {
              Object.entries(v.variant_attributes).forEach(([key, val]) => {
                if (!reconstructedVariantAttrs[key]) reconstructedVariantAttrs[key] = new Set();
                reconstructedVariantAttrs[key].add(val);
              });
            });
            const formattedVariantAttrs = {};
            Object.keys(reconstructedVariantAttrs).forEach(k => {
              formattedVariantAttrs[k] = Array.from(reconstructedVariantAttrs[k]);
            });
            setVariantAttributeValues(formattedVariantAttrs);
          }
          setCustomSpecs((p.specifications || []).filter(spec => spec.is_custom || (!spec.attribute_id && !spec.is_variant)));
          setImages(p.images || []);
        }).finally(() => setLoading(false))
      );
    }
  }, [id]);

  useEffect(() => {
    const categoryId = form.subcategory_id || form.category_id;
    if (!categoryId) { setCategoryAttributes([]); return; }
    sellerService.getCategoryAttributes(categoryId)
      .then(({ data }) => setCategoryAttributes(data.data || []))
      .catch(() => setCategoryAttributes([]));
  }, [form.category_id, form.subcategory_id]);

  useEffect(() => {
    let total = 0;
    if (isFashionVariantCategory) {
      colorGroups.forEach(group => group.sizes.forEach(size => { total += (Number(size.stock_quantity) || 0); }));
    } else if (variants.length > 0) {
      variants.forEach(v => { total += (Number(v.stock_quantity) || 0); });
    }
    if (isFashionVariantCategory ? colorGroups.length > 0 : variants.length > 0) {
      setForm(prev => ({ ...prev, stock_quantity: total }));
    }
  }, [colorGroups, variants, isFashionVariantCategory]);

  const handleChange = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleAttributeChange = (attributeId) => (e) => {
    setAttributeValues(prev => ({ ...prev, [String(attributeId)]: e.target.value }));
  };

  const handleVariantAttributeChange = (attributeId, attributeName) => (e) => {
    const value = e.target.value;
    setVariantAttributeValues(prev => ({
      ...prev,
      [attributeName]: typeof value === 'string' ? value.split(',') : value,
    }));
  };

  const handleCustomSpecChange = (index, field) => (e) => {
    const value = e.target.value;
    setCustomSpecs(prev => prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)));
  };

  const generateVariants = () => {
    const variantAttrs = categoryAttributes.filter(a => a.is_variant);
    if (!variantAttrs.length) return;
    const optionsArray = variantAttrs.map(attr => {
      const values = variantAttributeValues[attr.name] || [];
      return Array.isArray(values) && values.length > 0 ? values.map(v => ({ [attr.name]: v })) : [];
    }).filter(arr => arr.length > 0);
    if (!optionsArray.length) { setVariants([]); return; }
    const combinations = optionsArray.reduce((a, b) =>
      a.reduce((r, v) => r.concat(b.map(w => ({ ...v, ...w }))), [])
    );
    const newVariants = combinations.map(combo => {
      const existing = variants.find(v => JSON.stringify(v.variant_attributes) === JSON.stringify(combo));
      return existing || { sku: '', price: form.price || '', stock_quantity: 0, variant_attributes: combo };
    });
    setVariants(newVariants);
  };

  const updateVariant = (index, field, value) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const addColorGroup = () => setColorGroups(prev => [...prev, createColorGroup('')]);
  const removeColorGroup = (groupIndex) => setColorGroups(prev => prev.filter((_, i) => i !== groupIndex));

  const updateColorGroup = (groupIndex, field, value) => {
    if (field === 'color') {
      const previousColor = colorGroups[groupIndex]?.color;
      if (previousColor && previousColor !== value && colorFiles[previousColor]?.length) {
        setColorFiles(prev => {
          const next = { ...prev };
          next[value] = [...(next[value] || []), ...(next[previousColor] || [])];
          delete next[previousColor];
          return next;
        });
      }
    }
    setColorGroups(prev => prev.map((group, index) => {
      if (index !== groupIndex) return group;
      return { ...group, [field]: value };
    }));
  };

  const addSizeToColorGroup = (groupIndex) => {
    setColorGroups(prev => prev.map((group, index) => {
      if (index !== groupIndex) return group;
      return {
        ...group,
        sizes: [...group.sizes, emptySizeVariant({ price: form.price, compare_price: form.compare_price })],
      };
    }));
  };

  const updateColorGroupSize = (groupIndex, sizeIndex, field, value) => {
    setColorGroups(prev => prev.map((group, index) => {
      if (index !== groupIndex) return group;
      return {
        ...group,
        sizes: group.sizes.map((size, rowIndex) => rowIndex === sizeIndex ? { ...size, [field]: value } : size),
      };
    }));
  };

  const removeColorGroupSize = (groupIndex, sizeIndex) => {
    setColorGroups(prev => prev.map((group, index) => {
      if (index !== groupIndex) return group;
      return { ...group, sizes: group.sizes.filter((_, rowIndex) => rowIndex !== sizeIndex) };
    }));
  };

  const buildFashionVariants = () => {
    if (!isFashionVariantCategory) return variants;
    return colorGroups.flatMap(group => {
      const color = String(group.color || '').trim();
      if (!color) return [];
      return group.sizes.map(sizeRow => {
        const size = String(sizeRow.size || '').trim();
        if (!size) return null;
        return {
          sku: String(sizeRow.sku || '').trim(),
          price: parseFloat(sizeRow.price) || 0,
          compare_price: sizeRow.compare_price ? parseFloat(sizeRow.compare_price) : null,
          stock_quantity: parseInt(sizeRow.stock_quantity) || 0,
          image_url: sizeRow.image_url || null,
          variant_attributes: {
            [colorAttribute.name]: color,
            [sizeAttribute.name]: size,
          },
        };
      }).filter(Boolean);
    });
  };

  const buildSpecifications = () => {
  const structured = categoryAttributes.map((attribute, index) => {
    const qtyKey = `__qty__${attribute.id}`;
    const qtyValue = attributeValues[qtyKey];
    const baseValue = attributeValues[String(attribute.id)] || '';
    const finalValue = qtyValue && baseValue
      ? `${baseValue} × ${qtyValue}`
      : baseValue;

    return {
      attribute_id: attribute.id,
      name: attribute.name,
      value: finalValue,
      input_type: attribute.input_type,
      unit: attribute.unit || null,
      is_custom: false,
      sort_order: attribute.sort_order ?? index,
    };
  });

  const custom = customSpecs
    .map((spec, index) => ({
      name: String(spec.name || '').trim(),
      value: String(spec.value || '').trim(),
      is_custom: true,
      sort_order: categoryAttributes.length + index,
    }))
    .filter(spec => spec.name && spec.value);

  return [...structured, ...custom].filter(spec => String(spec.value || '').trim());
};

  const renderAttributeField = (attribute) => {
  const label = `${attribute.name}${attribute.unit ? ` (${attribute.unit})` : ''}`;
  const options = attribute.options || [];
  const isQuantityLinked = ['size', 'shoe size', 'volume', 'weight']
    .includes(attribute.name.toLowerCase());

  if (attribute.is_variant) {
    const value = variantAttributeValues[attribute.name] || [];
    if (!options.length) {
      return (
        <TextField
          label={`${label} (Variant)`}
          value={Array.isArray(value) ? value.join(', ') : value}
          onChange={(e) => {
            const values = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
            setVariantAttributeValues(prev => ({ ...prev, [attribute.name]: values }));
          }}
          fullWidth
          helperText="Enter multiple values separated by commas."
          required={attribute.is_required}
        />
      );
    }
    return (
      <FormControl fullWidth>
        <InputLabel>{label} (Variant)</InputLabel>
        <Select
          multiple value={value}
          onChange={handleVariantAttributeChange(attribute.id, attribute.name)}
          renderValue={selected => selected.join(', ')}
          label={`${label} (Variant)`}
        >
          {options.map(option => (
            <MenuItem key={option.id} value={option.value}>
              <Checkbox checked={value.indexOf(option.value) > -1} />
              <ListItemText primary={option.value} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  const value = attributeValues[String(attribute.id)] || '';
  // quantity key per attribute
  const qtyKey = `__qty__${attribute.id}`;
  const qtyValue = attributeValues[qtyKey] || '';

  if (attribute.input_type === 'select') {
    return (
      <Box>
        <FormControl fullWidth required={attribute.is_required}>
          <InputLabel>{label}</InputLabel>
          <Select value={value} label={label} onChange={handleAttributeChange(attribute.id)}>
            <MenuItem value="">Select {attribute.name}</MenuItem>
            {options.map(option => (
              <MenuItem key={option.id} value={option.value}>{option.value}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {isQuantityLinked && value && (
          <TextField
            label={`Quantity for ${value}`}
            type="number"
            value={qtyValue}
            onChange={(e) =>
              setAttributeValues(prev => ({ ...prev, [qtyKey]: e.target.value }))
            }
            fullWidth
            placeholder="e.g. 2"
            inputProps={{ min: 1 }}
            sx={{ mt: 1 }}
            helperText={`How many units of ${value}?`}
          />
        )}
      </Box>
    );
  }

  if (attribute.input_type === 'radio') {
    return (
      <Box>
        <FormControl required={attribute.is_required}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{label}</Typography>
          <RadioGroup row value={value} onChange={handleAttributeChange(attribute.id)}>
            {options.map(option => (
              <FormControlLabel
                key={option.id}
                value={option.value}
                control={<Radio size="small" />}
                label={option.value}
              />
            ))}
          </RadioGroup>
        </FormControl>
        {isQuantityLinked && value && (
          <TextField
            label={`Quantity for ${value}`}
            type="number"
            value={qtyValue}
            onChange={(e) =>
              setAttributeValues(prev => ({ ...prev, [qtyKey]: e.target.value }))
            }
            fullWidth
            placeholder="e.g. 2"
            inputProps={{ min: 1 }}
            sx={{ mt: 1 }}
            helperText={`How many units of ${value}?`}
          />
        )}
      </Box>
    );
  }

  return (
    <TextField
      label={label}
      type={attribute.input_type === 'number' ? 'number' : 'text'}
      value={value}
      onChange={handleAttributeChange(attribute.id)}
      fullWidth
      required={attribute.is_required}
    />
  );
};
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const totalColorFiles = Object.values(colorFiles).reduce((sum, f) => sum + f.length, 0);
    const totalExistingImages = images.length + newFiles.length + totalColorFiles;
    const availableSlots = MAX_PRODUCT_IMAGES - totalExistingImages;
    if (availableSlots <= 0) {
      dispatch(showToast({ message: `You can upload up to ${MAX_PRODUCT_IMAGES} images only.`, severity: 'error' }));
      e.target.value = '';
      return;
    }
    const filesToAdd = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      dispatch(showToast({ message: `Only ${MAX_PRODUCT_IMAGES} images are allowed per product.`, severity: 'warning' }));
    }
    setNewFiles(prev => [...prev, ...filesToAdd]);
    e.target.value = '';
  };

  const removeNewFile = (index) => setNewFiles(prev => prev.filter((_, i) => i !== index));

  const handleColorFileChange = (color) => (e) => {
    const files = Array.from(e.target.files || []);
    const totalColorFiles = Object.values(colorFiles).reduce((sum, f) => sum + f.length, 0);
    const totalExistingImages = images.length + newFiles.length + totalColorFiles;
    const availableSlots = MAX_PRODUCT_IMAGES - totalExistingImages;
    if (!String(color || '').trim()) {
      dispatch(showToast({ message: 'Enter a color name before uploading color images.', severity: 'warning' }));
      e.target.value = '';
      return;
    }
    if (availableSlots <= 0) {
      dispatch(showToast({ message: `You can upload up to ${MAX_PRODUCT_IMAGES} images only.`, severity: 'error' }));
      e.target.value = '';
      return;
    }
    const filesToAdd = files.slice(0, availableSlots);
    if (files.length > availableSlots) {
      dispatch(showToast({ message: `Only ${MAX_PRODUCT_IMAGES} images are allowed per product.`, severity: 'warning' }));
    }
    setColorFiles(prev => ({ ...prev, [color]: [...(prev[color] || []), ...filesToAdd] }));
    e.target.value = '';
  };

  const removeColorFile = (color, index) => {
    setColorFiles(prev => ({ ...prev, [color]: prev[color].filter((_, i) => i !== index) }));
  };

  const handleDeleteImage = async (imageId) => {
    try {
      await sellerService.removeImage(id, imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
    } catch (err) {
      dispatch(showToast({ message: getErrorMessage(err), severity: 'error' }));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const flattenedFashionVariants = buildFashionVariants();
    const submittedVariants = isFashionVariantCategory ? flattenedFashionVariants : variants;
    const totalColorFiles = Object.values(colorFiles).reduce((sum, f) => sum + f.length, 0);

    if (mrpWarning) { setError('MRP must be greater than Selling Price + Platform Commission.'); return; }
    if (!form.category_id) { setError('Please select a category.'); return; }
    if (!form.category_id) { setError('Please select a category.'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { setError('Please enter a valid price.'); return; }
    if (!submittedVariants.length && (!form.stock_quantity || parseInt(form.stock_quantity) < 0)) { setError('Please enter a valid stock quantity.'); return; }
    if ((images.length + newFiles.length + totalColorFiles) > MAX_PRODUCT_IMAGES) { setError(`You can upload up to ${MAX_PRODUCT_IMAGES} images only.`); return; }
    if (isFashionVariantCategory && colorGroups.length === 0) { setError('Add at least one color variant for fashion products.'); return; }
    if (isFashionVariantCategory && colorGroups.length > 0 && !flattenedFashionVariants.length) { setError('Add at least one color with one size before saving fashion variants.'); return; }
    if (isFashionVariantCategory && colorGroups.some(group => !String(group.color || '').trim())) { setError('Each color block needs a color name.'); return; }
    if (form.delivery_type === 'fixed' && (!form.delivery_charge || parseFloat(form.delivery_charge) <= 0)) { setError('Please enter a delivery charge for fixed delivery.'); return; }
    if (!form.hsn_code?.trim()) { setError('Please enter an HSN Code.'); return; }
    if (!form.gst_rate) { setError('Please select a GST Rate.'); return; }
    if (form.delivery_type === 'conditional' && (!form.delivery_charge || parseFloat(form.delivery_charge) <= 0 || !form.free_delivery_min_order || parseFloat(form.free_delivery_min_order) <= 0)) { setError('Please enter delivery charge and free delivery threshold.'); return; }

    setSaving(true);
    setError('');

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock_quantity: parseInt(form.stock_quantity),
        sku: form.sku.trim() || null,
        condition: form.condition,
        category_id: parseInt(form.category_id),
        subcategory_id: form.subcategory_id ? parseInt(form.subcategory_id) : null,
        delivery_type: form.delivery_type,
        delivery_charge: form.delivery_type === 'free' ? 0 : parseFloat(form.delivery_charge || 0),
        free_delivery_min_order: form.delivery_type === 'conditional' ? parseFloat(form.free_delivery_min_order || 0) : null,
        express_delivery_charge: form.express_delivery_charge ? parseFloat(form.express_delivery_charge) : null,
        specifications: buildSpecifications(),
        hsn_code: form.hsn_code?.trim() || null,
        gst_rate: form.gst_rate || null,
        custom_category: form.custom_category?.trim() || null,
        variants: submittedVariants.length > 0 ? submittedVariants.map(v => ({
          ...v,
          price: parseFloat(v.price) || 0,
          compare_price: v.compare_price ? parseFloat(v.compare_price) : null,
          stock_quantity: parseInt(v.stock_quantity) || 0,
          custom_category: form.custom_category?.trim() || null,
          hsn_code: form.hsn_code?.trim() || null,
          gst_rate: form.gst_rate || null,
        })) : undefined,
      };

      let productId = id;

      if (isEdit) {
        await sellerService.updateProduct(id, payload);
      } else {
        const { data } = await sellerService.createProduct(payload);
        productId = data.data.id;
      }

      if (newFiles.length > 0) {
        const fd = new FormData();
        newFiles.forEach(f => fd.append('images', f));
        await sellerService.addImages(productId, fd);
      }

      for (const [color, files] of Object.entries(colorFiles)) {
        if (files.length > 0) {
          const fd = new FormData();
          files.forEach(f => fd.append('images', f));
          fd.append('color', color);
          await sellerService.addImages(productId, fd);
        }
      }

      dispatch(showToast({ message: isEdit ? 'Product updated!' : 'Product created!', severity: 'success' }));
      navigate('/products');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Early return AFTER all hooks ──
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  const deliverySummary = getDeliverySummary(form);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/products')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={formFocusStyles}>
        <Grid container spacing={3}>
          {/* ── Left column ── */}
          <Grid item xs={12} md={8}>

            {/* Basic Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Basic Information</Typography>
                <Divider sx={{ mb: 2 }} />

                <TextField
                  label="Product Name"
                  value={form.name}
                  onChange={handleChange('name')}
                  fullWidth required
                  placeholder="e.g. Running Shoes - Blue"
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Description"
                  value={form.description}
                  onChange={handleChange('description')}
                  fullWidth multiline rows={4}
                  placeholder="Describe your product..."
                  sx={{ mb: 2 }}
                />

                <Grid container spacing={2}>
                  {/* ── Selling Price + commission hint ── */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Selling Price (₹)"
                      type="number"
                      value={form.price}
                      onChange={handleChange('price')}
                      fullWidth required
                      placeholder="0.00"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                    <CommissionBadge price={form.price} />
                  </Grid>

                <Grid item xs={12} sm={6}>
  <TextField
    label="MRP / Compare Price (₹)"
    type="number"
    value={form.compare_price}
    onChange={handleChange('compare_price')}
    fullWidth
    placeholder="0.00"
    helperText={mrpWarning || "Original price (shown as strikethrough)"}
    FormHelperTextProps={{ sx: { color: mrpWarning ? '#e65100' : 'text.secondary' } }}
    inputProps={{ min: 0, step: 0.01 }}
    error={!!mrpWarning}
  />
</Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Stock Quantity"
                      type="number"
                      value={form.stock_quantity}
                      onChange={handleChange('stock_quantity')}
                      fullWidth
                      required={isFashionVariantCategory ? colorGroups.length === 0 : variants.length === 0}
                      disabled={isFashionVariantCategory ? colorGroups.length > 0 : variants.length > 0}
                      placeholder="0"
                      helperText={(isFashionVariantCategory ? colorGroups.length > 0 : variants.length > 0) ? 'Automatically calculated from variants' : ''}
                      inputProps={{ min: 0 }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="SKU"
                      value={form.sku}
                      onChange={handleChange('sku')}
                      fullWidth
                      placeholder="e.g. SHOE-BLU-42"
                      helperText="Optional — leave blank to skip"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
  <FormControl fullWidth>
    <InputLabel>Product Condition</InputLabel>
    <Select
      value={form.condition}
      label="Product Condition"
      onChange={handleChange('condition')}
    >
      <MenuItem value="new">New</MenuItem>
      <MenuItem value="used">Used</MenuItem>
      <MenuItem value="refurbished">Refurbished</MenuItem>
    </Select>
  </FormControl>
</Grid>

              {/* ── Category and Conditionally Nested Input ── */}
<Grid item xs={12} sm={6}>
  <FormControl fullWidth required>
    <InputLabel id="cat-label">Category</InputLabel>
    <Select
      labelId="cat-label"
      label="Category"
      value={form.category_id}
      onChange={(e) => {
        const val = e.target.value;
        setForm(p => ({ 
          ...p, 
          category_id: val === 'others' ? 'others' : Number(val), 
          subcategory_id: '', 
          custom_category: val === 'others' ? p.custom_category : '' 
        }));
      }}
    >
      {categories.length === 0 ? (
        <MenuItem disabled value="">No categories available</MenuItem>
      ) : (
        categories.filter(c => !c.parent_id).map(c => (
          <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
        ))
      )}
      {/* Added explicit "Others" trigger item */}
      <MenuItem value="others">Others / Not in list</MenuItem>
    </Select>
  </FormControl>

  {/* Displays input natively inline ONLY when "Others" is selected */}
  {form.category_id === 'others' && (
    <TextField
      label="Enter custom category name"
      value={form.custom_category || ''}
      onChange={(e) => setForm(p => ({ ...p, custom_category: e.target.value }))}
      fullWidth
      required
      placeholder="e.g. Handmade Crafts, Organic Food..."
      sx={{ mt: 1.5 }}
      size="small"
    />
  )}
</Grid>

{/* ── Subcategory Swapped into Left Position ── */}
<Grid item xs={12} sm={6}>
  <FormControl fullWidth disabled={form.category_id === 'others'}>
    <InputLabel>Subcategory</InputLabel>
    <Select
      value={form.subcategory_id}
      label="Subcategory"
      onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })}
    >
      <MenuItem value="">Select Subcategory</MenuItem>
      {categories
        .filter(c => c.parent_id == form.category_id)
        .map(sub => (
          <MenuItem key={sub.id} value={sub.id}>{sub.name}</MenuItem>
        ))
      }
    </Select>
  </FormControl>
</Grid>

{/* ── HSN Code Field ── */}
<Grid item xs={12} sm={6}>
  <TextField
    label="HSN Code"
    value={form.hsn_code || ''}
    onChange={handleChange('hsn_code')}
    fullWidth
    required
    placeholder="e.g. 6403, 8471, 1001"
    helperText="Harmonized System Nomenclature code"
    inputProps={{ maxLength: 8 }}
  />
</Grid>

{/* ── GST Rate Dropdown ── */}
<Grid item xs={12} sm={6}>
  <FormControl fullWidth required>
    <InputLabel>GST Rate (%)</InputLabel>
    <Select
      value={form.gst_rate || ''}
      label="GST Rate (%)"
      onChange={handleChange('gst_rate')}
    >
      <MenuItem value="">Select GST Rate</MenuItem>
      <MenuItem value="0">0% — Exempt</MenuItem>
      <MenuItem value="3">3%</MenuItem>
      <MenuItem value="5">5%</MenuItem>
      <MenuItem value="12">12%</MenuItem>
      <MenuItem value="18">18%</MenuItem>
      <MenuItem value="28">28%</MenuItem>
    </Select>
  </FormControl>
</Grid>
                </Grid> {/* Closes Basic Info Layout row cleanly here */}
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Specifications</Typography>
                <Divider sx={{ mb: 2 }} />
                {categoryAttributes.length > 0 ? (
                  <Grid container spacing={2}>
                    {categoryAttributes
                      .filter(attribute => !(isFashionVariantCategory && attribute.is_variant))
                      .map(attribute => (
                        <Grid item xs={12} sm={attribute.input_type === 'radio' ? 12 : 6} key={attribute.id}>
                          {renderAttributeField(attribute)}
                        </Grid>
                      ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select a category to load suggested specifications.
                  </Typography>
                )}

                {/* Fashion color+size variants */}
                {isFashionVariantCategory && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>Color Variants</Typography>
                        <Typography variant="body2" color="text.secondary">Manage fashion stock by color gallery and size rows.</Typography>
                      </Box>
                      <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addColorGroup} sx={secondaryButtonStyle}>
                        Add Color Variant
                      </Button>
                    </Box>

                    <Stack spacing={2}>
                      {colorGroups.map((group, groupIndex) => {
                        const existingColorImages = images.filter(img => img.color === group.color);
                        const previewImage = existingColorImages[0]?.image_url;
                        const colorOptions = colorAttribute.options || [];
                        const sizeOptions = sizeAttribute.options || [];
                        const sizeLabel = sizeAttribute?.name || 'Size';

                        return (
                          <Box key={group.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flex: 1 }}>
                                <Avatar
                                  src={previewImage}
                                  variant="rounded"
                                  sx={{ width: 56, height: 56, border: '1px solid', borderColor: 'divider' }}
                                >
                                  {group.color ? group.color.charAt(0).toUpperCase() : <CloudUploadIcon />}
                                </Avatar>
                                {colorOptions.length > 0 ? (
                                  <FormControl fullWidth>
                                    <InputLabel>Color Name</InputLabel>
                                    <Select
                                      label="Color Name"
                                      value={group.color}
                                      onChange={(e) => updateColorGroup(groupIndex, 'color', e.target.value)}
                                    >
                                      <MenuItem value="">Select color</MenuItem>
                                      {colorOptions.map(option => (
                                        <MenuItem key={option.id} value={option.value}>{option.value}</MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                ) : (
                                  <TextField
                                    label="Color Name"
                                    value={group.color}
                                    onChange={(e) => updateColorGroup(groupIndex, 'color', e.target.value)}
                                    fullWidth
                                    placeholder="Black"
                                  />
                                )}
                              </Box>
                              <IconButton color="error" onClick={() => removeColorGroup(groupIndex)}>
                                <DeleteIcon />
                              </IconButton>
                            </Box>

                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                              Upload {group.color || 'Color'} Images
                            </Typography>

                            {(existingColorImages.length > 0 || colorFiles[group.color]?.length > 0) && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                {existingColorImages.map(img => (
                                  <Box key={img.id} sx={{ position: 'relative' }}>
                                    <Box component="img" src={img.image_url} sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
                                    <IconButton size="small" color="error" onClick={() => handleDeleteImage(img.id)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', boxShadow: 1, p: 0.3 }}>
                                      <DeleteIcon sx={{ fontSize: 14 }} />
                                    </IconButton>
                                  </Box>
                                ))}
                                {(colorFiles[group.color] || []).map((f, i) => (
                                  <Chip key={`${f.name}-${i}`} label={f.name} size="small" onDelete={() => removeColorFile(group.color, i)} />
                                ))}
                              </Box>
                            )}

                            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small" sx={secondaryButtonStyle}>
                              Upload Images
                              <input type="file" hidden multiple accept="image/*" onChange={handleColorFileChange(group.color)} />
                            </Button>

                            <Box sx={{ mt: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body2" fontWeight={700}>{sizeLabel}s</Typography>
                                <Button size="small" startIcon={<AddIcon />} onClick={() => addSizeToColorGroup(groupIndex)} sx={secondaryButtonStyle}>
                                  Add {sizeLabel}
                                </Button>
                              </Box>

                              {group.sizes.length > 0 ? (
                                <TableContainer sx={{ overflowX: 'auto' }}>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell sx={{ minWidth: 120 }}>{sizeLabel}</TableCell>
                                        <TableCell sx={{ minWidth: 110 }}>Stock</TableCell>
                                        <TableCell sx={{ minWidth: 120 }}>Price (₹)</TableCell>
                                        <TableCell sx={{ minWidth: 130 }}>Compare (₹)</TableCell>
                                        <TableCell sx={{ minWidth: 140 }}>SKU</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {group.sizes.map((sizeRow, sizeIndex) => (
                                        <TableRow key={sizeIndex}>
                                          <TableCell>
                                            {sizeOptions.length > 0 ? (
                                              <FormControl fullWidth size="small">
                                                <Select
                                                  value={sizeRow.size}
                                                  onChange={(e) => updateColorGroupSize(groupIndex, sizeIndex, 'size', e.target.value)}
                                                  displayEmpty
                                                >
                                                  <MenuItem value="">{sizeLabel}</MenuItem>
                                                  {sizeOptions.map(option => (
                                                    <MenuItem key={option.id} value={option.value}>{option.value}</MenuItem>
                                                  ))}
                                                </Select>
                                              </FormControl>
                                            ) : (
                                              <TextField size="small" placeholder={sizeLabel} value={sizeRow.size} onChange={(e) => updateColorGroupSize(groupIndex, sizeIndex, 'size', e.target.value)} />
                                            )}
                                          </TableCell>
                                          <TableCell>
                                            <TextField size="small" type="number" value={sizeRow.stock_quantity} onChange={(e) => updateColorGroupSize(groupIndex, sizeIndex, 'stock_quantity', e.target.value)} inputProps={{ min: 0 }} />
                                          </TableCell>
                                          <TableCell>
                                            <TextField size="small" type="number" value={sizeRow.price} onChange={(e) => updateColorGroupSize(groupIndex, sizeIndex, 'price', e.target.value)} inputProps={{ min: 0, step: 0.01 }} />
                                          </TableCell>
                                          <TableCell>
                                            <TextField size="small" type="number" value={sizeRow.compare_price || ''} onChange={(e) => updateColorGroupSize(groupIndex, sizeIndex, 'compare_price', e.target.value)} inputProps={{ min: 0, step: 0.01 }} />
                                          </TableCell>
                                          <TableCell>
                                            <TextField size="small" placeholder="SKU" value={sizeRow.sku || ''} onChange={(e) => updateColorGroupSize(groupIndex, sizeIndex, 'sku', e.target.value)} />
                                          </TableCell>
                                          <TableCell align="right">
                                            <IconButton color="error" size="small" onClick={() => removeColorGroupSize(groupIndex, sizeIndex)}>
                                              <DeleteIcon fontSize="small" />
                                            </IconButton>
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <Typography variant="body2" color="text.secondary">No sizes added for this color yet.</Typography>
                              )}
                            </Box>
                          </Box>
                        );
                      })}

                      {colorGroups.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          Add a color variant to create color-specific galleries and size stock.
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Generic variants */}
                {!isFashionVariantCategory && categoryAttributes.some(a => a.is_variant) && (
                  <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700}>Product Variants</Typography>
                      <Button variant="outlined" size="small" onClick={generateVariants} sx={secondaryButtonStyle}>Generate Combinations</Button>
                    </Box>

                    {variants.length > 0 ? (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Variant</TableCell>
                              <TableCell>SKU</TableCell>
                              <TableCell>Price (₹)</TableCell>
                              <TableCell>Compare (₹)</TableCell>
                              <TableCell>Stock</TableCell>
                              <TableCell>Image</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {variants.map((variant, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{Object.entries(variant.variant_attributes).map(([k, v]) => `${v}`).join(' / ')}</TableCell>
                                <TableCell>
                                  <TextField size="small" placeholder="SKU" value={variant.sku || ''} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} />
                                </TableCell>
                                <TableCell>
                                  <TextField size="small" type="number" placeholder="Price" value={variant.price} onChange={(e) => updateVariant(idx, 'price', e.target.value)} inputProps={{ min: 0 }} />
                                </TableCell>
                                <TableCell>
                                  <TextField size="small" type="number" placeholder="Compare" value={variant.compare_price || ''} onChange={(e) => updateVariant(idx, 'compare_price', e.target.value)} inputProps={{ min: 0 }} />
                                </TableCell>
                                <TableCell>
                                  <TextField size="small" type="number" placeholder="Stock" value={variant.stock_quantity} onChange={(e) => updateVariant(idx, 'stock_quantity', e.target.value)} inputProps={{ min: 0 }} />
                                </TableCell>
                                <TableCell>
                                  <VariantImageUpload url={variant.image_url} onUpload={(url) => updateVariant(idx, 'image_url', url)} onRemove={() => updateVariant(idx, 'image_url', '')} />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton color="error" size="small" onClick={() => setVariants(prev => prev.filter((_, i) => i !== idx))}>
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No variants generated yet.</Typography>
                    )}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />
                <CustomSpecsEditor
                  customSpecs={customSpecs}
                  onChange={handleCustomSpecChange}
                  onAdd={() => setCustomSpecs(prev => [...prev, emptyCustomSpec()])}
                  onRemove={(index) => setCustomSpecs(prev => prev.filter((_, i) => i !== index))}
                />
              </CardContent>
            </Card>

            {/* Shipping & Delivery */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Shipping & Delivery</Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.delivery_type === 'free'}
                      onChange={(e) => setForm(prev => ({
                        ...prev,
                        delivery_type: e.target.checked ? 'free' : 'fixed',
                        delivery_charge: e.target.checked ? '' : prev.delivery_charge,
                        free_delivery_min_order: e.target.checked ? '' : prev.free_delivery_min_order,
                      }))}
                    />
                  }
                  label="Free delivery"
                  sx={{ mb: 1 }}
                />

                {form.delivery_type !== 'free' && (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>Delivery Rule</Typography>
                        <RadioGroup
                          row
                          value={form.delivery_type}
                          onChange={(e) => setForm(prev => ({ ...prev, delivery_type: e.target.value }))}
                        >
                          <FormControlLabel value="fixed" control={<Radio size="small" />} label="Fixed charge" />
                          <FormControlLabel value="conditional" control={<Radio size="small" />} label="Free above order value" />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Delivery Charge (₹)"
                        type="number"
                        value={form.delivery_charge}
                        onChange={handleChange('delivery_charge')}
                        fullWidth
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    {form.delivery_type === 'conditional' && (
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Free Delivery Above (₹)"
                          type="number"
                          value={form.free_delivery_min_order}
                          onChange={handleChange('free_delivery_min_order')}
                          fullWidth
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                    )}
                  </Grid>
                )}

                <TextField
                  label="Express Delivery Charge (₹)"
                  type="number"
                  value={form.express_delivery_charge}
                  onChange={handleChange('express_delivery_charge')}
                  fullWidth
                  sx={{ mt: 2 }}
                  helperText="Optional faster delivery fee."
                  inputProps={{ min: 0, step: 0.01 }}
                />

                {/* Shipping Summary Preview */}
                <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={700} gutterBottom>Shipping Summary Preview</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Product ₹{Number(form.price || 0).toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Commission ₹{commission ?? 0}
                  </Typography>
                  <Typography variant="body2" color={deliverySummary.deliveryCharge === 0 ? 'success.main' : 'text.secondary'}>
                    Delivery {deliverySummary.deliveryCharge === 0 ? 'Free' : `₹${deliverySummary.deliveryCharge.toLocaleString('en-IN')}`}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Total ₹{(deliverySummary.total + (commission ?? 0)).toLocaleString('en-IN')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">{deliverySummary.label}</Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Product Images */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Product Images (General)</Typography>
                <Divider sx={{ mb: 2 }} />

                {images.filter(img => !img.color).length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {images.filter(img => !img.color).map(img => (
                      <Box key={img.id} sx={{ position: 'relative' }}>
                        <Box component="img" src={img.image_url} sx={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 1, border: '2px solid', borderColor: img.is_primary ? '#0FB9B1' : 'divider' }} />
                        <IconButton size="small" color="error" onClick={() => handleDeleteImage(img.id)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', boxShadow: 1, p: 0.3 }}>
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        {img.is_primary && (
                          <Chip label="Main" size="small" sx={{ position: 'absolute', bottom: 4, left: 4, height: 18, fontSize: 10, bgcolor: '#0FB9B1', color: '#000' }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {newFiles.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {newFiles.map((f, i) => (
                      <Chip key={i} label={f.name} size="small" onDelete={() => removeNewFile(i)} />
                    ))}
                  </Box>
                )}

                <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={secondaryButtonStyle}>
                  {newFiles.length > 0 ? 'Add More Images' : 'Upload Images'}
                  <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  General images not associated with a specific color.
                </Typography>
              </CardContent>
            </Card>

            {/* Color-specific galleries */}
            {!isFashionVariantCategory && uniqueColors.map(color => (
              <Card key={color} sx={{ mb: 3, border: '1px solid', borderColor: '#0FB9B1' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" fontWeight={700}>Gallery: {color}</Typography>
                    <Chip label="Color-specific" size="small" variant="outlined" sx={{ color: '#0FB9B1', borderColor: '#0FB9B1' }} />
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {images.filter(img => img.color === color).length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {images.filter(img => img.color === color).map(img => (
                        <Box key={img.id} sx={{ position: 'relative' }}>
                          <Box component="img" src={img.image_url} sx={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }} />
                          <IconButton size="small" color="error" onClick={() => handleDeleteImage(img.id)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', boxShadow: 1, p: 0.3 }}>
                            <DeleteIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  )}

                  {colorFiles[color]?.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {colorFiles[color].map((f, i) => (
                        <Chip key={i} label={f.name} size="small" onDelete={() => removeColorFile(color, i)} />
                      ))}
                    </Box>
                  )}

                  <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={secondaryButtonStyle}>
                    Upload {color} Images
                    <input type="file" hidden multiple accept="image/*" onChange={handleColorFileChange(color)} />
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Images shown only when "{color}" is selected.
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Grid>

          {/* ── Right column — publish card ── */}
          <Grid item xs={12} md={4}>
            <Card sx={{ position: 'sticky', top: 80 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {isEdit ? 'Save Changes' : 'Publish Product'}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {isEdit
                    ? 'Updates to approved products remain subject to admin review and product status.'
                    : 'Once created, the product is sent to admin as pending and will appear to buyers only after approval.'}
                </Typography>
                <Button
                  type="button"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={saving}
                  sx={{ ...primaryButtonStyle, mb: 1 }}
                  onClick={() => handleSubmit()}
                >
                  {saving
                    ? <CircularProgress size={22} color="inherit" />
                    : isEdit ? 'Update Product' : 'Create Product'
                  }
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate('/products')}
                  disabled={saving}
                  sx={secondaryButtonStyle}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ProductForm;