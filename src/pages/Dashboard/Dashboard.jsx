import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Typography, Box, Card, CardContent, Skeleton, Button, useTheme, Avatar } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Legend } from 'recharts';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PendingIcon from '@mui/icons-material/Pending';
import StatCard from '../../components/shared/StatCard/StatCard';
import { sellerService } from '../../services/seller.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { useSelector } from 'react-redux';

const cardLinkStyle = { textDecoration: 'none', display: 'block', cursor: 'pointer' };

// ─── Month Filter Buttons ─────────────────────────────────────────────────────
const MONTH_FILTERS = [
  { label: '3M', months: 3 },
  { label: '6M', months: 6 },
  { label: '9M', months: 9 },
  { label: '1Y', months: 12 },
];

const MonthFilter = ({ active, onChange }) => (
  <Box sx={{ display: 'flex', gap: 0.5 }}>
    {MONTH_FILTERS.map(({ label, months }) => (
      <Button
        key={label}
        size="small"
        variant={active === months ? 'contained' : 'outlined'}
        onClick={() => onChange(months)}
        sx={{
          minWidth: 38,
          px: 1,
          py: 0.3,
          fontSize: 12,
          fontWeight: 600,
          borderRadius: 1.5,
          ...(active === months
            ? { bgcolor: '#1B5E20', '&:hover': { bgcolor: '#15803D' } }
            : {
                borderColor: '#E5E7EB',
                color: 'text.secondary',
                '&:hover': { borderColor: '#1B5E20', color: '#1B5E20' },
              }),
        }}
      >
        {label}
      </Button>
    ))}
  </Box>
);

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid #E5E7EB', borderRadius: 2, p: 1.5 }}>
      <Typography fontWeight={700}>{label}</Typography>
      <Typography fontSize={13}>
  Revenue: ₹{Number(data?.revenue || 0).toLocaleString('en-IN')}
