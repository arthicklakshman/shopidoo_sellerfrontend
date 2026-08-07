import { useEffect, useState } from 'react';
import {
  Box, Button, Card, CardContent, Typography, Grid, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  Chip, Modal, TextField, MenuItem, Stack
} from '@mui/material';
import { Add, Edit, Delete, LocalOffer } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { sellerService } from '../../services/seller.service';
import { showToast } from '../../features/ui/uiSlice';
import { getErrorMessage } from '../../utils/getErrorMessage';

const initialFormData = {
  code: '',
  title: '',
  description: '',
  discount_type: 'fixed',
  discount_value: '',
  min_purchase_amount: '',
  max_discount_amount: '',
  valid_from: '',
  valid_until: '',
  usage_limit: '',
  is_active: true,
};

const initialErrors = {
  code: '',
  discount_value: '',
  min_purchase_amount: '',
  max_discount_amount: '',
  valid_from: '',
  valid_until: '',
  usage_limit: '',
};

// ── Same dropdown anchor config used in ProductForm.jsx / SellerCMS.jsx ──
const menuPropsDownward = {
  anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  transformOrigin: { vertical: 'top', horizontal: 'left' },
  disableScrollLock: true,
  slotProps: {
    paper: {
      style: { maxHeight: 300, marginTop: 4 },
    },
  },
};

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const formatDiscount = (coupon) => (
  coupon.discount_type === 'percentage'
    ? `${Number(coupon.discount_value)}%`
    : formatCurrency(coupon.discount_value)
);

