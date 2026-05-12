import { useEffect, useState } from "react";
import api from "../../services/api";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  useTheme,
  alpha
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningIcon from "@mui/icons-material/Warning";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const LOW_STOCK_DEFAULT = 10;

const Inventory = () => {
  const theme = useTheme();
  const [data, setData] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    products: [],
  });

  const [search, setSearch] = useState("");
  const [editStock, setEditStock] = useState({});
  const [openBulk, setOpenBulk] = useState(false);
  const [bulkData, setBulkData] = useState({});

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get("/products/inventory");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatus = (stock, alert = LOW_STOCK_DEFAULT) => {
    if (stock === 0) return { label: "Out of Stock", color: "error" };
    if (stock <= alert) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  const filteredProducts = data.products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleStockChange = (id, value) => {
    setEditStock({
      ...editStock,
      [id]: value,
    });
  };

  const updateStock = async (id) => {
    try {
      const quantity = Number(editStock[id]);
      if (isNaN(quantity) || quantity < 0) return;

      await api.patch(`/products/${id}/stock`, { quantity });
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestock = async (product) => {
    try {
      const increaseBy = product.low_stock_alert || LOW_STOCK_DEFAULT;
      const newQuantity = product.stock_quantity + increaseBy;

      await api.patch(`/products/${product.id}/stock`, {
        quantity: newQuantity,
      });

      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      for (let id in bulkData) {
        const quantity = Number(bulkData[id]);
        if (isNaN(quantity) || quantity < 0) continue;

        await api.patch(`/products/${id}/stock`, { quantity });
      }

      setOpenBulk(false);
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const lowStockProducts = data.products.filter(
    (p) =>
      p.stock_quantity > 0 &&
      p.stock_quantity <= (p.low_stock_alert || LOW_STOCK_DEFAULT)
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" color="text.primary">
        Inventory Management
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Track and manage your product stock levels
      </Typography>

      <TextField
        fullWidth
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography color="text.secondary" variant="body2">Total Products</Typography>
                <Typography variant="h5" color="text.primary" fontWeight={700}>{data.totalProducts}</Typography>
              </Box>
              <Inventory2Icon color="success" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography color="text.secondary" variant="body2">Low Stock</Typography>
                <Typography variant="h5" color="warning.main" fontWeight={700}>
                  {data.lowStockCount}
                </Typography>
              </Box>
              <WarningIcon color="warning" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', boxShadow: 'none' }}>
            <CardContent sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography color="text.secondary" variant="body2">Out of Stock</Typography>
                <Typography variant="h5" color="error.main" fontWeight={700}>
                  {data.outOfStockCount}
                </Typography>
              </Box>
              <TrendingDownIcon color="error" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.paper', border: 1, borderColor: 'divider', boxShadow: 'none' }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontWeight="bold" color="text.primary">Stock Levels</Typography>
         <Button
            variant="outlined"
            onClick={() => setOpenBulk(true)}
            sx={{
              bgcolor: 'background.paper',
              color: 'success.main',
              borderColor: 'success.main',
              '&:hover': {
                bgcolor: alpha(theme.palette.success.main, 0.05),
                borderColor: 'success.main',
              }
            }}
          >
            Bulk Update
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Alert</TableCell>
              <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>Update Stock</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredProducts.map((p) => {
              const status = getStatus(
                p.stock_quantity,
                p.low_stock_alert || LOW_STOCK_DEFAULT
              );

              return (
                <TableRow key={p.id}>
                  <TableCell color="text.primary">{p.name}</TableCell>
                  <TableCell color="text.secondary">{p.sku || "-"}</TableCell>

                  <TableCell>
                    <Typography
                      fontWeight={600}
                      sx={{
                        color:
                          p.stock_quantity === 0
                            ? "error.main"
                            : p.stock_quantity <= (p.low_stock_alert || LOW_STOCK_DEFAULT)
                            ? "warning.main"
                            : "success.main",
                      }}
                    >
                      {p.stock_quantity} units
                    </Typography>
                  </TableCell>

                  <TableCell color="text.secondary">{p.low_stock_alert || LOW_STOCK_DEFAULT}</TableCell>

                  <TableCell>
                    <Chip label={status.label} color={status.color} size="small" sx={{ fontWeight: 600 }} />
                  </TableCell>

                  <TableCell align="center">
                    <Box display="flex" gap={1} justifyContent="center">
                      <input
                        type="number"
                        value={editStock[p.id] ?? p.stock_quantity}
                        onChange={(e) =>
                          handleStockChange(p.id, e.target.value)
                        }
                        style={{
                          width: "80px",
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid",
                          borderColor: theme.palette.divider,
                          backgroundColor: theme.palette.action.hover,
                          color: theme.palette.text.primary,
                          outline: 'none'
                        }}
                      />

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => updateStock(p.id)}
                        sx={{
                          background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                          color: '#000',
                          fontWeight: 600,
                          textTransform: 'none',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                            color: '#000',
                            boxShadow: '0 4px 12px rgba(15, 185, 177, 0.3)'
                          },
                        }}
                      >
                        Update
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      {/* LOW STOCK */}
      {lowStockProducts.length > 0 && (
        <Paper sx={{ p: 2, borderLeft: "4px solid", borderColor: 'warning.main', bgcolor: alpha(theme.palette.warning.main, 0.05), boxShadow: 'none' }}>
          <Typography fontWeight="bold" mb={2} color="warning.main" display="flex" alignItems="center" gap={1}>
            <WarningIcon fontSize="small" /> Low Stock Alerts
          </Typography>

          {lowStockProducts.map((p) => (
            <Box
              key={p.id}
              sx={{
                p: 2,
                mb: 1,
                bgcolor: 'background.paper',
                borderRadius: '8px',
                border: 1,
                borderColor: alpha(theme.palette.warning.main, 0.2),
                display: "flex",
                justifyContent: "space-between",
                alignItems: 'center'
              }}
            >
              <Box>
                <Typography fontWeight={600} color="text.primary">{p.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Only {p.stock_quantity} units remaining (Alert at {p.low_stock_alert || LOW_STOCK_DEFAULT})
                </Typography>
              </Box>

              <Button 
                variant="contained"
                size="small"
                onClick={() => handleRestock(p)}
                sx={{
                   bgcolor: 'warning.main',
                   color: '#fff',
                   textTransform: 'none',
                   fontWeight: 600,
                   '&:hover': { bgcolor: 'warning.dark' }
                }}
              >
                Restock
              </Button>
            </Box>
          ))}
        </Paper>
      )}

      <Dialog open={openBulk} onClose={() => setOpenBulk(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>Bulk Update Stock</DialogTitle>
        <DialogContent dividers>
          {data.products.map((p) => (
            <Box key={p.id} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" mb={1}>{p.name}</Typography>
              <TextField
                type="number"
                fullWidth
                size="small"
                placeholder="Enter new quantity"
                onChange={(e) =>
                  setBulkData({
                    ...bulkData,
                    [p.id]: e.target.value,
                  })
                }
              />
            </Box>
          ))}

          <Button
            fullWidth
            sx={{ 
              mt: 2,
              background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
              color: '#000',
              fontWeight: 700,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                color: '#000',
              }
            }}
            variant="contained"
            onClick={handleBulkUpdate}
          >
            Update All Stock
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Inventory;