</Typography>
      <Typography fontSize={13}>Orders: {data.orders}</Typography>
    </Box>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revenueMonths, setRevenueMonths] = useState(12);
  const [ordersMonths, setOrdersMonths] = useState(12);

  useEffect(() => {
    sellerService.getDashboard()
       .then(({ data }) => {
  console.log("SELLER DASHBOARD RESPONSE:", data);
  console.log("DATA.DATA =", data.data);
  console.log("MONTHLY ORDERS =", data.data?.monthlyOrders);

  setData(data.data);
})
      .catch((err) => console.error('Dashboard error:', err))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {};
  const totalRevenue = Number(stats?.totalRevenue ?? 0);
  const totalReturnedAmount = Number(stats?.totalReturnedAmount ?? 0);

  const buildChartData = () => {
    const revenueMap = {};
    const ordersMap = {};

    (data?.monthlyRevenue || []).forEach(({ month, revenue }) => {
      revenueMap[month] = revenue;
    });
    console.log("monthlyOrders =", data?.monthlyOrders);

    (data?.monthlyOrders || []).forEach(({ month, orders }) => {
      ordersMap[month] = orders;
    });

    const result = [];
    const d = new Date();
    d.setMonth(d.getMonth() - 11);

    for (let i = 0; i < 12; i++) {
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${year}-${monthNum}`;
      
      const monthStr = d.toLocaleString('default', { month: 'short' });
      
      result.push({
        month: monthStr,
        revenue: Number(revenueMap[key] || 0),
        orders: Number(ordersMap[key] || 0),
      });
      
      d.setMonth(d.getMonth() + 1);
    }

    return result;
  };

  const allData      = buildChartData();
  const filteredData = allData.slice(-Math.max(revenueMonths, ordersMonths));
  const revenueData  = filteredData.slice(-revenueMonths);
  const ordersData   = filteredData.slice(-ordersMonths);

  if (loading) return (
    <Box>
      <Skeleton height={40} width={200} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {Array(4).fill(0).map((_, i) => <Grid item xs={12} sm={6} md={3} key={i}><Skeleton height={120} sx={{ borderRadius: 2 }} /></Grid>)}
      </Grid>
    </Box>
  );


  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Welcome back, {user?.name}! 👋</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Here's what's happening with your store today.</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4} sx={{ '@media (min-width: 900px)': { flexBasis: '20%', maxWidth: '20%' } }}>
          <Link to="/products" style={cardLinkStyle}>
            <StatCard title="Total Products" value={stats?.totalProducts || 0} icon={InventoryIcon} color="primary" />
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={4} sx={{ '@media (min-width: 900px)': { flexBasis: '20%', maxWidth: '20%' } }}>
          <Link to="/orders" style={cardLinkStyle}>
            <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={ShoppingBagIcon} color="secondary" />
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={4} sx={{ '@media (min-width: 900px)': { flexBasis: '20%', maxWidth: '20%' } }}>
          <Link to="/orders" style={cardLinkStyle}>
            <StatCard 
              title="Total Revenue" 
              value={formatCurrency(totalRevenue)} 
              icon={AttachMoneyIcon} 
              color="success" 
            />
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={4} sx={{ '@media (min-width: 900px)': { flexBasis: '20%', maxWidth: '20%' } }}>
          <Link to="/orders" style={cardLinkStyle}>
            <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} icon={PendingIcon} color="warning" />
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={4} sx={{ '@media (min-width: 900px)': { flexBasis: '20%', maxWidth: '20%' } }}>
          <Link to="/returns" style={cardLinkStyle}>
            <StatCard 
              title="Total Returns" 
              value={stats?.totalReturns || 0} 
              subValue={`${formatCurrency(totalReturnedAmount)} returned`}
              icon={ShoppingBagIcon} 
              color="error" 
            />
          </Link>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* ── Monthly Revenue Chart ── */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Monthly Revenue</Typography>
                  <Typography variant="caption" color="text.secondary">Revenue earned per month (₹)</Typography>
                </Box>
                <MonthFilter active={revenueMonths} onChange={setRevenueMonths} />
              </Box>
              <ResponsiveContainer width="100%" height={270}>
                <ComposedChart key={revenueMonths} data={revenueData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="rev" orientation="left" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#1B5E20' }} axisLine={false} tickLine={false} width={52} />
                  <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11, fill: '#059669' }} axisLine={false} tickLine={false} width={36} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => (
                    <span style={{ fontSize: 12, color: '#374151' }}>
                      {value === 'revenue' ? 'Revenue (₹)' : 'Orders'}
                    </span>
                  )} />
                  <Bar yAxisId="rev" dataKey="revenue" fill="#BBF7D0" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke="#1B5E20" strokeWidth={2.5} dot={{ r: 3, fill: '#1B5E20' }} activeDot={{ r: 5 }} legendType="none" />
                  <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="#059669" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Monthly Orders Chart ── */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h6" fontWeight={700}>Monthly Orders</Typography>
                  <Typography variant="caption" color="text.secondary">Orders placed per month</Typography>
                </Box>
                <MonthFilter active={ordersMonths} onChange={setOrdersMonths} />
              </Box>
              <ResponsiveContainer width="100%" height={270}>
                <ComposedChart key={ordersMonths} data={ordersData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="ord" orientation="left" tick={{ fontSize: 11, fill: '#059669' }} axisLine={false} tickLine={false} width={40} />
                  <YAxis yAxisId="rev" orientation="right" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: '#1B5E20' }} axisLine={false} tickLine={false} width={52} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend formatter={(value) => (
                    <span style={{ fontSize: 12, color: '#374151' }}>
                      {value === 'orders' ? 'Orders' : 'Revenue (₹)'}
                    </span>
                  )} />
                  <Bar yAxisId="ord" dataKey="orders" fill="#A7F3D0" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  <Line yAxisId="ord" type="monotone" dataKey="orders" stroke="#059669" strokeWidth={2.5} dot={{ r: 3, fill: '#059669' }} activeDot={{ r: 5 }} legendType="none" />
                  <Line yAxisId="rev" type="monotone" dataKey="revenue" stroke="#1B5E20" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Quick Stats</Typography>
              <Grid container spacing={2}>
                {[
                  { label: "Today's Orders", value: stats?.todaysOrders || 0 }, // ✅ Added Today's Orders
                  { label: 'Avg Order Value', value: stats?.totalOrders > 0 ? formatCurrency(totalRevenue / stats.totalOrders) : '₹0' },
                  { label: 'Total Orders', value: stats?.totalOrders || 0 },
                  { label: 'Pending Orders', value: stats?.pendingOrders || 0 },
                ].map(({ label, value }) => (
                  <Grid item xs={6} md={3} key={label}> {/* ✅ Changed md={2.4} to md={3} for a perfect 4-column layout */}
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, textAlign: 'center' }}>
                      <Typography variant="h6" fontWeight={800}>{value}</Typography>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;