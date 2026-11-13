import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Avatar, Box, Button, Card, IconButton, InputAdornment, Skeleton, Stack, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { showToast } from '../../features/ui/uiSlice';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { quickService } from '../../services/quick.service';
import { formatINR, ToneChip, EmptyRow } from './quickUi';
import QuickListingDrawer from './QuickListingDrawer';

const TEAL = '#0B8457';
const head = { fontSize: 12, fontWeight: 600, color: 'text.secondary', py: 1.5, whiteSpace: 'nowrap' };
const STATUS_TONE = { pending: 'amber', approved: 'green', blocked: 'red' };
const CHANNEL = {
  shopidoo: { label: 'Shopidoo', tone: 'grey' },
  quick: { label: 'QUICK only', tone: 'purple' },
  both: { label: 'Both channels', tone: 'teal' },
};

const QuickProducts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [all, setAll] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [drawer, setDrawer] = useState({ open: false, productId: null });

  const load = () => {
    setLoading(true);
    return quickService.products()
      .then(({ data }) => { setAll(data.data || []); setCounts(data.counts || {}); })
      .catch((err) => dispatch(showToast({ message: getErrorMessage(err), severity: 'error' })))
      .finally(() => setLoading(false));
  };

  // ?enable=<productId> — arriving from the full product form after "Create new product"
  useEffect(() => {
    load().then(() => {
      const enable = Number(params.get('enable'));
      if (enable) {
        setDrawer({ open: true, productId: enable });
        setParams({}, { replace: true });
      }
    });
  }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((p) => {
      if (tab === 'quick_all' && p.listing_channel === 'shopidoo') return false;
      if (['quick', 'both', 'shopidoo'].includes(tab) && p.listing_channel !== tab) return false;
      if (q && !`${p.name} ${p.sku || ''} ${p.product_code}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [all, tab, search]);

  const TABS = [
    { value: 'all', label: 'All products', n: counts.all },
    { value: 'quick_all', label: 'On QUICK', n: (counts.quick || 0) + (counts.both || 0) },
    { value: 'quick', label: 'QUICK only', n: counts.quick },
    { value: 'both', label: 'Both channels', n: counts.both },
    { value: 'shopidoo', label: 'Shopidoo only', n: counts.shopidoo },
  ];

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} spacing={2} sx={{ mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 600 }}>QUICK Products</Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            Manage products across your Shopidoo sales channels. QUICK has its own price, stock and delivery areas.
          </Typography>
        </Box>
        <Button
          startIcon={<AddIcon />}
          onClick={() => setDrawer({ open: true, productId: null })}
          sx={{
            textTransform: 'none', borderRadius: '10px', fontWeight: 600, px: 2.25, height: 40, color: '#000', whiteSpace: 'nowrap',
            background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
          }}
        >
          Add product
        </Button>
      </Stack>

      <Card sx={{ borderRadius: '14px', border: 1, borderColor: 'divider', boxShadow: 'none' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ md: 'center' }} sx={{ px: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            sx={{
              flex: 1, '& .MuiTab-root': { textTransform: 'none', fontSize: 13, minHeight: 50 },
              '& .Mui-selected': { color: `${TEAL} !important`, fontWeight: 600 }, '& .MuiTabs-indicator': { bgcolor: TEAL },
            }}
          >
            {TABS.map((t) => <Tab key={t.value} value={t.value} label={`${t.label}${t.n !== undefined ? ` (${t.n})` : ''}`} />)}
          </Tabs>
          <TextField
            size="small" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)}
            sx={{ my: 1, minWidth: 220, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
          />
        </Stack>

        <TableContainer>
          <Table sx={{ minWidth: 960 }}>
            <TableHead>
              <TableRow>
                {['Product', 'Normal price', 'QUICK price', 'Stock', 'Channel', 'Delivery areas', 'Approval', ''].map((h) => <TableCell key={h} sx={head}>{h}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => <TableCell key={j}><Skeleton height={28} /></TableCell>)}</TableRow>
              )) : rows.map((p) => {
                const onQuick = p.listing_channel !== 'shopidoo';
                return (
                  <TableRow key={p.id} hover>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar variant="rounded" src={p.image} sx={{ width: 40, height: 40, bgcolor: 'action.hover' }}>{p.name?.[0]}</Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ fontSize: 14, fontWeight: 600 }} noWrap>{p.name}</Typography>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{p.product_code}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{formatINR(p.price)}</TableCell>
                    <TableCell>
                      {onQuick ? (
                        <>
                          <Typography sx={{ fontSize: 14, fontWeight: 600, color: TEAL }}>{formatINR(p.quick_price)}</Typography>
                          {p.quick_mrp ? <Typography sx={{ fontSize: 12, color: 'text.secondary', textDecoration: 'line-through' }}>{formatINR(p.quick_mrp)}</Typography> : null}
                        </>
                      ) : <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Not configured</Typography>}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 14 }}>{p.stock_quantity} units</Typography>
                      {onQuick && (
                        <Typography sx={{ fontSize: 12, color: p.quick_stock === 0 ? 'error.main' : 'text.secondary' }}>
                          {p.quick_stock} reserved for QUICK
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell><ToneChip label={CHANNEL[p.listing_channel]?.label} tone={CHANNEL[p.listing_channel]?.tone} dot={false} /></TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      {onQuick ? (
                        <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
                          {p.quick_service_areas.map((a) => <ToneChip key={a.id} label={a.name} tone="grey" dot={false} />)}
                        </Stack>
                      ) : <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>-</Typography>}
                    </TableCell>
                    <TableCell><ToneChip label={p.admin_status} tone={STATUS_TONE[p.admin_status]} /></TableCell>
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      <Tooltip title={onQuick ? 'Edit QUICK listing' : 'Add to QUICK'}>
                        <IconButton size="small" onClick={() => setDrawer({ open: true, productId: p.id })}>
                          {onQuick ? <EditOutlinedIcon fontSize="small" /> : <AddIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit full product">
                        <IconButton size="small" onClick={() => navigate(`/products/${p.id}/edit`)}>
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && rows.length === 0 && <EmptyRow text="No products here yet. Use Add product to list one on QUICK." />}
      </Card>

      <QuickListingDrawer
        open={drawer.open}
        initialProductId={drawer.productId}
        products={all}
        onClose={() => setDrawer({ open: false, productId: null })}
        onSaved={() => { setDrawer({ open: false, productId: null }); load(); }}
      />
    </Box>
  );
};

export default QuickProducts;