const Coupons = () => {
  const dispatch = useDispatch();

  const [coupons, setCoupons] = useState([]);
  const [stats, setStats] = useState({
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsage: 0,
    totalDiscountValue: 0,
  });

  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState(initialErrors);

  const loadCoupons = async () => {
    setLoading(true);

    try {
      const { data } = await sellerService.getCoupons();

      setCoupons(data.data?.coupons || []);
      setStats(
        data.data?.stats || {
          totalCoupons: 0,
          activeCoupons: 0,
          totalUsage: 0,
          totalDiscountValue: 0,
        }
      );
    } catch (error) {
      dispatch(
        showToast({
          message: getErrorMessage(error),
          severity: 'error',
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors(initialErrors);
    setEditId(null);
    setIsEdit(false);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const handleOpenCreate = () => {
    resetForm();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    resetForm();
  };

  const buildPayload = () => ({
    code: formData.code,
    title: formData.title,
    description: formData.description,
    discount_type: formData.discount_type,
    discount_value: Number(formData.discount_value),
    min_purchase_amount: Number(formData.min_purchase_amount || 0),
    max_discount_amount:
     formData.discount_type === 'percentage'
        ? (formData.max_discount_amount === '' ? null : Number(formData.max_discount_amount))
        : null,
    valid_from: formData.valid_from,
    valid_until: formData.valid_until,
    usage_limit: Number(formData.usage_limit || 0),
    is_active: formData.is_active,
  });

  const validateForm = () => {
    const nextErrors = { ...initialErrors };

    if (!formData.code.trim()) {
      nextErrors.code = 'Coupon code is required.';
    }

    if (!formData.discount_value || Number(formData.discount_value) <= 0) {
      nextErrors.discount_value =
        'Discount value must be greater than 0.';
    }

    if (
      formData.discount_type === 'percentage' &&
      Number(formData.discount_value) > 100
    ) {
      nextErrors.discount_value =
        'Percentage discount cannot be greater than 100.';
    }

    if (
      formData.min_purchase_amount !== '' &&
      Number(formData.min_purchase_amount) < 0
    ) {
      nextErrors.min_purchase_amount =
        'Minimum purchase must be 0 or more.';
    }

    if (
      formData.discount_type === 'percentage' &&
      formData.max_discount_amount !== '' &&
      Number(formData.max_discount_amount) < 0
    ) {
      nextErrors.max_discount_amount =
        'Max discount must be 0 or more.';
    }

    if (!formData.valid_from) {
      nextErrors.valid_from = 'Valid from date is required.';
    }

    if (!formData.valid_until) {
      nextErrors.valid_until = 'Valid until date is required.';
    }

    if (
      formData.valid_from &&
      formData.valid_until &&
      new Date(formData.valid_from) > new Date(formData.valid_until)
    ) {
      nextErrors.valid_until =
        'Valid until must be on or after valid from.';
    }

    if (
      formData.usage_limit !== '' &&
      Number(formData.usage_limit) < 0
    ) {
      nextErrors.usage_limit = 'Usage limit must be 0 or more.';
    }

    setErrors(nextErrors);

    return !Object.values(nextErrors).some(Boolean);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      dispatch(
        showToast({
          message: 'Please fix the highlighted coupon fields.',
          severity: 'error',
        })
      );
      return;
    }

    setSaving(true);

    try {
      const payload = buildPayload();

      if (isEdit) {
        await sellerService.updateCoupon(editId, payload);

        dispatch(
          showToast({
            message: 'Coupon updated.',
            severity: 'success',
          })
        );
      } else {
        await sellerService.createCoupon(payload);

        dispatch(
          showToast({
            message: 'Coupon created.',
            severity: 'success',
          })
        );
      }

      handleClose();
      await loadCoupons();
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;

      if (Array.isArray(apiErrors) && apiErrors.length > 0) {
        const nextErrors = { ...initialErrors };

        apiErrors.forEach(({ field, message }) => {
          if (
            field &&
            Object.prototype.hasOwnProperty.call(nextErrors, field)
          ) {
            nextErrors[field] = message;
          }
        });

        setErrors(nextErrors);
      }

      dispatch(
        showToast({
          message: getErrorMessage(error),
          severity: 'error',
        })
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code || '',
      title: coupon.title || '',
      description: coupon.description || '',
      discount_type: coupon.discount_type || 'fixed',
      discount_value: coupon.discount_value || '',
      min_purchase_amount: coupon.min_purchase_amount || '',
      max_discount_amount: coupon.max_discount_amount || '',
      valid_from: coupon.valid_from || '',
      valid_until: coupon.valid_until || '',
      usage_limit: coupon.usage_limit || '',
      is_active: coupon.is_active,
    });

    setEditId(coupon.id);
    setIsEdit(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await sellerService.deleteCoupon(id);

      dispatch(
        showToast({
          message: 'Coupon deleted.',
          severity: 'success',
        })
      );

      await loadCoupons();
    } catch (error) {
      dispatch(
        showToast({
          message: getErrorMessage(error),
          severity: 'error',
        })
      );
    }
  };

  return (
  <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
      <Box>
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Offers & Coupons
        </Typography>
        <Typography color="text.secondary">
          Create and manage promotional offers
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{
            background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
            color: '#000',
            '&:hover': {
              background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
              color: '#000',
            },
          }}
        onClick={handleOpenCreate}
      >
        Create Coupon
      </Button>
    </Stack>

    <Grid container spacing={3} mb={4}>
      {[
        { label: 'Total Coupons', val: stats.totalCoupons },
        { label: 'Active Coupons', val: stats.activeCoupons },
        { label: 'Total Usage', val: stats.totalUsage },
        {
          label: 'Total Discount Value',
          val: formatCurrency(stats.totalDiscountValue),
        },
      ].map((stat) => (
        <Grid item xs={12} sm={6} md={3} key={stat.label}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">{stat.label}</Typography>
                <LocalOffer fontSize="small" />
              </Stack>
              <Typography variant="h4">{stat.val}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>

    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Discount</TableCell>
            <TableCell>Min Purchase</TableCell>
            <TableCell>Max Discount</TableCell>
            <TableCell>Valid Range</TableCell>
            <TableCell>Usage</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">
                  Loading coupons...
                </Typography>
              </TableCell>
            </TableRow>
          ) : coupons.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <Typography color="text.secondary">
                  No coupons found.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>{coupon.code}</TableCell>
                <TableCell>{coupon.title || '-'}</TableCell>
                <TableCell>{formatDiscount(coupon)}</TableCell>
                <TableCell>
                  {formatCurrency(coupon.min_purchase_amount)}
                </TableCell>
                <TableCell>
                  {coupon.max_discount_amount
                    ? formatCurrency(coupon.max_discount_amount)
                    : '-'}
                </TableCell>
                <TableCell>
                  {coupon.valid_from || '-'} to {coupon.valid_until || '-'}
                </TableCell>
                <TableCell>
                  {coupon.used_count} / {coupon.usage_limit || 'Unlimited'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={coupon.is_active ? 'active' : 'inactive'}
                    color={coupon.is_active ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>

                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(coupon)}>
                    <Edit />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => handleDelete(coupon.id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>

    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '92%', sm: 640 },
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: 'background.paper',
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6">
          {isEdit ? 'Edit Coupon' : 'Create Coupon'}
        </Typography>

        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Code"
              value={formData.code}
              onChange={(e) =>
                handleInputChange('code', e.target.value.toUpperCase())
              }
              error={!!errors.code}
              helperText={errors.code}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) =>
                handleInputChange('description', e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Discount Type"
              value={formData.discount_type}
              onChange={(e) =>
                handleInputChange('discount_type', e.target.value)
              }
              SelectProps={{
                MenuProps: menuPropsDownward,
              }}
            >
              <MenuItem value="fixed">Fixed</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              fullWidth
              label="Discount Value"
              value={formData.discount_value}
              onChange={(e) =>
                handleInputChange('discount_value', e.target.value)
              }
              error={!!errors.discount_value}
              helperText={errors.discount_value}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              fullWidth
              label="Min Purchase"
              value={formData.min_purchase_amount}
              onChange={(e) =>
                handleInputChange('min_purchase_amount', e.target.value)
              }
            />
          </Grid>

         {formData.discount_type === 'percentage' && (
            <Grid item xs={12} sm={6}>
              <TextField
                type="number"
                fullWidth
                label="Max Discount"
                value={formData.max_discount_amount}
                onChange={(e) =>
                  handleInputChange('max_discount_amount', e.target.value)
                }
                error={!!errors.max_discount_amount}
                helperText={errors.max_discount_amount}
              />
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              fullWidth
              label="Valid From"
              InputLabelProps={{ shrink: true }}
              value={formData.valid_from}
              onChange={(e) =>
                handleInputChange('valid_from', e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              fullWidth
              label="Valid Until"
              InputLabelProps={{ shrink: true }}
              value={formData.valid_until}
              onChange={(e) =>
                handleInputChange('valid_until', e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              fullWidth
              label="Usage Limit"
              value={formData.usage_limit}
              onChange={(e) =>
                handleInputChange('usage_limit', e.target.value)
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              select
              fullWidth
              label="Status"
              value={String(formData.is_active)}
              onChange={(e) =>
                handleInputChange('is_active', e.target.value === 'true')
              }
              SelectProps={{
                MenuProps: menuPropsDownward,
              }}
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" mt={3} spacing={2}>
          <Button onClick={handleClose}   disabled={saving}
  sx={{
    color: '#000',
    fontWeight: 600
  }}>Cancel</Button>
          <Button
  variant="contained"
  onClick={handleSubmit}
  disabled={saving}
  sx={{
    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
    color: '#000',
    fontWeight: 600,
    borderRadius: '10px',
    px: 3,
    textTransform: 'none',
    '&:hover': {
      background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
      color: '#000',
    },
    '&:disabled': {
      background: '#bdbdbd',
      color: '#666',
    }
  }}
>
  {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
</Button>
        </Stack>
      </Box>
    </Modal>
  </Box>
);
};

export default Coupons;