import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Alert, CircularProgress,
  IconButton, Chip, Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';
import { sellerService } from '../../services/seller.service';
import { getErrorMessage } from '../../utils/getErrorMessage';

const emptyForm = {
  name: '',
  description: '',
  price: '',
  compare_price: '',
  stock_quantity: '',
  sku: '',
  category_id: '',
};

const flattenCategories = (list, depth = 0) => {
  const result = [];
  for (const cat of list) {
    result.push({ id: cat.id, name: cat.name, depth });
    if (cat.children?.length) result.push(...flattenCategories(cat.children, depth + 1));
  }
  return result;
};

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
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
          });
          setImages(p.images || []);
        }).finally(() => setLoading(false))
      );
    }
  }, [id]);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewFiles((prev) => [...prev, ...files]);
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
    e.preventDefault();
    if (!form.category_id) { setError('Please select a category.'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { setError('Please enter a valid price.'); return; }
    if (!form.stock_quantity || parseInt(form.stock_quantity) < 0) { setError('Please enter a valid stock quantity.'); return; }

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
                        onChange={(e) => setForm((p) => ({ ...p, category_id: Number(e.target.value) }))}
                      >
                        {categories.length === 0 ? (
                          <MenuItem disabled value="">No categories available</MenuItem>
                        ) : (
                          categories.map((c) => (
                            <MenuItem key={c.id} value={c.id} sx={{ pl: 2 + c.depth * 2 }}>
                              {c.depth > 0 ? `↳ ${c.name}` : c.name}
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
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
                  <input type="file" hidden multiple accept="image/*" onChange={handleFileChange} />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Supported formats: JPG, PNG, WEBP. Max 10 images.
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
                    ? 'Your changes will be visible to buyers immediately after saving.'
                    : 'Once created, the product will be visible to buyers on the store.'}
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={saving}
                  sx={{ mb: 1 }}
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
