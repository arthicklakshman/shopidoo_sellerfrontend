import { useState, useEffect } from 'react';
import {
  Grid, Typography, Box, Card, CardContent, Skeleton
} from '@mui/material';

import {
  CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, XAxis, YAxis
} from 'recharts';

import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PendingIcon from '@mui/icons-material/Pending';

import StatCard from '../../components/shared/StatCard/StatCard';
import { sellerService } from '../../services/seller.service';
import { formatCurrency, formatNumber } from '../../utils/formatCurrency';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    sellerService
      .getDashboard()
      .then((res) => setData(res?.data?.data || {}))
      .catch((err) => {
        console.error("Failed to fetch dashboard data", err);
        setData({});
      })
      .finally(() => setLoading(false));
  }, []);

  // Strictly bind to database values. If empty, default to 0 or [].
  const stats = data?.stats || {};
  const monthlyRevenue = data?.monthlyRevenue || [];
  const monthlyOrders = data?.monthlyOrders || [];

  return (
    <Box>
      {loading ? (
        <Box>
          <Skeleton height={40} width={200} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            {Array(6).fill(0).map((_, i) => (
              <Grid item xs={12} sm={6} md={4} key={i}>
                <Skeleton height={120} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Welcome back, Administrator. Here's what's happening on Shopidoo.
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Total Users" value={formatNumber(stats?.totalUsers ?? 0)} icon={PeopleIcon} color="primary" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Completed Orders" value={formatNumber(stats?.completedOrders ?? 0)} icon={StorefrontIcon} color="secondary" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Total Products" value={formatNumber(stats?.totalProducts ?? 0)} icon={InventoryIcon} color="info" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Total Orders" value={formatNumber(stats?.totalOrders ?? 0)} icon={ShoppingBagIcon} color="warning" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Total Revenue" value={formatCurrency(stats?.totalRevenue ?? 0)} icon={AttachMoneyIcon} color="success" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Pending Orders" value={formatNumber(stats?.pendingOrders ?? 0)} icon={PendingIcon} color="error" />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Total Returns" value={formatNumber(stats?.totalReturns ?? 0)} icon={ShoppingBagIcon} color="warning" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>Monthly Revenue</Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v) => formatCurrency(v)} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#1B5E20" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>Monthly Orders</Typography>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthlyOrders}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line dataKey="orders" stroke="#059669" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={700}>Summary</Typography>
                  <Grid container spacing={2}>
                    {[
                      { label: 'Total Revenue', value: formatCurrency(stats?.totalRevenue || 0) },
                      { label: 'Total Orders', value: stats?.totalOrders ?? 0 },
                      { label: 'Total Users', value: stats?.totalUsers ?? 0 },
                      { label: 'Completed Orders', value: stats?.completedOrders ?? 0 },
                      { label: 'Total Returns', value: stats?.totalReturns ?? 0 },
                    ].map(({ label, value }) => (
                      <Grid item xs={6} md={3} key={label}>
                        <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h5" fontWeight={800}>{value}</Typography>
                          <Typography variant="body2" color="text.secondary">{label}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Dashboard;