import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, Card, Grid, Skeleton, Stack, Typography } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import BarChartIcon from '@mui/icons-material/BarChart';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import { showToast } from '../../features/ui/uiSlice';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { quickService } from '../../services/quick.service';
import { StatCard, DateRangeButton, defaultRange, formatShortINR } from './quickUi';

const CARDS = [
  { key: 'orders', label: 'QUICK orders', icon: ShoppingBagOutlinedIcon, tone: 'purple' },
  { key: 'sales', label: 'QUICK sales', icon: BarChartIcon, tone: 'green', money: true },
  { key: 'pending', label: 'To pack / dispatch', icon: HourglassEmptyIcon, tone: 'amber' },
  { key: 'out_for_delivery', label: 'Out for delivery', icon: LocalShippingOutlinedIcon, tone: 'violet' },
  { key: 'delivered', label: 'Delivered', icon: CheckIcon, tone: 'teal' },
  { key: 'cancelled', label: 'Cancelled', icon: CloseIcon, tone: 'red' },
];

const QuickOverview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [range, setRange] = useState(defaultRange);
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    quickService.dashboard(range)
      .then(({ data: res }) => setData(res.data))
      .catch((err) => dispatch(showToast({ message: getErrorMessage(err), severity: 'error' })));
  }, [range.from, range.to]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} spacing={2} sx={{ mb: 2.5 }}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <BoltIcon sx={{ color: '#0D9488' }} />
            <Typography sx={{ fontSize: 24, fontWeight: 600 }}>QUICK</Typography>
          </Stack>
          <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>
            {user?.name ? `${user.name}, here's` : "Here's"} how your local delivery store is doing.
          </Typography>
        </Box>
        <DateRangeButton value={range} onChange={setRange} />
      </Stack>

      <Grid container spacing={2}>
        {CARDS.map((c) => (
          <Grid item xs={12} sm={6} md={4} key={c.key}>
            {!data ? <Skeleton variant="rounded" height={104} sx={{ borderRadius: '14px' }} /> : (
              <StatCard
                label={c.label}
                icon={c.icon}
                tone={c.tone}
                value={c.money ? formatShortINR(data.cards[c.key].value) : data.cards[c.key].value}
                change={data.cards[c.key].change}
              />
            )}
          </Grid>
        ))}
      </Grid>

      {data && (data.inventory.low_stock > 0 || data.inventory.out_of_stock > 0) && (
        <Card sx={{ mt: 2, p: 2, borderRadius: '14px', boxShadow: 'none', border: 1, borderColor: 'warning.light', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ flex: 1, fontSize: 14 }}>
            {data.inventory.out_of_stock} product(s) are out of QUICK stock and {data.inventory.low_stock} are running low. Customers can't order them on QUICK.
          </Typography>
          <Button onClick={() => navigate('/quick/inventory')} sx={{ textTransform: 'none', fontWeight: 600 }}>Fix stock</Button>
        </Card>
      )}

      <Grid container spacing={2} sx={{ mt: 0 }}>
        {[
          ['List a product on QUICK', 'Set a QUICK price, reserve stock and pick delivery areas.', '/quick/products'],
          ['Handle new orders', 'Accept, pack and dispatch orders inside the delivery promise.', '/quick/orders'],
        ].map(([t, b, path]) => (
          <Grid item xs={12} md={6} key={t}>
            <Card onClick={() => navigate(path)} sx={{ p: 2.25, borderRadius: '14px', boxShadow: 'none', border: 1, borderColor: 'divider', cursor: 'pointer', '&:hover': { borderColor: '#0B8457' } }}>
              <Typography sx={{ fontWeight: 600 }}>{t}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{b}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickOverview;
