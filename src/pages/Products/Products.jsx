import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Chip, IconButton, Avatar, Tooltip, Pagination, TextField, InputAdornment, Switch } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';
import { sellerService } from '../../services/seller.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { getErrorMessage } from '../../utils/getErrorMessage';
import EmptyState from '../../components/common/EmptyState/EmptyState';

const Products = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    sellerService.getProducts({ page, limit: 15 }).then(({ data }) => {
      setProducts(data.data || []);
      setPagination(data.pagination || {});
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await sellerService.deleteProduct(id);
      dispatch(showToast({ message: 'Product deleted.', severity: 'success' }));
      load();
    } catch (err) { dispatch(showToast({ message: getErrorMessage(err), severity: 'error' })); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>My Products</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/products/new')}>Add Product</Button>
      </Box>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(6).fill(0).map((__, j) => <TableCell key={j}><Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1 }} /></TableCell>)}
                  </TableRow>
                ))
                : products.length === 0
                  ? <TableRow><TableCell colSpan={6}><EmptyState icon={InventoryIcon} title="No products yet" actionLabel="Add First Product" onAction={() => navigate('/products/new')} /></TableCell></TableRow>
                  : products.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar variant="rounded" src={p.images?.[0]?.image_url} sx={{ width: 40, height: 40 }}>{p.name?.[0]}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 200 }}>{p.name}</Typography>
                            <Typography variant="caption" color="text.secondary">SKU: {p.sku || '—'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Typography variant="body2">{p.category?.name || '—'}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{formatCurrency(p.price)}</Typography></TableCell>
                      <TableCell>
                        <Chip label={p.stock_quantity} color={p.stock_quantity === 0 ? 'error' : p.stock_quantity < 10 ? 'warning' : 'success'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip label={p.is_active ? 'Active' : 'Inactive'} color={p.is_active ? 'success' : 'default'} size="small" />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/products/${p.id}/edit`)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </TableContainer>
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default Products;
