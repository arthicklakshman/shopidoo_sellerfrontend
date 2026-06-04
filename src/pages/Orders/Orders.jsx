
import { useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, MenuItem, Select, Pagination, FormControl, TextField } from '@mui/material';
import { sellerService } from '../../services/seller.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import OrderStatusChip from '../../components/shared/OrderStatusChip/OrderStatusChip';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';
import { generateInvoice } from '../../utils/generateInvoice';
import DownloadIcon from '@mui/icons-material/Download';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const ALLOWED_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned', 'return_requested',
  'replacement_sent',];

const DELIVERY_COLORS = (theme) => ({
  delivered:          { bg: alpha(theme.palette.success.main, 0.1),   color: theme.palette.success.dark },
  cancelled:          { bg: alpha(theme.palette.error.main, 0.1),     color: theme.palette.error.dark },
  shipped:            { bg: alpha(theme.palette.info.main, 0.1),      color: theme.palette.info.dark },
  processing:         { bg: alpha(theme.palette.warning.main, 0.1),   color: theme.palette.warning.dark },
  confirmed:          { bg: alpha(theme.palette.success.main, 0.1),   color: theme.palette.success.dark },
  pending:            { bg: theme.palette.action.hover,                color: theme.palette.text.secondary },
  refunded:           { bg: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.dark },
  returned:           { bg: alpha(theme.palette.info.main, 0.1),      color: theme.palette.info.dark },
  return_requested:   { bg: alpha(theme.palette.warning.main, 0.15),  color: theme.palette.warning.dark }, 
  replacement_sent:   { bg: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.dark }, 
});

const StatusBadge = ({ label, colorMap }) => {
  return (
    <Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', bgcolor: colorMap[label]?.bg || 'action.hover', color: colorMap[label]?.color || 'text.secondary' }}>
      {label}
    </Box>
  );
};

const getNextStatuses = (currentStatus) => {
  if(currentStatus==="pending") return ["confirmed"];
  if(currentStatus==="confirmed") return ["processing"];
  if(currentStatus==="processing") return ["shipped"];
  if(currentStatus==="shipped") return ["delivered"];
  if (currentStatus === 'return_requested') return [];
  return [];
};

