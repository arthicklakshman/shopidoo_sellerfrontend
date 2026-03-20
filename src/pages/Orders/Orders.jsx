import { useState, useEffect } from 'react';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, MenuItem, Select, Pagination, FormControl } from '@mui/material';
import { sellerService } from '../../services/seller.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import OrderStatusChip from '../../components/shared/OrderStatusChip/OrderStatusChip';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';

const ALLOWED_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const Orders = () => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    sellerService.getOrders({ page, limit: 15 }).then(({ data }) => {
      setOrders(data.data || []);
      setPagination(data.pagination || {});
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const handleStatusChange = async (itemId, status) => {
    try {
      await sellerService.updateOrderItemStatus(itemId, status);
      dispatch(showToast({ message: 'Status updated.', severity: 'success' }));
      load();
    } catch (err) { dispatch(showToast({ message: err.response?.data?.message || 'Error updating status.', severity: 'error' })); }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Orders</Typography>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Order #', 'Product', 'Customer', 'Qty', 'Amount', 'Date', 'Status', 'Update'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(8).fill(0).map((__, j) => <TableCell key={j}><Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1 }} /></TableCell>)}
                  </TableRow>
                ))
                : orders.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No orders yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )
                  : orders.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={600}>#{item.order?.order_number}</Typography></TableCell>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{item.product?.name}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{item.order?.user?.name || '—'}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{item.quantity}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{formatCurrency(item.total_price)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{formatDate(item.created_at)}</Typography></TableCell>
                      <TableCell><OrderStatusChip status={item.status} /></TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 130 }}>
                          <Select
                            value={item.status}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          >
                            {ALLOWED_STATUSES.map((s) => (
                              <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
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

export default Orders;
