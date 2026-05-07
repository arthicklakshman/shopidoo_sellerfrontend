import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  IconButton, Chip, Divider, RadioGroup, FormControlLabel, Radio, Stack,
  Switch,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';
import { sellerService } from '../../services/seller.service';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { getDeliverySummary } from '../../utils/shipping';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  compare_price: '',
  stock_quantity: '',
  sku: '',
  category_id: '',
  subcategory_id:'',
  delivery_type: 'free',
  delivery_charge: '',
  free_delivery_min_order: '',
  express_delivery_charge: '',
};

const MAX_PRODUCT_IMAGES = 6;

const flattenCategories = (list, depth = 0) => {
  const result = [];
  for (const cat of list) {
    result.push({ id: cat.id, name: cat.name, parent_id: cat.parent_id ?? null, depth });
    if (cat.children?.length) result.push(...flattenCategories(cat.children, depth + 1));
  }
  return result;
};

const emptyCustomSpec = () => ({ name: '', value: '', is_custom: true });

const CustomSpecsEditor = ({ customSpecs, onChange, onAdd, onRemove }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
      <Typography variant="body2" fontWeight={600}>Custom Attributes</Typography>
      <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={onAdd}>
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
            <Button color="error" onClick={() => onRemove(index)} fullWidth sx={{ height: '100%' }}>
              Remove
            </Button>
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

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [customSpecs, setCustomSpecs] = useState([]);
  const [images, setImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState('');

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
            category_id: p.category_id != null ? Number(p.category_id) : '',
            subcategory_id: p.subcategory_id != null ? Number(p.subcategory_id) : '',
            delivery_type: p.delivery_type || 'free',
            delivery_charge: p.delivery_charge || '',
            free_delivery_min_order: p.free_delivery_min_order || '',
            express_delivery_charge: p.express_delivery_charge || '',
          });
          setAttributeValues(
            (p.specifications || []).reduce((acc, spec) => {
              if (spec.attribute_id) acc[String(spec.attribute_id)] = spec.value || '';
              return acc;
            }, {})
          );
          setCustomSpecs((p.specifications || []).filter((spec) => spec.is_custom || !spec.attribute_id));
          setImages(p.images || []);
        }).finally(() => setLoading(false))
      );
    }
  }, [id]);

  useEffect(() => {
    const categoryId = form.subcategory_id || form.category_id;
    if (!categoryId) {
      setCategoryAttributes([]);
      return;
    }

    sellerService.getCategoryAttributes(categoryId)
      .then(({ data }) => setCategoryAttributes(data.data || []))
      .catch(() => setCategoryAttributes([]));
  }, [form.category_id, form.subcategory_id]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleAttributeChange = (attributeId) => (e) => {
    setAttributeValues((prev) => ({ ...prev, [String(attributeId)]: e.target.value }));
  };

  const handleCustomSpecChange = (index, field) => (e) => {
    const value = e.target.value;
    setCustomSpecs((prev) => prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec)));
  };

  const buildSpecifications = () => {
    const structured = categoryAttributes.map((attribute, index) => ({
      attribute_id: attribute.id,
      name: attribute.name,
      value: attributeValues[String(attribute.id)] || '',
      input_type: attribute.input_type,
      unit: attribute.unit || null,
      is_custom: false,
      sort_order: attribute.sort_order ?? index,
    }));

    const custom = customSpecs
      .map((spec, index) => ({
        name: String(spec.name || '').trim(),
        value: String(spec.value || '').trim(),
        is_custom: true,
        sort_order: categoryAttributes.length + index,
      }))
      .filter((spec) => spec.name && spec.value);

    return [...structured, ...custom].filter((spec) => String(spec.value || '').trim());
  };

  const renderAttributeField = (attribute) => {
    const value = attributeValues[String(attribute.id)] || '';
    const label = `${attribute.name}${attribute.unit ? ` (${attribute.unit})` : ''}`;
    const options = attribute.options || [];

    if (attribute.input_type === 'select') {
      return (
        <FormControl fullWidth required={attribute.is_required}>
          <InputLabel>{label}</InputLabel>
          <Select value={value} label={label} onChange={handleAttributeChange(attribute.id)}>
            <MenuItem value="">Select {attribute.name}</MenuItem>
            {options.map((option) => <MenuItem key={option.id} value={option.value}>{option.value}</MenuItem>)}
          </Select>
        </FormControl>
      );
    }

    if (attribute.input_type === 'radio') {
      return (
        <FormControl required={attribute.is_required}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{label}</Typography>
          <RadioGroup row value={value} onChange={handleAttributeChange(attribute.id)}>
            {options.map((option) => (
              <FormControlLabel key={option.id} value={option.value} control={<Radio size="small" />} label={option.value} />
            ))}
          </RadioGroup>
        </FormControl>
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
    const totalExistingImages = images.length + newFiles.length;
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

    setNewFiles((prev) => [...prev, ...filesToAdd]);
    e.target.value = '';
  };

  const removeNewFile = (index) => setNewFiles((prev) => prev.filter((_, i) => i !== index));

  const handleDeleteImage = async (imageId) => {
    try {
      await sellerService.removeImage(id, imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      dispatch(showToast({ message: getErrorMessage(err), severity: 'error' }));
    }
  };

  const handleSubmit = async (e) => {
  if (e) e.preventDefault();
  
    if (!form.category_id) { setError('Please select a category.'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { setError('Please enter a valid price.'); return; }
    if (!form.stock_quantity || parseInt(form.stock_quantity) < 0) { setError('Please enter a valid stock quantity.'); return; }
    if ((images.length + newFiles.length) > MAX_PRODUCT_IMAGES) { setError(`You can upload up to ${MAX_PRODUCT_IMAGES} images only.`); return; }
    if (form.delivery_type === 'fixed' && (!form.delivery_charge || parseFloat(form.delivery_charge) <= 0)) {
      setError('Please enter a delivery charge for fixed delivery.');
      return;
    }
    if (form.delivery_type === 'conditional' && (!form.delivery_charge || parseFloat(form.delivery_charge) <= 0 || !form.free_delivery_min_order || parseFloat(form.free_delivery_min_order) <= 0)) {
      setError('Please enter delivery charge and free delivery threshold.');
      return;
    }

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
        category_id: parseInt(form.category_id),
        subcategory_id: form.subcategory_id ? parseInt(form.subcategory_id) : null,
        delivery_type: form.delivery_type,
        delivery_charge: form.delivery_type === 'free' ? 0 : parseFloat(form.delivery_charge || 0),
        free_delivery_min_order: form.delivery_type === 'conditional' ? parseFloat(form.free_delivery_min_order || 0) : null,
        express_delivery_charge: form.express_delivery_charge ? parseFloat(form.express_delivery_charge) : null,
        specifications: buildSpecifications(),
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
        newFiles.forEach((f) => fd.append('images', f));
        await sellerService.addImages(productId, fd);
      }

      dispatch(showToast({ message: isEdit ? 'Product updated!' : 'Product created!', severity: 'success' }));
      navigate('/products');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

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

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left — main fields */}
          <Grid item xs={12} md={8}>
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
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="MRP / Compare Price (₹)"
                      type="number"
                      value={form.compare_price}
                      onChange={handleChange('compare_price')}
                      fullWidth
                      placeholder="0.00"
                      helperText="Original price (shown as strikethrough)"
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Stock Quantity"
                      type="number"
                      value={form.stock_quantity}
                      onChange={handleChange('stock_quantity')}
                      fullWidth required
                      placeholder="0"
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
                    <FormControl fullWidth required>
                      <InputLabel id="cat-label">Category</InputLabel>
                      <Select
                        labelId="cat-label"
                        label="Category"
                        value={form.category_id}
                        onChange={(e) => setForm((p) => ({ ...p, category_id: Number(e.target.value), subcategory_id: '' }))}
                      >
                        {categories.length === 0 ? (
                          <MenuItem disabled value="">No categories available</MenuItem>
                        ) : (
                          categories.filter(c => !c.parent_id).map((c) => (
                            <MenuItem key={c.id} value={c.id}>
                              {c.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
              <InputLabel>Subcategory</InputLabel>

              <Select
              value={form.subcategory_id}
              label="Subcategory"
              onChange={(e)=>
              setForm({
              ...form,
              subcategory_id:e.target.value
              })
              }
              >

              <MenuItem value="">
              Select Subcategory
              </MenuItem>

              {categories
              .filter(
              c=>c.parent_id ==
              form.category_id
              )
              .map(sub=>(
              <MenuItem
              key={sub.id}
              value={sub.id}
              >
              {sub.name}
              </MenuItem>
              ))}

              </Select>
              </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Specifications</Typography>
                <Divider sx={{ mb: 2 }} />
                {categoryAttributes.length > 0 ? (
                  <Grid container spacing={2}>
                    {categoryAttributes.map((attribute) => (
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

                <Divider sx={{ my: 2 }} />
                <CustomSpecsEditor
                  customSpecs={customSpecs}
                  onChange={handleCustomSpecChange}
                  onAdd={() => setCustomSpecs((prev) => [...prev, emptyCustomSpec()])}
                  onRemove={(index) => setCustomSpecs((prev) => prev.filter((_, i) => i !== index))}
                />
              </CardContent>
            </Card>

            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Shipping & Delivery</Typography>
                <Divider sx={{ mb: 2 }} />

                <FormControlLabel
                  control={
                    <Switch
                      checked={form.delivery_type === 'free'}
                      onChange={(e) => setForm((prev) => ({
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
                          onChange={(e) => setForm((prev) => ({ ...prev, delivery_type: e.target.value }))}
                        >
                          <FormControlLabel value="fixed" control={<Radio size="small" />} label="Fixed charge" />
                          <FormControlLabel value="conditional" control={<Radio size="small" />} label="Free above order value" />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Delivery Charge (Rs)"
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
                          label="Free Delivery Above (Rs)"
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
                  label="Express Delivery Charge (Rs)"
                  type="number"
                  value={form.express_delivery_charge}
                  onChange={handleChange('express_delivery_charge')}
                  fullWidth
                  sx={{ mt: 2 }}
                  helperText="Optional faster delivery fee."
                  inputProps={{ min: 0, step: 0.01 }}
                />

                <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={700} gutterBottom>Shipping Summary Preview</Typography>
                  <Typography variant="body2" color="text.secondary">Product Rs {Number(form.price || 0).toLocaleString('en-IN')}</Typography>
                  <Typography variant="body2" color={deliverySummary.deliveryCharge === 0 ? 'success.main' : 'text.secondary'}>
                    Delivery {deliverySummary.deliveryCharge === 0 ? 'Free' : `Rs ${deliverySummary.deliveryCharge.toLocaleString('en-IN')}`}
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={700}>Total Rs {deliverySummary.total.toLocaleString('en-IN')}</Typography>
                  <Typography variant="caption" color="text.secondary">{deliverySummary.label}</Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Product Images</Typography>
                <Divider sx={{ mb: 2 }} />

                {/* Existing images (edit mode) */}
                {images.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {images.map((img) => (
                      <Box key={img.id} sx={{ position: 'relative' }}>
                        <Box
                          component="img"
                          src={img.image_url}
                          sx={{
                            width: 90, height: 90, objectFit: 'cover', borderRadius: 1,
                            border: '2px solid',
                            borderColor: img.is_primary ? 'primary.main' : 'divider',
                          }}
                        />
                        <IconButton
                          size="small" color="error"
                          onClick={() => handleDeleteImage(img.id)}
                          sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', boxShadow: 1, p: 0.3 }}
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        {img.is_primary && (
                          <Chip label="Main" size="small" color="primary"
                            sx={{ position: 'absolute', bottom: 4, left: 4, height: 18, fontSize: 10 }} />
                        )}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Newly selected files */}
                {newFiles.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                    {newFiles.map((f, i) => (
                      <Chip
                        key={i}
                        label={f.name}
                        size="small"
                        onDelete={() => removeNewFile(i)}
                      />
                    ))}
                  </Box>
                )}

                <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                  {newFiles.length > 0 ? 'Add More Images' : 'Upload Images'}
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Supported formats: JPG, PNG, WEBP. Max 6 images.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Right — submit */}
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
                  sx={{ mb: 1 }}
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
