import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';
import { sellerService } from '../../services/seller.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { getErrorMessage } from '../../utils/getErrorMessage';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import api from '../../services/api';
import { fetchSettingsOnce } from '../../utils/settingsCache';

const PRODUCT_STATUSES = ['pending', 'approved', 'blocked'];

const STATUS_STYLES = {
  pending: { label: 'Pending', color: '#a16207', background: '#fef3c7' },
  approved: { label: 'Approved', color: '#166534', background: '#dcfce7' },
  blocked: { label: 'Blocked', color: '#b91c1c', background: '#fee2e2' },
};

const tableHeaderCellSx = {
  fontWeight: 500,
  fontSize: 13,
  color: 'text.secondary',
  borderBottom: 1,
  borderColor: 'divider',
  py: 1.8,
  px: 2,
  whiteSpace: 'nowrap',
};

const tableBodyCellSx = {
  borderBottom: 1,
  borderColor: 'divider',
  py: 1.4,
  px: 2,
  fontSize: 13,
  color: 'text.primary',
  verticalAlign: 'middle',
};

const getProductCode = (product) => product?.product_code || `P${String(product?.id || 0).padStart(5, '0')}`;

const truncateProductName = (name, maxLength = 35) => {
  if (!name) return '';
  const trimmed = String(name).trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}...`;
};

const getStockLabel = (quantity) => {
  if (quantity > 0) return String(quantity);
  return 'Out of Stock';
};

// ─── Commission hook ──────────────────────────────────────────────────────────
function useCommissionMap(products) {
  const [commissionMap, setCommissionMap] = useState({});

  useEffect(() => {
    if (!products.length) return;
    fetchSettingsOnce()
      .then(raw => {
        let slabs = raw?.commissionSlabs;
        if (typeof slabs === 'string') {
          try { slabs = JSON.parse(slabs); } catch { slabs = []; }
        }
        if (!Array.isArray(slabs)) return;

        const map = {};
        products.forEach(product => {
          const p = Number(product.price);
          const matched = slabs
            .sort((a, b) => b.minPrice - a.minPrice)
            .find(s =>
              p >= Number(s.minPrice) &&
              (s.maxPrice === null || s.maxPrice === '' || p <= Number(s.maxPrice))
            );
          map[product.id] = matched ? Number(matched.commission) : 0;
        });
        setCommissionMap(map);
      })
      .catch(() => { });
  }, [products]);

  return commissionMap;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [allProductsVisible, setAllProductsVisible] = useState(true);
  const [togglingAllProducts, setTogglingAllProducts] = useState(false);
  const [togglingProductId, setTogglingProductId] = useState(null);
  const deferredSearch = useDeferredValue(search);

  // View Details Modal State
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Commission map: { [productId]: commissionAmount }
  const commissionMap = useCommissionMap(products);

  const categoryFilterOptions = useMemo(() => {
    const seen = new Set();
    return categories.filter((category) => {
      const normalizedName = String(category?.name || '').trim().toLowerCase();
      if (!normalizedName || seen.has(normalizedName)) return false;
      seen.add(normalizedName);
      return true;
    });
  }, [categories]);

  const load = async () => {
    setLoading(true);
    setFetchError('');

    try {
      const { data } = await sellerService.getProducts({
        page,
        limit: 10,
        search: deferredSearch || undefined,
        category: categoryFilter || undefined,
        status: statusFilter || undefined,
        date: dateFilter || undefined,
      });

      const productList =
        Array.isArray(data?.data) ? data.data :
          Array.isArray(data?.products) ? data.products :
            Array.isArray(data?.data?.products) ? data.data.products :
              [];

      setProducts(productList);
      setPagination(
        data?.pagination ||
        data?.data?.pagination || {
          totalItems: productList.length,
          totalPages: 1,
          currentPage: 1,
        }
      );
    } catch (error) {
      setFetchError(getErrorMessage(error));
      setProducts([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sellerService.getCategories().then(({ data }) => {
      const flattened = [];
      const walk = (items = []) => {
        items.forEach((category) => {
          flattened.push(category);
          if (category.children?.length) walk(category.children);
        });
      };
      walk(data.data || []);
      setCategories(flattened);
    }).catch(() => { });
  }, []);

  useEffect(() => {
    load();
  }, [page, deferredSearch, categoryFilter, statusFilter, dateFilter]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await sellerService.deleteProduct(id);
      dispatch(showToast({ message: 'Product deleted.', severity: 'success' }));
      load();
    } catch (err) {
      dispatch(showToast({ message: getErrorMessage(err), severity: 'error' }));
    }
  };

  const handleOpenView = async (product) => {
    setViewProduct(product);
    setSelectedImageIndex(0);
    setViewDialogOpen(true);
    setViewLoading(true);
    try {
      const { data } = await sellerService.getProduct(product.id);
      if (data?.data) {
        setViewProduct(data.data);
      }
    } catch {
      // keep basic product data from table row
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseView = () => {
    setViewDialogOpen(false);
    setViewProduct(null);
    setSelectedImageIndex(0);
  };

  const handleToggleAllProducts = async () => {
    setTogglingAllProducts(true);
    try {
      const { data } = await sellerService.toggleAllProductsVisibility();
      const visible = Boolean(data?.data?.is_active);
      setAllProductsVisible(visible);
      setProducts((prev) => prev.map((product) => ({ ...product, is_active: visible })));
      dispatch(showToast({
        message: visible ? 'All products visible to users' : 'All products hidden from users',
        severity: 'success',
      }));
    } catch (err) {
      dispatch(showToast({ message: getErrorMessage(err), severity: 'error' }));
    } finally {
      setTogglingAllProducts(false);
    }
  };

  const handleToggleProductVisibility = async (productId) => {
    if (!allProductsVisible) {
      dispatch(showToast({
        message: 'Please turn ON the main "Show To Users" button first.',
        severity: 'warning',
      }));
      return;
    }
    setTogglingProductId(productId);
    try {
      const { data } = await sellerService.toggleProductVisibility(productId);
      const updatedProduct = data?.data;
      const nextIsActive = Boolean(updatedProduct?.is_active);
      setProducts((prev) =>
        prev.map((product) =>
          product.id === productId ? { ...product, is_active: nextIsActive } : product
        )
      );
      dispatch(showToast({
        message: nextIsActive ? 'Product visible to users' : 'Product hidden from users',
        severity: 'success',
      }));
    } catch (err) {
      dispatch(showToast({ message: getErrorMessage(err), severity: 'error' }));
    } finally {
      setTogglingProductId(null);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100%',
        bgcolor: 'background.default',
        mx: { xs: -2, md: -3 },
        my: { xs: -2, md: -3 },
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: '10px 10px 0 0',
          px: { xs: 2, md: 3 },
          py: { xs: 2.25, md: 2.5 },
        }}
      >
        <Typography sx={{ fontSize: { xs: 28, md: 24 }, fontWeight: 500, lineHeight: 1.1, color: 'text.primary', mb: 0.6 }}>
          Products Management
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 400 }}>
          Manage your products and track admin approval status
        </Typography>
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 500 }}>
            Show To Users
          </Typography>
          <Switch
            checked={allProductsVisible}
            onChange={handleToggleAllProducts}
            color="success"
            disabled={togglingAllProducts || products.length === 0}
          />
        </Box>
      </Box>

      <Card
        sx={{
          borderRadius: '0 0 18px 18px',
          boxShadow: 'none',
          border: 1,
          borderColor: 'divider',
          borderTop: 'none',
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            pt: { xs: 2, md: 2.5 },
            pb: 1.75,
            display: 'flex',
            flexDirection: { xs: 'column', xl: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', xl: 'center' },
            gap: 1.75,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 400, color: 'text.primary', mb: 0.25 }}>
              My Products
            </Typography>
            <Typography sx={{ fontSize: 13, color: 'text.disabled' }}>
              {pagination.totalItems || products.length || 0} products found
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>
              New seller products go to admin as pending. Only approved products appear to customers.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25} sx={{ width: { xs: '100%', xl: 'auto' } }}>
            <TextField
              value={search}
              onChange={(event) => {
                const value = event.target.value;
                startTransition(() => {
                  setSearch(value);
                  setPage(1);
                });
              }}
              placeholder="Search products..."
              size="small"
              sx={{
                minWidth: { xs: '100%', md: 280 },
                '& .MuiInputBase-input::placeholder': { color: 'text.disabled', opacity: 1 },
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'background.default',
                  color: 'text.primary',
                  fontSize: 13,
                  '& fieldset': { borderColor: 'divider' },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 180 } }}>
              <Select
                value={categoryFilter}
                displayEmpty
                onChange={(event) => {
                  startTransition(() => {
                    setCategoryFilter(event.target.value);
                    setPage(1);
                  });
                }}
                sx={{
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'background.default',
                  color: 'text.primary',
                  fontSize: 13,
                  '& .MuiSelect-select': { py: 1 },
                  '& fieldset': { borderColor: 'divider' },
                }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categoryFilterOptions.map((category) => (
                  <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 150 } }}>
              <Select
                value={statusFilter}
                displayEmpty
                onChange={(event) => {
                  startTransition(() => {
                    setStatusFilter(event.target.value);
                    setPage(1);
                  });
                }}
                sx={{
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'background.default',
                  color: 'text.primary',
                  fontSize: 13,
                  '& .MuiSelect-select': { py: 1 },
                  '& fieldset': { borderColor: 'divider' },
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                {PRODUCT_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {STATUS_STYLES[status].label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              type="date"
              size="small"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              sx={{
                minWidth: 180,
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: 'background.default',
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/products/new')}
              sx={{
                height: 40,
                px: 2,
                borderRadius: '8px',
                textTransform: 'none',
                fontSize: 13,
                fontWeight: 600,
                background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                color: '#000',
                boxShadow: 'none',
                whiteSpace: 'nowrap',
                marginLeft: { xs: 0, md: 'auto !important' },
                '&:hover': {
                  background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                  color: '#000',
                  boxShadow: 'none',
                },
              }}
            >
              Add Product
            </Button>
          </Stack>
        </Box>

        {fetchError && <Alert severity="error" sx={{ mx: 3, mb: 2 }}>{fetchError}</Alert>}

        <TableContainer sx={{ overflowX: 'auto', px: { xs: 1, md: 2 }, pb: 2 }}>
          <Table sx={{ minWidth: 980 }}>
            <TableHead>
              <TableRow>
                {['S.No.', 'Product', 'Category', 'Price', 'Stock', 'Status', 'Visible', 'Actions'].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      ...tableHeaderCellSx,
                      ...(header === 'S.No.' ? { width: 70, minWidth: 60 } : {}),
                      ...(header === 'Product' ? { width: 280, minWidth: 240, maxWidth: 300 } : {}),
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 8 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} sx={tableBodyCellSx}>
                        <Skeleton variant="rounded" height={32} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
                : products.map((product, index) => {
                  const commission = commissionMap[product.id] ?? 0;
                  const serialNumber = (page - 1) * (pagination?.limit || 10) + index + 1;

                  return (
                    <TableRow
                      key={product.id}
                      hover
                      sx={{
                        '&:last-child td': { borderBottom: 0 },
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      {/* S.No. */}
                      <TableCell
                        sx={{
                          ...tableBodyCellSx,
                          width: 70,
                          minWidth: 60,
                          color: 'text.secondary',
                          fontWeight: 500,
                        }}
                      >
                        {serialNumber}
                      </TableCell>

                      {/* Product */}
                      <TableCell
                        sx={{
                          ...tableBodyCellSx,
                          width: 280,
                          minWidth: 240,
                          maxWidth: 300,
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, minWidth: 0, width: '100%' }}>
                          <Avatar
                            variant="rounded"
                            src={product.images?.[0]?.image_url}
                            imgProps={{ style: { objectFit: 'contain' } }}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: '6px',
                              bgcolor: '#F2F4F7',
                              border: '1px solid #EAECF0',
                              flexShrink: 0,
                            }}
                          >
                            {product.name?.[0]}
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                            <Typography
                              sx={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: 'text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {truncateProductName(product.name, 35)}
                            </Typography>
                            <Typography sx={{ mt: 0.25, fontSize: 13, color: 'text.secondary' }}>
                              {getProductCode(product)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Category */}
                      <TableCell sx={tableBodyCellSx}>
                        <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{product.category?.name || product.custom_category || '-'}</Typography>
                        {product.subcategory?.name && (
                          <Typography sx={{ mt: 0.25, fontSize: 12, color: 'text.secondary' }}>
                            {product.subcategory.name}
                          </Typography>
                        )}
                      </TableCell>

                      {/* ── Price (platform fee is deducted from settlement, not added here) ── */}
                      <TableCell sx={tableBodyCellSx}>
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.primary' }}>
                          {formatCurrency(Number(product.price))}
                        </Typography>
                        {commission > 0 && (
                          <Typography sx={{ fontSize: 11, color: 'text.secondary', mt: 0.25 }}>
                            Platform fee ₹{commission} (deducted from settlement)
                          </Typography>
                        )}
                      </TableCell>

                      {/* Stock */}
                      <TableCell sx={tableBodyCellSx}>
                        <Typography
                          sx={{
                            fontSize: 13,
                            color: product.stock_quantity > 0 ? 'text.secondary' : 'error.main',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getStockLabel(product.stock_quantity)}
                        </Typography>
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={tableBodyCellSx}>
                        <Stack spacing={0.75} alignItems="flex-start">
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              px: 1.25,
                              minWidth: 82,
                              height: 24,
                              borderRadius: 999,
                              fontWeight: 500,
                              fontSize: 12,
                              color: STATUS_STYLES[product.admin_status || 'pending'].color,
                              bgcolor: STATUS_STYLES[product.admin_status || 'pending'].background,
                            }}
                          >
                            {STATUS_STYLES[product.admin_status || 'pending'].label.toLowerCase()}
                          </Box>
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                            {product.admin_status === 'approved' && product.is_active
                              ? 'Visible to users'
                              : product.admin_status === 'approved' && !product.is_active
                                ? 'Hidden from users'
                                : product.admin_status === 'blocked'
                                  ? 'Hidden from users'
                                  : 'Waiting for admin approval'}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Visible toggle */}
                      <TableCell sx={tableBodyCellSx}>
                        <Stack spacing={0.5} alignItems="flex-start">
                          <Box onClick={() => {
                            if (!allProductsVisible) {
                              dispatch(showToast({
                                message: 'Please turn ON the main "Show To Users" button first.',
                                severity: 'warning',
                              }));
                            }
                          }}>
                            <Switch
                              checked={Boolean(product.is_active)}
                              onChange={() => handleToggleProductVisibility(product.id)}
                              color="success"
                              disabled={
                                !allProductsVisible ||
                                togglingProductId === product.id ||
                                product.admin_status !== 'approved'
                              }
                            />
                          </Box>
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>
                            {!allProductsVisible
                              ? 'Turn ON main button first'
                              : product.admin_status !== 'approved'
                                ? 'Approve first'
                                : product.is_active
                                  ? 'ON'
                                  : 'OFF'}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={tableBodyCellSx}>
                        <Stack direction="row" spacing={0.25}>
                          <Tooltip title="View product details">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenView(product)}
                              sx={{ color: 'text.primary' }}
                            >
                              <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit product">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/products/${product.id}/edit`)}
                              sx={{ color: 'text.primary' }}
                            >
                              <EditOutlinedIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete product">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(product.id)}
                              sx={{ color: '#D92D20' }}
                            >
                              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!loading && products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} sx={{ py: 8, textAlign: 'center', borderBottom: 0 }}>
                    <EmptyState
                      icon={InventoryIcon}
                      title="No products found"
                      description="Create your first product or change the search and filter values."
                      actionLabel="Add Product"
                      onAction={() => navigate('/products/new')}
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {(pagination.totalPages || 0) > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, pb: 3, pt: 1 }}>
            <Pagination count={pagination.totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
          </Box>
        )}
      </Card>

      {/* ─── Product Details Modal ────────────────────────────────────────── */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseView}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: '14px',
            bgcolor: 'background.paper',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'text.primary' }}>
              Product Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Review full product information, specifications, and variants.
            </Typography>
          </Box>
          <IconButton onClick={handleCloseView} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          {viewLoading && !viewProduct ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={36} />
            </Box>
          ) : viewProduct ? (
            <Stack spacing={3}>
              {/* Hero / Main Info */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', gap: 2.5 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Avatar
                    variant="rounded"
                    src={viewProduct.images?.[selectedImageIndex]?.image_url || viewProduct.images?.[0]?.image_url}
                    imgProps={{ style: { objectFit: 'contain' } }}
                    sx={{
                      width: { xs: 90, sm: 110 },
                      height: { xs: 90, sm: 110 },
                      borderRadius: 2,
                      bgcolor: '#F2F4F7',
                      border: '1px solid #EAECF0',
                    }}
                  >
                    {viewProduct.name?.[0]}
                  </Avatar>
                  {/* Thumbnails if multiple images */}
                  {viewProduct.images?.length > 1 && (
                    <Box sx={{ display: 'flex', gap: 0.75, maxWidth: 120, overflowX: 'auto', py: 0.5 }}>
                      {viewProduct.images.map((img, idx) => (
                        <Box
                          key={img.id || idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          sx={{
                            width: 28,
                            height: 28,
                            borderRadius: '4px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: idx === selectedImageIndex ? '2px solid' : '1px solid',
                            borderColor: idx === selectedImageIndex ? 'primary.main' : 'divider',
                            opacity: idx === selectedImageIndex ? 1 : 0.6,
                            '&:hover': { opacity: 1 },
                          }}
                        >
                          <img
                            src={img.image_url}
                            alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
                  <Typography sx={{ fontSize: { xs: 18, sm: 22 }, fontWeight: 700, mb: 1.5, wordBreak: 'break-word', color: 'text.primary', lineHeight: 1.3 }}>
                    {viewProduct.name}
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 1.5,
                      bgcolor: 'background.default',
                      p: 2,
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Product Code
                      </Typography>
                      <Typography fontWeight={600} fontSize={13}>
                        {getProductCode(viewProduct)}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        SKU
                      </Typography>
                      <Typography fontWeight={600} fontSize={13}>
                        {viewProduct.sku || '-'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Category
                      </Typography>
                      <Typography fontWeight={600} fontSize={13}>
                        {viewProduct.category?.name || viewProduct.custom_category || '-'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Subcategory
                      </Typography>
                      <Typography fontWeight={600} fontSize={13}>
                        {viewProduct.subcategory?.name || '-'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Price
                      </Typography>
                      <Typography fontWeight={700} fontSize={14}>
                        {formatCurrency(Number(viewProduct.price))}
                        {viewProduct.compare_price && (
                          <Typography
                            component="span"
                            sx={{
                              ml: 1,
                              color: 'text.disabled',
                              textDecoration: 'line-through',
                              fontSize: 13,
                              fontWeight: 400,
                            }}
                          >
                            {formatCurrency(Number(viewProduct.compare_price))}
                          </Typography>
                        )}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Stock
                      </Typography>
                      <Typography fontWeight={600} fontSize={13}>
                        {viewProduct.stock_quantity} units ({viewProduct.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'})
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Admin Status
                      </Typography>
                      <Box sx={{ mt: 0.25 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1.25,
                            height: 22,
                            borderRadius: 999,
                            fontWeight: 600,
                            fontSize: 11,
                            color: STATUS_STYLES[viewProduct.admin_status || 'pending'].color,
                            bgcolor: STATUS_STYLES[viewProduct.admin_status || 'pending'].background,
                          }}
                        >
                          {STATUS_STYLES[viewProduct.admin_status || 'pending'].label}
                        </Box>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Store Visibility
                      </Typography>
                      <Box sx={{ mt: 0.25 }}>
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            px: 1.25,
                            height: 22,
                            borderRadius: 999,
                            fontWeight: 600,
                            fontSize: 11,
                            color: viewProduct.is_active ? '#166534' : '#6b7280',
                            bgcolor: viewProduct.is_active ? '#dcfce7' : '#f3f4f6',
                          }}
                        >
                          {viewProduct.is_active ? 'Visible to Users' : 'Hidden from Users'}
                        </Box>
                      </Box>
                    </Box>

                    {viewProduct.hsn_code && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          HSN Code
                        </Typography>
                        <Typography fontWeight={600} fontSize={13}>
                          {viewProduct.hsn_code}
                        </Typography>
                      </Box>
                    )}

                    {viewProduct.warranty_type && (
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Warranty
                        </Typography>
                        <Typography fontWeight={600} fontSize={13} sx={{ textTransform: 'capitalize' }}>
                          {viewProduct.warranty_type} — {viewProduct.warranty_duration} {viewProduct.warranty_duration_unit}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Specifications */}
              {viewProduct.specifications?.length > 0 && (
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: 'primary.main',
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    Specifications
                  </Typography>
                  <Stack spacing={0.75}>
                    {viewProduct.specifications.map((spec) => (
                      <Box key={spec.id || `${spec.name}-${spec.value}`} sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ minWidth: 140, fontWeight: 600 }}>
                          {spec.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {spec.value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Variants */}
              {viewProduct.variants?.length > 0 && (
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: 'primary.main',
                      fontWeight: 700,
                      mb: 1.5,
                    }}
                  >
                    Product Variants ({viewProduct.variants.length})
                  </Typography>
                  <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, bgcolor: 'background.paper' }}>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: 'action.hover' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Variant / Attributes</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Stock</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {viewProduct.variants.map((v, i) => {
                          const attrStr = v.variant_attributes ? Object.values(v.variant_attributes).join(' / ') : `Variant ${i + 1}`;
                          return (
                            <TableRow key={v.id || i}>
                              <TableCell sx={{ fontWeight: 600 }}>{attrStr}</TableCell>
                              <TableCell>{v.sku || '-'}</TableCell>
                              <TableCell>{formatCurrency(Number(v.price))}</TableCell>
                              <TableCell>{v.stock_quantity} units</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* Description */}
              {viewProduct.description && (
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.default',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: 'primary.main',
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    Description
                  </Typography>
                  <Typography sx={{ fontSize: 13.5, color: 'text.secondary', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {viewProduct.description}
                  </Typography>
                </Box>
              )}

              {/* Platform Fee Callout */}
              {commissionMap[viewProduct.id] > 0 && (
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 2,
                    border: 1,
                    borderColor: 'warning.main',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(234, 88, 12, 0.15)' : '#FFFBEB'),
                  }}
                >
                  <Typography sx={{ color: 'warning.main', fontSize: 13, fontWeight: 500 }}>
                    Commission: Platform fee of {formatCurrency(commissionMap[viewProduct.id])} is deducted from settlement on each sale.
                  </Typography>
                </Box>
              )}
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1.5, gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleCloseView}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: 13,
              px: 2.5,
            }}
          >
            Close
          </Button>

          {viewProduct && (
            <Button
              variant="contained"
              onClick={() => {
                const id = viewProduct.id;
                handleCloseView();
                navigate(`/products/${id}/edit`);
              }}
              sx={{
                background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                color: '#000',
                fontWeight: 600,
                boxShadow: 'none',
                textTransform: 'none',
                borderRadius: '8px',
                fontSize: 13,
                px: 2.5,
                '&:hover': {
                  background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                  color: '#000',
                  boxShadow: 'none',
                  opacity: 0.95,
                },
              }}
            >
              Edit Product
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;