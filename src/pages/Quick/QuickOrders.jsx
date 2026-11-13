import { useDeferredValue, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Avatar, Box, Button, Card, Grid, InputAdornment, Menu, MenuItem, Pagination, Skeleton, Stack, Tab, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { showToast } from '../../features/ui/uiSlice';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { quickService } from '../../services/quick.service';
import { StatusChip, PaymentChip, formatINR, formatDateTime, EmptyRow } from './quickUi';

const TEAL = '#0B8457';
const head = { fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.5, whiteSpace: 'nowrap' };

const TABS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready for Dispatch' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const COUNTERS = [
  { key: 'new', label: 'New orders', color: '#3B6BF6' },
  { key: 'processing', label: 'Processing', color: '#D97706' },
  { key: 'ready', label: 'Ready to dispatch', color: '#0891B2' },
  { key: 'out_for_delivery', label: 'Out for delivery', color: '#0D9488' },
  { key: 'delivered', label: 'Delivered', color: '#16A34A' },
];

// What the seller can do next from each bucket (local delivery flow)
const NEXT = {
  new: [{ status: 'processing', label: 'Accept & start packing' }, { status: 'cancelled', label: 'Cancel order', danger: true }],
  processing: [{ status: 'ready_to_ship', label: 'Mark ready for dispatch' }, { status: 'cancelled', label: 'Cancel order', danger: true }],
  ready: [{ status: 'out_for_delivery', label: 'Mark out for delivery' }],
  out_for_delivery: [{ status: 'delivered', label: 'Mark delivered' }],
};

const QuickOrders = () => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [counters, setCounters] = useState({});
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState({ anchor: null, row: null });
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    quickService.orders({ page, limit: 10, status: tab || undefined, search: deferredSearch || undefined })
      .then(({ data }) => {
        setRows(data.data || []);
        setCounters(data.counters || {});
        setPagination(data.pagination || {});
      })
      .catch((err) => dispatch(showToast({ message: getErrorMessage(err), severity: 'error' })))
      .finally(() => setLoading(false));
  };
  useEffect(load, [page, tab, deferredSearch]);

  const changeStatus = async (row, status) => {
    setMenu({ anchor: null, row: null });
    if (status === 'cancelled' && !window.confirm(`Cancel ${row.product.name} in order ${row.order_number}?`)) return;
    setBusyId(row.item_id);
    try {
      await quickService.updateItemStatus(row.item_id, status);
      dispatch(showToast({ message: 'Order updated.', severity: 'success' }));
      load();
    } catch (err) {
      dispatch(showToast({ message: getErrorMessage(err), severity: 'error' }));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box>
      <Typography sx={{ fontSize: 24, fontWeight: 600 }}>QUICK Orders</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2.5 }}>
        Local delivery orders. Pack quickly — customers were promised delivery within your area's commitment.
      </Typography>

      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {COUNTERS.map((c) => (
          <Grid item xs={6} sm={4} md key={c.key}>
            <Card sx={{ p: 2, borderRadius: '14px', border: 1, borderColor: 'divider', boxShadow: 'none', borderLeft: `4px solid ${c.color}` }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{c.label}</Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 700, mt: 0.5 }}>{counters[c.key] ?? 0}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius: '14px', border: 1, borderColor: 'divider', boxShadow: 'none' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} sx={{ px: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => { setTab(v); setPage(1); }}
            variant="scrollable"
            sx={{
              flex: 1, '& .MuiTab-root': { textTransform: 'none', fontSize: 13, minHeight: 50 },
              '& .Mui-selected': { color: `${TEAL} !important`, fontWeight: 600 }, '& .MuiTabs-indicator': { bgcolor: TEAL },
            }}
          >
            {TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
          </Tabs>
          <TextField
            size="small" placeholder="Order ID, product or PIN" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ my: 1, minWidth: 240, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
        </Stack>

        <TableContainer>
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                {['Order', 'Product', 'Customer', 'Delivery PIN', 'Amount', 'Payment', 'Status', 'Date', 'Action'].map((h) => <TableCell key={h} sx={head}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 9 }).map((__, j) => <TableCell key={j}><Skeleton height={28} /></TableCell>)}</TableRow>
              )) : rows.map((r) => (
                <TableRow key={r.item_id} hover>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>#{r.order_number}</TableCell>
                  <TableCell sx={{ maxWidth: 240 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar variant="rounded" src={r.product.image} sx={{ width: 36, height: 36 }}>{r.product.name?.[0]}</Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 14 }} noWrap>{r.product.name}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                          Qty {r.quantity}{r.variant ? ` · ${Object.values(r.variant).join(' / ')}` : ''}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14 }}>{r.customer?.name || '-'}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{r.customer?.phone || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14 }}>{r.pincode || '-'}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{r.service_area || ''}</Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>{formatINR(r.total_price)}</TableCell>
                  <TableCell><PaymentChip value={r.payment} /></TableCell>
                  <TableCell><StatusChip bucket={r.bucket} /></TableCell>
                  <TableCell sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(r.created_at)}</TableCell>
                  <TableCell>
                    {NEXT[r.bucket] ? (
                      <Button
                        size="small"
                        variant="outlined"
                        endIcon={<KeyboardArrowDownIcon />}
                        disabled={busyId === r.item_id}
                        onClick={(e) => setMenu({ anchor: e.currentTarget, row: r })}
                        sx={{ textTransform: 'none', borderRadius: '8px', borderColor: TEAL, color: TEAL, whiteSpace: 'nowrap' }}
                      >
                        Update
                      </Button>
                    ) : <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>—</Typography>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && rows.length === 0 && <EmptyRow text="No QUICK orders here yet." />}
        {(pagination.totalPages || 0) > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} />
          </Box>
        )}
      </Card>

      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={() => setMenu({ anchor: null, row: null })} disableScrollLock>
        {(NEXT[menu.row?.bucket] || []).map((a) => (
          <MenuItem key={a.status} onClick={() => changeStatus(menu.row, a.status)} sx={{ fontSize: 14, color: a.danger ? 'error.main' : 'inherit' }}>
            {a.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default QuickOrders;
