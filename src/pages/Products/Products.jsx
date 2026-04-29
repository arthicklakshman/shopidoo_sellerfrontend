import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import InventoryIcon from '@mui/icons-material/Inventory';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';
import { sellerService } from '../../services/seller.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { getErrorMessage } from '../../utils/getErrorMessage';
import EmptyState from '../../components/common/EmptyState/EmptyState';

const PRODUCT_STATUSES = ['pending', 'approved', 'blocked'];

const STATUS_STYLES = {
  pending: { label: 'Pending', color: '#a16207', background: '#fef3c7' },
  approved: { label: 'Approved', color: '#166534', background: '#dcfce7' },
  blocked: { label: 'Blocked', color: '#b91c1c', background: '#fee2e2' },
};

const tableHeaderCellSx = {
  fontWeight: 500,
  fontSize: 13,
  color: '#475467',
  borderBottom: '1px solid #EAECF0',
  py: 1.8,
  px: 2,
  whiteSpace: 'nowrap',
};

const tableBodyCellSx = {
  borderBottom: '1px solid #F2F4F7',
  py: 1.4,
  px: 2,
  fontSize: 13,
  color: '#101828',
  verticalAlign: 'middle',
};

const getProductCode = (product) => product?.product_code || `P${String(product?.id || 0).padStart(3, '0')}`;

const getStockLabel = (quantity) => {
  if (quantity > 0) return String(quantity);
  return 'Out of Stock';
};

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
  const [fetchError, setFetchError] = useState('');
  const deferredSearch = useDeferredValue(search);

  const categoryFilterOptions = useMemo(() => {
    const seen = new Set();

    return categories.filter((category) => {
      const normalizedName = String(category?.name || '').trim().toLowerCase();
      if (!normalizedName || seen.has(normalizedName)) return false;
      seen.add(normalizedName);
      return true;
    });
  }, [categories]);

  // const load = () => {
  //   setLoading(true);
  //   setFetchError('');
  //   sellerService.getProducts({
  //     page,
  //     limit: 10,
  //     search: deferredSearch || undefined,
  //     category: categoryFilter || undefined,
  //     status: statusFilter || undefined,
  //   }).then(({ data }) => {
  //     setProducts(data.data || []);
  //     setPagination(data.pagination || {});
  //   }).catch((err) => {
  //     setFetchError(getErrorMessage(err));
  //   }).finally(() => setLoading(false));
  // };
    // Replace your entire load function in Products.jsx with this
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
    }).catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [page, deferredSearch, categoryFilter, statusFilter]);

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

  return (
    <Box
      sx={{
        minHeight: '100%',
        bgcolor: '#F5F7FB',
        mx: { xs: -2, md: -3 },
        my: { xs: -2, md: -3 },
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
      }}
    >
      <Box
        sx={{
          bgcolor: '#F7F8FC',
          border: '1px solid #EAECF0',
          borderRadius: '10px 10px 0 0',
          px: { xs: 2, md: 3 },
          py: { xs: 2.25, md: 2.5 },
        }}
      >
        <Typography sx={{ fontSize: { xs: 28, md: 24 }, fontWeight: 500, lineHeight: 1.1, color: '#101828', mb: 0.6 }}>
          Products Management
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#667085', fontWeight: 400 }}>
          Manage your products and track admin approval status
        </Typography>
      </Box>

      <Card
        sx={{
          borderRadius: '0 0 18px 18px',
          boxShadow: 'none',
          border: '1px solid #EAECF0',
          borderTop: 'none',
          overflow: 'hidden',
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
            <Typography sx={{ fontSize: 24, fontWeight: 400, color: '#101828', mb: 0.25 }}>
              My Products
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#98A2B3' }}>
              {pagination.totalItems || products.length || 0} products found
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#667085', mt: 0.5 }}>
              New seller products go to admin as pending. Only approved products appear in the user frontend.
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
                '& .MuiInputBase-input::placeholder': {
                  color: '#98A2B3',
                  opacity: 1,
                },
                '& .MuiOutlinedInput-root': {
                  height: 40,
                  borderRadius: '8px',
                  bgcolor: '#F8FAFC',
                  color: '#101828',
                  fontSize: 13,
                  '& fieldset': {
                    borderColor: '#EAECF0',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: '#98A2B3', fontSize: 18 }} />
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
                  bgcolor: '#F8FAFC',
                  color: '#344054',
                  fontSize: 13,
                  '& .MuiSelect-select': { py: 1 },
                  '& fieldset': { borderColor: '#EAECF0' },
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
                  bgcolor: '#F8FAFC',
                  color: '#344054',
                  fontSize: 13,
                  '& .MuiSelect-select': { py: 1 },
                  '& fieldset': { borderColor: '#EAECF0' },
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

        <TableContainer sx={{ px: { xs: 1, md: 2 }, pb: 2 }}>
          <Table sx={{ minWidth: 920 }}>
            <TableHead>
              <TableRow>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((header) => (
                  <TableCell key={header} sx={tableHeaderCellSx}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 6 }).map((__, cellIndex) => (
                      <TableCell key={cellIndex} sx={tableBodyCellSx}>
                        <Skeleton variant="rounded" height={32} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
                : products.map((product) => (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      '&:hover': { bgcolor: '#FAFBFC' },
                    }}
                  >
                    <TableCell sx={tableBodyCellSx}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
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
                          }}
                        >
                          {product.name?.[0]}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#101828' }} noWrap>
                            {product.name}
                          </Typography>
                          <Typography sx={{ mt: 0.25, fontSize: 13, color: '#667085' }}>
                            {getProductCode(product)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={tableBodyCellSx}>
                      <Typography sx={{ fontSize: 13, color: '#344054' }}>{product.category?.name || '-'}</Typography>
                    </TableCell>

                    <TableCell sx={tableBodyCellSx}>
                      <Typography sx={{ fontSize: 13, color: '#344054' }}>{formatCurrency(product.price)}</Typography>
                    </TableCell>

                    <TableCell sx={tableBodyCellSx}>
                      <Typography
                        sx={{
                          fontSize: 13,
                          color: product.stock_quantity > 0 ? '#667085' : '#D92D20',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getStockLabel(product.stock_quantity)}
                      </Typography>
                    </TableCell>

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
                        <Typography sx={{ fontSize: 11, color: '#98A2B3' }}>
                          {product.admin_status === 'approved'
                            ? 'Visible to users'
                            : product.admin_status === 'blocked'
                              ? 'Hidden from users'
                              : 'Waiting for admin approval'}
                        </Typography>
                      </Stack>
                    </TableCell>

                    <TableCell sx={tableBodyCellSx}>
                      <Stack direction="row" spacing={0.25}>
                        <Tooltip title="Edit product">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                            sx={{ color: '#344054' }}
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
                ))}

              {!loading && products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{ py: 8, textAlign: 'center', borderBottom: 0 }}>
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
    </Box>
  );
};

export default Products;
