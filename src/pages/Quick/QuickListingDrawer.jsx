// The "Add a new product" drawer from the seller Figma.
// It lists one of the seller's existing products on QUICK (or both channels) with a
// separate QUICK price, stock reserved from main inventory, and delivery areas.
// Brand-new products are created with the normal product form first (images, HSN,
// dimensions etc. are still required), then come back here — see "Create new product".
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Alert, Autocomplete, Avatar, Box, Button, Checkbox, CircularProgress, Drawer, Grid, IconButton,
  InputAdornment, Stack, TextField, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import { showToast } from '../../features/ui/uiSlice';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { quickService } from '../../services/quick.service';
import { formatINR } from './quickUi';

// Seller panel brand colour (teal) to match the seller Figma
const TEAL = '#0B8457';
const TEAL_SOFT = '#E6F6F1';
const rupee = { startAdornment: <InputAdornment position="start">₹</InputAdornment> };
const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '10px', bgcolor: 'background.paper' } };

const CHANNELS = [
  { value: 'shopidoo', label: 'Shopidoo', hint: 'Regular marketplace', icon: StorefrontOutlinedIcon },
  { value: 'quick', label: 'QUICK only', hint: 'Fast local delivery', icon: BoltIcon },
  { value: 'both', label: 'Both channels', hint: 'Recommended for wider reach', icon: LayersOutlinedIcon },
];

const Step = ({ n, title, subtitle, children }) => (
  <Box sx={{ border: 1, borderColor: 'divider', borderRadius: '14px', p: 2, mb: 2, bgcolor: 'background.paper' }}>
    <Stack direction="row" spacing={1.25} sx={{ mb: 1.75 }}>
      <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: TEAL_SOFT, color: TEAL, fontSize: 12, fontWeight: 700, display: 'grid', placeItems: 'center', flexShrink: 0 }}>{n}</Box>
      <Box>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{subtitle}</Typography>}
      </Box>
    </Stack>
    {children}
  </Box>
);

const emptyForm = {
  listing_channel: 'both',
  quick_price: '',
  quick_mrp: '',
  quick_stock: '',
  quick_max_order_qty: '',
  quick_service_area_ids: [],
  quick_seller_delivery_charge: '',
};