const OrderDetailDialog = ({ open, onClose, order, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const dispatch = useDispatch();

  if (!order) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await sellerService.updateOrderItemStatus(order.itemId, newStatus);
      dispatch(showToast({ message: 'Status updated successfully', severity: 'success' }));
      onStatusUpdate?.();
      onClose();
    } catch {
      dispatch(showToast({ message: 'Failed to update status', severity: 'error' }));
    } finally {
      setUpdating(false);
    }
  };

  const addressString = typeof order.address === 'string' ? order.address : (order.address ? `${order.address.address_line1 || ''}\n${order.address.city || ''}, ${order.address.state || ''} ${order.address.pincode || ''}` : '-');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Order Details - {order.orderNumber}</Typography>
            <Typography variant="body2" color="text.secondary">View and manage order details and status.</Typography>
          </Box>
          <IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Customer Name</Typography>
            <Typography variant="body1">{order.customer || '-'}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Product</Typography>
            <Typography variant="body1">{order.product || '-'}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2.5 }} />
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Order Amount</Typography>
            <Typography variant="body1" fontWeight={700}>{formatCurrency(Number(order.amount) || 0)}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Quantity</Typography>
            <Typography variant="body1">{order.quantity ?? '-'}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2.5 }} />
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Delivery Status</Typography>
            <StatusBadge label={order.status || 'pending'} colorMap={DELIVERY_COLORS(useTheme())} />
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
            <LocationOnOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body1" fontWeight={700}>Shipping Address</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{addressString}</Typography>
        </Box>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
            <AccessTimeOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body1" fontWeight={700}>Order Timeline</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Order Placed</Typography>
            <Typography variant="body2" color="text.secondary">{order.createdAt ? formatDate(order.createdAt) : '-'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} sx={{ flex: 1, borderRadius: 2, textTransform: 'none', fontWeight: 600 }} onClick={() => generateInvoice(order.rawItem, true)}>
            Download Invoice
          </Button>
          <FormControl size="small" sx={{ flex: 1 }}>
            <Select value="" displayEmpty disabled={updating} onChange={(e) => handleStatusChange(e.target.value)} IconComponent={KeyboardArrowDownIcon} sx={{ borderRadius: 2, bgcolor: 'action.hover', fontWeight: 600, color: 'text.secondary' }} renderValue={() => 'Update Status'}>
              {getNextStatuses(order?.status).map((status) => (
                <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>{status}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const Orders = () => {
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('newest');
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = () => {
    setLoading(true);
      sellerService.getOrders({
        page,
        limit: 15,
        status: statusFilter || undefined,
        sort: sortFilter,
        year: yearFilter || undefined,
        month: monthFilter || undefined,
        date: dateFilter || undefined,
      }).then(({ data }) => {
      setOrders(data.data || []);
      setPagination(data.pagination || {});
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
  load();
}, [page, statusFilter, sortFilter, yearFilter, monthFilter, dateFilter]);

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
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
  <FormControl size="small">
    <Select
      value={statusFilter}
      onChange={(e) => {
        setStatusFilter(e.target.value);
        setPage(1);
      }}
      displayEmpty
      sx={{ minWidth: 140, bgcolor: 'action.hover' }}
    >
      <MenuItem value="">All Status</MenuItem>
      {ALLOWED_STATUSES.map((status) => (
        <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
          {status}
        </MenuItem>
      ))}
    </Select>
  </FormControl>

  <FormControl size="small">
    <Select
      value={sortFilter}
      onChange={(e) => {
        setSortFilter(e.target.value);
        setPage(1);
      }}
      sx={{ minWidth: 180, bgcolor: 'action.hover' }}
    >
      <MenuItem value="newest">Newest</MenuItem>
      <MenuItem value="oldest">Oldest</MenuItem>
      <MenuItem value="orderIdAsc">Order ID Increment</MenuItem>
      <MenuItem value="orderIdDesc">Order ID Decrement</MenuItem>
    </Select>
  </FormControl>
  <FormControl size="small">
  <Select
    value={yearFilter}
    onChange={(e) => {
      setYearFilter(e.target.value);
      setMonthFilter('');
      setPage(1);
    }}
    displayEmpty
    sx={{ minWidth: 120, bgcolor: 'action.hover' }}
  >
    <MenuItem value="">All Years</MenuItem>
    <MenuItem value="2026">2026</MenuItem>
    <MenuItem value="2025">2025</MenuItem>
    <MenuItem value="2024">2024</MenuItem>
  </Select>
</FormControl>

<FormControl size="small" disabled={!yearFilter}>
  <Select
    value={monthFilter}
    onChange={(e) => {
      setMonthFilter(e.target.value);
      setPage(1);
    }}
    displayEmpty
    sx={{ minWidth: 140, bgcolor: 'action.hover' }}
  >
    <MenuItem value="">All Months</MenuItem>
    <MenuItem value="1">January</MenuItem>
    <MenuItem value="2">February</MenuItem>
    <MenuItem value="3">March</MenuItem>
    <MenuItem value="4">April</MenuItem>
    <MenuItem value="5">May</MenuItem>
    <MenuItem value="6">June</MenuItem>
    <MenuItem value="7">July</MenuItem>
    <MenuItem value="8">August</MenuItem>
    <MenuItem value="9">September</MenuItem>
    <MenuItem value="10">October</MenuItem>
    <MenuItem value="11">November</MenuItem>
    <MenuItem value="12">December</MenuItem>
  </Select>
</FormControl>
<TextField
  type="date"
  size="small"
  value={dateFilter}
  onChange={(e) => {
    setDateFilter(e.target.value);
    setYearFilter('');
    setMonthFilter('');
    setPage(1);
  }}
  sx={{
    minWidth: 170,
    bgcolor: 'action.hover',
  }}
  InputLabelProps={{
    shrink: true,
  }}
/> 
</Box>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Order #', 'Product', 'Customer', 'Qty', 'Amount', 'Date', 'Status', 'Update', 'View'].map((h) => (
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
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                         {(item.Order || item.order)?.order_number || `ORD${String(item.id).padStart(5, '0')}`}
                        </Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{item.product?.name}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(item.Order || item.order)?.user?.name || 'â€”'}
                        </Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2">{item.quantity}</Typography></TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{formatCurrency(item.total_price)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{formatDate(item.created_at)}</Typography></TableCell>
                      <TableCell><OrderStatusChip status={item.status} /></TableCell>
                      <TableCell>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
  <Select
    value={item.status || 'pending'}
    displayEmpty
    disabled={['return_requested', 'returned', 'refunded', 'replacement_sent'].includes(item.status)} // ← ADD
    onChange={(e) => handleStatusChange(item.id, e.target.value)}
  >
                            {ALLOWED_STATUSES.map((s) => (
                              <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedOrder({
                                itemId: item.id,
                                orderNumber: (item.Order || item.order)?.order_number || `ORD${String(item.id).padStart(5, '0')}`,
                                customer: (item.Order || item.order)?.user?.name || '-',
                                product: item.product?.name || '-',
                                quantity: item.quantity,
                                amount: item.total_price,
                                status: item.status,
                                createdAt: item.created_at,
                                address: (item.Order || item.order)?.address,
                                rawItem: item
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
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
      <OrderDetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        order={selectedOrder}
        onStatusUpdate={load}
      />
    </Box>
  );
};

export default Orders;