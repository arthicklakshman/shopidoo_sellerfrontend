import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, TextField, InputAdornment, Button,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, IconButton, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { getSellerOrders } from '../../features/orders/order.service';

// ✅ Status Badge
const StatusBadge = ({ status }) => {
  const normalizedStatus = status?.toLowerCase();
  let styles = { bg: '#f3f4f6', text: '#374151' };

  if (['paid', 'delivered'].includes(normalizedStatus))
    styles = { bg: '#dcfce7', text: '#166534' };
  else if (['pending', 'processing'].includes(normalizedStatus))
    styles = { bg: '#fef08a', text: '#854d0e' };
  else if (['in transit', 'shipped'].includes(normalizedStatus))
    styles = { bg: '#dbeafe', text: '#1e40af' };
  else if (normalizedStatus === 'cancelled')
    styles = { bg: '#fee2e2', text: '#991b1b' };

  return (
    <Box sx={{
      backgroundColor: styles.bg,
      color: styles.text,
      px: 1.5,
      py: 0.5,
      borderRadius: '6px',
      display: 'inline-block',
      fontSize: '13px',
      fontWeight: 500
    }}>
      {status || '-'}
    </Box>
  );
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [search, setSearch] = useState('');

  // ✅ Fetch & Transform Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await getSellerOrders();

        if (res.success) {
          const formatted = res.data.map((item) => ({
            orderId: item.Order?.order_number || '',
            customer: item.Order?.user?.fullName || '',
            product: item.product?.name || '',
            amount: `₹${item.price || 0}`,
            payment: item.Order?.payment_status || '',
            delivery: item.delivery_status || 'processing',
            date: item.Order?.createdAt
              ? new Date(item.Order.createdAt).toLocaleDateString()
              : ''
          }));

          setOrders(formatted);
        }
      } catch (err) {
        console.error('Fetch Error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ✅ Filter + Search
  const filteredOrders = orders.filter((order) => {
    const matchSearch =
      (order.orderId || '').toLowerCase().includes(search.toLowerCase()) ||
      (order.customer || '').toLowerCase().includes(search.toLowerCase());

    let matchFilter = true;

    if (activeFilter === 'Pending')
      matchFilter = (order.payment || '').toLowerCase() === 'pending';

    if (activeFilter === 'Completed')
      matchFilter = (order.delivery || '').toLowerCase() === 'delivered';

    return matchSearch && matchFilter;
  });

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        Orders
      </Typography>
      <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
        Manage and track your orders
      </Typography>

      {/* 🔍 Search + Filter */}
      <Card sx={{ p: 2, mb: 3, borderRadius: '12px', display: 'flex', gap: 2, justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{
            width: '400px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            '& fieldset': { border: 'none' }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          {['All Orders', 'Pending', 'Completed'].map((f) => (
            <Button
              key={f}
              onClick={() => setActiveFilter(f)}
              variant={activeFilter === f ? 'contained' : 'outlined'}
              sx={{ textTransform: 'none', borderRadius: '8px', boxShadow: 'none' }}
            >
              {f}
            </Button>
          ))}
        </Box>
      </Card>

      {/* 📊 Table */}
      <TableContainer component={Card} sx={{ borderRadius: '12px' }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f9fafb' }}>
            <TableRow>
              {['Order ID', 'Customer', 'Product', 'Amount', 'Payment', 'Delivery', 'Date', 'Actions'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 600 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {/* 🔄 Loading */}
            {loading && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            )}

            {/* ❌ No Data */}
            {!loading && filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No orders found
                </TableCell>
              </TableRow>
            )}

            {/* ✅ Data Rows */}
            {!loading &&
              filteredOrders.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.orderId}</TableCell>
                  <TableCell>{row.customer}</TableCell>
                  <TableCell>{row.product}</TableCell>
                  <TableCell>{row.amount}</TableCell>
                  <TableCell><StatusBadge status={row.payment} /></TableCell>
                  <TableCell><StatusBadge status={row.delivery} /></TableCell>
                  <TableCell>{row.date}</TableCell>
                  <TableCell>
                    <IconButton size="small">
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <FileDownloadOutlinedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}


// import { useState, useEffect } from 'react';
// import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, MenuItem, Select, Pagination, FormControl } from '@mui/material';
// import { sellerService } from '../../services/seller.service';
// import { formatCurrency } from '../../utils/formatCurrency';
// import { formatDate } from '../../utils/formatDate';
// import OrderStatusChip from '../../components/shared/OrderStatusChip/OrderStatusChip';
// import { useDispatch } from 'react-redux';
// import { showToast } from '../../features/ui/uiSlice';

// const ALLOWED_STATUSES = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

// const Orders = () => {
//   const dispatch = useDispatch();
//   const [orders, setOrders] = useState([]);
//   const [pagination, setPagination] = useState({});
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);

//   const load = () => {
//     setLoading(true);
//     sellerService.getOrders({ page, limit: 15 }).then(({ data }) => {
//       setOrders(data.data || []);
//       setPagination(data.pagination || {});
//     }).finally(() => setLoading(false));
//   };

//   useEffect(() => { load(); }, [page]);

//   const handleStatusChange = async (itemId, status) => {
//     try {
//       await sellerService.updateOrderItemStatus(itemId, status);
//       dispatch(showToast({ message: 'Status updated.', severity: 'success' }));
//       load();
//     } catch (err) { dispatch(showToast({ message: err.response?.data?.message || 'Error updating status.', severity: 'error' })); }
//   };

//   return (
//     <Box>
//       <Typography variant="h5" fontWeight={700} gutterBottom>Orders</Typography>
//       <Card>
//         <TableContainer>
//           <Table>
//             <TableHead>
//               <TableRow>
//                 {['Order #', 'Product', 'Customer', 'Qty', 'Amount', 'Date', 'Status', 'Update'].map((h) => (
//                   <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {loading
//                 ? Array(5).fill(0).map((_, i) => (
//                   <TableRow key={i}>
//                     {Array(8).fill(0).map((__, j) => <TableCell key={j}><Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1 }} /></TableCell>)}
//                   </TableRow>
//                 ))
//                 : orders.length === 0
//                   ? (
//                     <TableRow>
//                       <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
//                         <Typography color="text.secondary">No orders yet.</Typography>
//                       </TableCell>
//                     </TableRow>
//                   )
//                   : orders.map((item) => (
//                     <TableRow key={item.id} hover>
//                       <TableCell><Typography variant="body2" fontWeight={600}>#{item.order?.order_number}</Typography></TableCell>
//                       <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{item.product?.name}</Typography></TableCell>
//                       <TableCell><Typography variant="body2">{item.order?.user?.name || '—'}</Typography></TableCell>
//                       <TableCell><Typography variant="body2">{item.quantity}</Typography></TableCell>
//                       <TableCell><Typography variant="body2" fontWeight={600}>{formatCurrency(item.total_price)}</Typography></TableCell>
//                       <TableCell><Typography variant="body2">{formatDate(item.created_at)}</Typography></TableCell>
//                       <TableCell><OrderStatusChip status={item.status} /></TableCell>
//                       <TableCell>
//                         <FormControl size="small" sx={{ minWidth: 130 }}>
//                           <Select
//                             value={item.status}
//                             onChange={(e) => handleStatusChange(item.id, e.target.value)}
//                           >
//                             {ALLOWED_STATUSES.map((s) => (
//                               <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
//                       </TableCell>
//                     </TableRow>
//                   ))
//               }
//             </TableBody>
//           </Table>
//         </TableContainer>
//         {pagination.totalPages > 1 && (
//           <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
//             <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
//           </Box>
//         )}
//       </Card>
//     </Box>
//   );
// };

// export default Orders;