const QuickListingDrawer = ({ open, onClose, onSaved, products, initialProductId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [productId, setProductId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [areas, setAreas] = useState([]);
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    Promise.all([quickService.areas(), quickService.config()])
      .then(([a, c]) => { setAreas(a.data.data || []); setConfig(c.data.data); })
      .catch((err) => setError(getErrorMessage(err)));
    setProductId(initialProductId || null);
    setError('');
  }, [open, initialProductId]);

  const product = useMemo(() => products.find((p) => p.id === productId) || null, [products, productId]);

  // Prefill from the chosen product
  useEffect(() => {
    if (!product) { setForm(emptyForm); return; }
    const isQuick = product.listing_channel !== 'shopidoo';
    setForm({
      listing_channel: isQuick ? product.listing_channel : 'both',
      quick_price: product.quick_price ?? product.price ?? '',
      quick_mrp: product.quick_mrp ?? product.compare_price ?? '',
      quick_stock: isQuick ? product.quick_stock : Math.min(product.stock_quantity, 10),
      quick_max_order_qty: product.quick_max_order_qty ?? '',
      quick_service_area_ids: product.quick_service_area_ids || [],
      quick_seller_delivery_charge: product.quick_seller_delivery_charge ?? '',
    });
  }, [product]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const quickOn = form.listing_channel !== 'shopidoo';
  const mainStock = product?.stock_quantity ?? 0;
  const discount = Number(form.quick_mrp) > 0 && Number(form.quick_price) > 0
    ? Math.round((1 - Number(form.quick_price) / Number(form.quick_mrp)) * 100) : 0;

  const problems = [];
  if (product && quickOn) {
    if (!(Number(form.quick_price) > 0)) problems.push('Enter a QUICK selling price.');
    if (form.quick_mrp !== '' && Number(form.quick_mrp) < Number(form.quick_price)) problems.push('MRP cannot be lower than the QUICK price.');
    if (form.quick_stock === '' || Number(form.quick_stock) < 0) problems.push('Enter QUICK available stock.');
    if (Number(form.quick_stock) > mainStock) problems.push(`QUICK stock cannot exceed main inventory (${mainStock}).`);
    if (!form.quick_service_area_ids.length) problems.push('Select at least one delivery area.');
  }

  const toggleArea = (id) => setForm((f) => ({
    ...f,
    quick_service_area_ids: f.quick_service_area_ids.includes(id)
      ? f.quick_service_area_ids.filter((x) => x !== id)
      : [...f.quick_service_area_ids, id],
  }));

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await quickService.saveListing(product.id, quickOn ? {
        ...form,
        quick_seller_delivery_charge: config?.seller_shipping_enabled ? form.quick_seller_delivery_charge : null,
      } : { listing_channel: 'shopidoo' });
      dispatch(showToast({
        message: quickOn ? `${product.name} is listed on QUICK.` : `${product.name} removed from QUICK.`,
        severity: 'success',
      }));
      onSaved();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const notApproved = product && product.admin_status !== 'approved';

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 560 }, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' } }}>
      <Stack direction="row" alignItems="flex-start" sx={{ px: 3, py: 2.25, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: 'text.secondary', textTransform: 'uppercase' }}>QUICK listing</Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 700 }}>Add a product to QUICK</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Choose where you want to sell this product.</Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ border: 1, borderColor: 'divider', borderRadius: '10px' }}><CloseIcon fontSize="small" /></IconButton>
      </Stack>

      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {config && !config.quick_enabled && <Alert severity="warning" sx={{ mb: 2 }}>QUICK is paused by Shopidoo right now. You can still prepare listings.</Alert>}

        <Step n={1} title="Product details" subtitle="Pick one of your products. Its normal Shopidoo listing stays unchanged.">
          <Autocomplete
            options={products}
            value={product}
            onChange={(_, v) => setProductId(v?.id || null)}
            getOptionLabel={(p) => `${p.name} · ${p.product_code}`}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderOption={(props, p) => (
              <Box component="li" {...props} key={p.id} sx={{ display: 'flex', gap: 1.25, alignItems: 'center' }}>
                <Avatar variant="rounded" src={p.image} sx={{ width: 32, height: 32 }}>{p.name?.[0]}</Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14 }} noWrap>{p.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {p.product_code} · {formatINR(p.price)} · {p.stock_quantity} in stock
                    {p.listing_channel !== 'shopidoo' ? ' · on QUICK' : ''}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => <TextField {...params} label="Search your products" sx={fieldSx} />}
          />
          <Button
            startIcon={<AddIcon />}
            onClick={() => { onClose(); navigate('/products/new?channel=quick'); }}
            sx={{ textTransform: 'none', mt: 1, color: TEAL }}
          >
            Create a new product instead
          </Button>

          {product && (
            <>
              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                {[
                  ['SKU', product.sku || '-'],
                  ['Normal selling price', formatINR(product.price)],
                  ['Main inventory stock', `${mainStock} units`],
                  ['Approval', product.admin_status],
                ].map(([k, v]) => (
                  <Grid item xs={6} key={k}>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{k}</Typography>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, textTransform: k === 'Approval' ? 'capitalize' : 'none' }}>{v}</Typography>
                  </Grid>
                ))}
              </Grid>
              {product.has_variants && (
                <Alert severity="info" sx={{ mt: 1.5 }}>
                  This product has variants. QUICK uses one price and one stock pool for the product.
                </Alert>
              )}
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mt: 2, mb: 1 }}>Listing channels</Typography>
              <Grid container spacing={1}>
                {CHANNELS.map((c) => {
                  const on = form.listing_channel === c.value;
                  return (
                    <Grid item xs={4} key={c.value}>
                      <Box
                        onClick={() => setForm((f) => ({ ...f, listing_channel: c.value }))}
                        sx={{
                          p: 1.25, borderRadius: '10px', cursor: 'pointer', height: '100%',
                          border: 1.5, borderColor: on ? TEAL : 'divider', bgcolor: on ? TEAL_SOFT : 'background.paper',
                        }}
                      >
                        <c.icon sx={{ fontSize: 18, color: on ? TEAL : 'text.secondary' }} />
                        <Typography sx={{ fontSize: 13, fontWeight: 600, mt: 0.5 }}>{c.label}</Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{c.hint}</Typography>
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>
            </>
          )}
        </Step>

        {product && quickOn && (
          <>
            <Step n={2} title="QUICK selling price" subtitle="Independent from normal marketplace pricing.">
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={4}>
                  <TextField label="Normal selling price" value={product.price} disabled InputProps={rupee} fullWidth sx={fieldSx}
                    helperText="Used for the Shopidoo channel" />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="QUICK selling price" type="number" value={form.quick_price} onChange={set('quick_price')} InputProps={rupee} fullWidth sx={fieldSx} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField label="MRP" type="number" value={form.quick_mrp} onChange={set('quick_mrp')} InputProps={rupee} fullWidth sx={fieldSx}
                    helperText={discount > 0 ? <Box component="span" sx={{ color: TEAL, fontWeight: 600 }}>{discount}% QUICK discount</Box> : ' '} />
                </Grid>
              </Grid>
            </Step>

            <Step n={3} title="QUICK stock allocation" subtitle="Reserved from main inventory to prevent overselling.">
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ p: 1.25, borderRadius: '10px', bgcolor: TEAL_SOFT, mb: 1.75 }}>
                <Inventory2OutlinedIcon sx={{ fontSize: 18, color: TEAL }} />
                <Typography sx={{ fontSize: 13, flex: 1 }}>Main inventory available: <b>{mainStock} units</b></Typography>
                <Box sx={{ fontSize: 11, px: 1, py: 0.25, borderRadius: '6px', bgcolor: 'background.paper', color: TEAL, fontWeight: 600 }}>Synced</Box>
              </Stack>
              <Grid container spacing={1.5}>
                <Grid item xs={6}>
                  <TextField label="QUICK available stock" type="number" value={form.quick_stock} onChange={set('quick_stock')} fullWidth sx={fieldSx}
                    inputProps={{ min: 0, max: mainStock }} helperText="Reserved from main inventory" />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Maximum order quantity" type="number" value={form.quick_max_order_qty} onChange={set('quick_max_order_qty')} fullWidth sx={fieldSx}
                    inputProps={{ min: 1 }} helperText={form.quick_max_order_qty ? `Customers can buy up to ${form.quick_max_order_qty}` : 'No maximum limit'} />
                </Grid>
              </Grid>
            </Step>

            <Step n={4} title="QUICK delivery areas" subtitle="Select from admin-approved service areas.">
              {areas.length === 0 ? (
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>No active service areas yet. Shopidoo will add them soon.</Typography>
              ) : (
                <Grid container spacing={1}>
                  {areas.map((a) => {
                    const on = form.quick_service_area_ids.includes(a.id);
                    return (
                      <Grid item xs={12} sm={6} key={a.id}>
                        <Box
                          onClick={() => toggleArea(a.id)}
                          sx={{
                            display: 'flex', gap: 1, alignItems: 'flex-start', p: 1.25, borderRadius: '10px', cursor: 'pointer',
                            border: 1.5, borderColor: on ? TEAL : 'divider', bgcolor: on ? TEAL_SOFT : 'background.paper',
                          }}
                        >
                          <Checkbox size="small" checked={on} sx={{ p: 0, '&.Mui-checked': { color: TEAL } }} />
                          <PlaceOutlinedIcon sx={{ fontSize: 18, color: on ? TEAL : 'text.secondary' }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{a.name}</Typography>
                            <Typography sx={{ fontSize: 11, color: 'text.secondary' }} noWrap>
                              {a.delivery_commitment} · {a.pincodes.join(', ')}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1.25 }}>Service areas are managed by Shopidoo admin and cannot be edited here.</Typography>
            </Step>

            {config?.seller_shipping_enabled && (
              <Step n={5} title="Your delivery charge (optional)" subtitle="Leave empty to use Shopidoo platform shipping. Customers are never charged both.">
                <TextField label="Delivery charge per order" type="number" value={form.quick_seller_delivery_charge}
                  onChange={set('quick_seller_delivery_charge')} InputProps={rupee} sx={{ ...fieldSx, width: 240 }} />
              </Step>
            )}
          </>
        )}

        {notApproved && quickOn && (
          <Alert severity="info">This product will go live on QUICK after Shopidoo approves it.</Alert>
        )}
        {problems.length > 0 && (
          <Alert severity="warning" sx={{ mt: 1 }}>{problems.join(' ')}</Alert>
        )}
      </Box>

      <Stack direction="row" spacing={1.25} justifyContent="flex-end" sx={{ px: 3, py: 2, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none', borderRadius: '10px', color: 'text.primary', borderColor: 'divider' }}>Cancel</Button>
        <Button
          onClick={save}
          disabled={!product || saving || problems.length > 0}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
          sx={{
            textTransform: 'none', borderRadius: '10px', fontWeight: 600, px: 2.5, color: '#000',
            background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
            '&.Mui-disabled': { background: '#e2e8f0', color: '#94a3b8' },
          }}
        >
          {quickOn ? 'Save QUICK listing' : 'Remove from QUICK'}
        </Button>
      </Stack>
    </Drawer>
  );
};

export default QuickListingDrawer;
