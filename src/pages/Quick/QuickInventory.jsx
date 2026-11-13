import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Avatar, Box, Button, Card, Chip, Grid, InputAdornment, Skeleton, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import BoltIcon from '@mui/icons-material/Bolt';
import WarningIcon from '@mui/icons-material/Warning';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { showToast } from '../../features/ui/uiSlice';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { quickService } from '../../services/quick.service';
import { EmptyRow } from './quickUi';

const STATUS = {
  in_stock: { label: 'In Stock', color: 'success' },
  low_stock: { label: 'Low Stock', color: 'warning' },
  out_of_stock: { label: 'Out of Stock', color: 'error' },
};

const Stat = ({ label, value, icon: Icon, color }) => (
  <Card sx={{ p: 2, borderRadius: '14px', border: 1, borderColor: 'divider', boxShadow: 'none', display: 'flex', justifyContent: 'space-between' }}>
    <Box>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', fontWeight: 600 }}>{label}</Typography>
      <Typography sx={{ fontSize: 24, fontWeight: 700, color, mt: 0.5 }}>{value}</Typography>
    </Box>
    <Icon sx={{ color }} />
  </Card>
);

const QuickInventory = () => {
  const dispatch = useDispatch();
  const [data, setData] = useState({ products: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [edits, setEdits] = useState({});
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    quickService.inventory()
      .then(({ data: res }) => setData(res.data))
      .catch((err) => dispatch(showToast({ message: getErrorMessage(err), severity: 'error' })))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async (p, value) => {
    const qty = Number(value);
    if (!Number.isInteger(qty) || qty < 0) {
      dispatch(showToast({ message: 'Enter a whole number of 0 or more.', severity: 'error' }));
      return;
    }
    if (qty > p.stock_quantity) {
      dispatch(showToast({ message: `Only ${p.stock_quantity} units in main inventory. Restock there first.`, severity: 'error' }));
      return;
    }
    setBusyId(p.id);
    try {
      await quickService.updateStock(p.id, qty);
      setEdits((e) => { const n = { ...e }; delete n[p.id]; return n; });
      dispatch(showToast({ message: 'QUICK stock updated.', severity: 'success' }));
      load();
    } catch (err) {
      dispatch(showToast({ message: getErrorMessage(err), severity: 'error' }));
    } finally {
      setBusyId(null);
    }
  };

  const q = search.trim().toLowerCase();
  const rows = data.products.filter((p) => !q || `${p.name} ${p.sku || ''}`.toLowerCase().includes(q));
  const lowItems = data.products.filter((p) => p.stock_status !== 'in_stock');

  return (
    <Box>
      <Typography sx={{ fontSize: 24, fontWeight: 600 }}>QUICK Inventory</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2.5 }}>
        Stock reserved for QUICK comes out of your main inventory, so it can never be oversold. Main stock is managed on the Inventory page.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        <Grid item xs={6} md={3}><Stat label="QUICK products" value={data.totals.products ?? 0} icon={Inventory2Icon} color="text.primary" /></Grid>
        <Grid item xs={6} md={3}><Stat label="Units reserved" value={data.totals.quick_units ?? 0} icon={BoltIcon} color="#0D9488" /></Grid>
        <Grid item xs={6} md={3}><Stat label="Low stock" value={data.totals.low_stock ?? 0} icon={WarningIcon} color="warning.main" /></Grid>
        <Grid item xs={6} md={3}><Stat label="Out of stock" value={data.totals.out_of_stock ?? 0} icon={TrendingDownIcon} color="error.main" /></Grid>
      </Grid>

      <Card sx={{ borderRadius: '14px', border: 1, borderColor: 'divider', boxShadow: 'none', mb: 2.5 }}>
        <Box sx={{ p: 2 }}>
          <TextField size="small" fullWidth placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" /></InputAdornment> }}
            sx={{ maxWidth: 360, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 820 }}>
            <TableHead>
              <TableRow>
                {['Product', 'Main inventory', 'QUICK stock', 'Unallocated', 'Status', 'Update QUICK stock'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: 13 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 6 }).map((__, j) => <TableCell key={j}><Skeleton height={28} /></TableCell>)}</TableRow>
              )) : rows.map((p) => {
                const value = edits[p.id] ?? p.quick_stock;
                const changed = String(value) !== String(p.quick_stock);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Avatar variant="rounded" src={p.image} sx={{ width: 36, height: 36 }}>{p.name?.[0]}</Avatar>
                        <Box>
                          <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{p.name}</Typography>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{p.sku || p.product_code}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{p.stock_quantity} units</TableCell>
                    <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>{p.quick_stock} units</TableCell>
                    <TableCell sx={{ fontSize: 14, color: 'text.secondary' }}>{p.unallocated} units</TableCell>
                    <TableCell><Chip size="small" label={STATUS[p.stock_status].label} color={STATUS[p.stock_status].color} sx={{ fontWeight: 600 }} /></TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <TextField size="small" type="number" value={value} sx={{ width: 100 }}
                          inputProps={{ min: 0, max: p.stock_quantity }}
                          onChange={(e) => setEdits((s) => ({ ...s, [p.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter' && changed) save(p, value); }} />
                        <Button size="small" variant="contained" disabled={!changed || busyId === p.id} onClick={() => save(p, value)}
                          sx={{ textTransform: 'none', fontWeight: 600, color: '#000', boxShadow: 'none', background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)' }}>
                          Update
                        </Button>
                        <Button size="small" sx={{ textTransform: 'none' }} disabled={busyId === p.id || p.quick_stock === p.stock_quantity}
                          onClick={() => save(p, p.stock_quantity)}>
                          Use all
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && rows.length === 0 && <EmptyRow text="No products on QUICK yet. Add one from QUICK Products." />}
      </Card>

      {lowItems.length > 0 && (
        <Card sx={{ p: 2, borderRadius: '14px', boxShadow: 'none', borderLeft: '4px solid', borderColor: 'warning.main', bgcolor: 'rgba(237,108,2,0.05)' }}>
          <Typography sx={{ fontWeight: 700, color: 'warning.main', mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon fontSize="small" /> QUICK stock alerts
          </Typography>
          {lowItems.map((p) => (
            <Stack key={p.id} direction="row" alignItems="center" sx={{ p: 1.5, mb: 1, bgcolor: 'background.paper', borderRadius: '10px' }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{p.name}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                  {p.quick_stock} left for QUICK · {p.unallocated} more available in main inventory
                </Typography>
              </Box>
              <Button size="small" variant="contained" disabled={!p.unallocated || busyId === p.id} onClick={() => save(p, p.stock_quantity)}
                sx={{ bgcolor: 'warning.main', textTransform: 'none', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: 'warning.dark' } }}>
                Move all to QUICK
              </Button>
            </Stack>
          ))}
        </Card>
      )}
    </Box>
  );
};

export default QuickInventory;
