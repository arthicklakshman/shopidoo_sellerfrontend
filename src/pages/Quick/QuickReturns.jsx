import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Avatar, Box, Button, Card, Skeleton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import { showToast } from '../../features/ui/uiSlice';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { quickService } from '../../services/quick.service';
import { formatINR, formatDateTime, ToneChip, EmptyRow } from './quickUi';

const statusTone = (s = '') => {
  const v = s.toLowerCase();
  if (v.includes('reject') || v.includes('cancel')) return 'red';
  if (v.includes('complete') || v.includes('refunded') || v.includes('approved')) return 'green';
  if (v.includes('process') || v.includes('pickup')) return 'amber';
  return 'blue';
};
const pretty = (s = '') => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const QuickReturns = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quickService.returns()
      .then(({ data }) => setRows(data.data || []))
      .catch((err) => dispatch(showToast({ message: getErrorMessage(err), severity: 'error' })))
      .finally(() => setLoading(false));
  }, []);

  const open = rows.filter((r) => !/complete|refunded|reject|cancel/i.test(r.status || '')).length;

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} spacing={2} sx={{ mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 600 }}>QUICK Returns</Typography>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            Return requests on QUICK orders. They follow the same rules, SLA and actions as your Shopidoo returns.
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => navigate('/returns')}
          sx={{ textTransform: 'none', borderRadius: '10px', borderColor: '#0B8457', color: '#0B8457', whiteSpace: 'nowrap' }}>
          Open Returns to take action
        </Button>
      </Stack>

      <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
        {[['Total requests', rows.length], ['Needs attention', open]].map(([k, v]) => (
          <Card key={k} sx={{ p: 2, minWidth: 170, borderRadius: '14px', border: 1, borderColor: 'divider', boxShadow: 'none' }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{k}</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>{v}</Typography>
          </Card>
        ))}
      </Stack>

      <Card sx={{ borderRadius: '14px', border: 1, borderColor: 'divider', boxShadow: 'none' }}>
        <TableContainer>
          <Table sx={{ minWidth: 880 }}>
            <TableHead>
              <TableRow>
                {['Product', 'Customer', 'PIN', 'Return amount', 'Type', 'Reason', 'Status', 'Date'].map((h) => (
                  <TableCell key={h} sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 8 }).map((__, j) => <TableCell key={j}><Skeleton height={28} /></TableCell>)}</TableRow>
              )) : rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar variant="rounded" src={r.product.image} sx={{ width: 36, height: 36 }}>{r.product.name?.[0]}</Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{r.product.name}</Typography>
                        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Order #{r.order_number}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ fontSize: 14 }}>{r.customer || '-'}</TableCell>
                  <TableCell sx={{ fontSize: 14 }}>{r.pincode || '-'}</TableCell>
                  <TableCell sx={{ fontSize: 14, fontWeight: 600 }}>{formatINR(r.amount)}</TableCell>
                  <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#0D9488', textTransform: 'uppercase' }}>{r.type}</TableCell>
                  <TableCell sx={{ fontSize: 14 }}>{r.reason}</TableCell>
                  <TableCell><ToneChip label={pretty(r.status)} tone={statusTone(r.status)} /></TableCell>
                  <TableCell sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>{formatDateTime(r.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!loading && rows.length === 0 && <EmptyRow text="No return requests on QUICK orders." />}
      </Card>
    </Box>
  );
};

export default QuickReturns;
