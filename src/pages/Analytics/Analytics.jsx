import { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { sellerService } from '../../services/seller.service';
import { formatCurrency } from '../../utils/formatCurrency';

const COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService.getDashboard().then(({ data }) => setData(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Box>
      <Skeleton height={40} width={150} sx={{ mb: 3 }} />
      <Grid container spacing={3}>{Array(2).fill(0).map((_, i) => <Grid item xs={12} md={6} key={i}><Skeleton height={350} sx={{ borderRadius: 2 }} /></Grid>)}</Grid>
    </Box>
  );

  const monthly = data?.monthlyRevenue || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Analytics</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Revenue — Last 6 Months</Typography>
              {monthly.length === 0
                ? <Typography color="text.secondary">No data available yet.</Typography>
                : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v) => [formatCurrency(v), 'Revenue']} />
                      <Bar dataKey="revenue" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>Store Summary</Typography>
              {[
                { label: 'Total Products', value: data?.stats?.totalProducts },
                { label: 'Total Orders', value: data?.stats?.totalOrders },
                { label: 'Revenue (Delivered)', value: formatCurrency(data?.stats?.totalRevenue || 0) },
                { label: 'Pending Orders', value: data?.stats?.pendingOrders },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <Typography color="text.secondary" variant="body2">{label}</Typography>
                  <Typography fontWeight={700} variant="body2">{value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics;
