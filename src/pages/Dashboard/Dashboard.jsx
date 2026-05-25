import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Typography, Box, Card, CardContent, Skeleton, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PendingIcon from '@mui/icons-material/Pending';
import StatCard from '../../components/shared/StatCard/StatCard';
import { sellerService } from '../../services/seller.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { useSelector } from 'react-redux';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useSelector((s) => s.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const cardLinkStyle = { textDecoration: 'none', display: 'block', cursor: 'pointer' };

  useEffect(() => {
    sellerService.getDashboard().then(({ data }) => setData(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box>
      <Skeleton height={40} width={200} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {Array(4).fill(0).map((_, i) => <Grid item xs={12} sm={6} md={3} key={i}><Skeleton height={120} sx={{ borderRadius: 2 }} /></Grid>)}
      </Grid>
    </Box>
  );

  const stats = data?.stats;
  const monthlyRevenue = data?.monthlyRevenue || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Welcome back, {user?.name}! 👋</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Here's what's happening with your store today.</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Link to="/products" style={cardLinkStyle}>
            <StatCard title="Total Products" value={stats?.totalProducts || 0} icon={InventoryIcon} color="primary" />
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Link to="/orders" style={cardLinkStyle}>
            <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={ShoppingBagIcon} color="secondary" />
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Link to="/orders" style={cardLinkStyle}>
            <StatCard 
              title="Total Revenue" 
              value={formatCurrency(stats?.totalRevenue || 0)} 
              icon={AttachMoneyIcon} 
              color="success" 
            />
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Link to="/orders" style={cardLinkStyle}>
            <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} icon={PendingIcon} color="warning" />
          </Link>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Link to="/returns" style={cardLinkStyle}>
            <StatCard 
              title="Total Returns" 
              value={stats?.totalReturns || 0} 
              icon={ShoppingBagIcon} 
              color="error" 
            />
          </Link>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Monthly Revenue</Typography>
              {monthlyRevenue.length === 0
                ? <Typography color="text.secondary">No revenue data yet.</Typography>
                : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                      <YAxis tick={{ fontSize: 12, fill: theme.palette.text.secondary }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: theme.palette.background.paper, borderColor: theme.palette.divider }}
                        itemStyle={{ color: theme.palette.text.primary }}
                        formatter={(v) => [formatCurrency(v), 'Revenue']} 
                      />
                      <Bar dataKey="revenue" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Quick Stats</Typography>
              {[
                { label: 'Active Products', value: stats?.totalProducts || 0 },
                { label: 'Orders Today', value: 0 },
                { label: 'Avg Order Value', value: stats?.totalOrders > 0 ? formatCurrency(stats.totalRevenue / stats.totalOrders) : '₹0' },
                { label: 'Completion Rate', value: '—' },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography fontWeight={700}>{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
