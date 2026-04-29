
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
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningIcon from "@mui/icons-material/Warning";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

const LOW_STOCK_DEFAULT = 10;

const Inventory = () => {
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

  // 🔥 NEW: RESTOCK FUNCTION (NO UI CHANGE)
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
      <Typography variant="h5" fontWeight="bold">
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
          <Card>
            <CardContent sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography>Total Products</Typography>
                <Typography variant="h5">{data.totalProducts}</Typography>
              </Box>
              <Inventory2Icon color="success" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography>Low Stock</Typography>
                <Typography variant="h5" color="warning.main">
                  {data.lowStockCount}
                </Typography>
              </Box>
              <WarningIcon color="warning" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Typography>Out of Stock</Typography>
                <Typography variant="h5" color="error.main">
                  {data.outOfStockCount}
                </Typography>
              </Box>
              <TrendingDownIcon color="error" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography fontWeight="bold">Stock Levels</Typography>
         <Button
            variant="outlined"
            onClick={() => setOpenBulk(true)}
            sx={{
              bgcolor: '#fff',
              color: 'rgb(76, 175, 80)',
              borderColor: 'rgb(76, 175, 80)',
            }}
          >
            Bulk Update
          </Button>
        </Box>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Alert</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Update Stock</TableCell>
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
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.sku || "-"}</TableCell>

                  <TableCell>
                    <Typography
                      sx={{
                        color:
                          p.stock_quantity === 0
                            ? "red"
                            : p.stock_quantity <= (p.low_stock_alert || LOW_STOCK_DEFAULT)
                            ? "orange"
                            : "green",
                      }}
                    >
                      {p.stock_quantity} units
                    </Typography>
                  </TableCell>

                  <TableCell>{p.low_stock_alert || LOW_STOCK_DEFAULT}</TableCell>

                  <TableCell>
                    <Chip label={status.label} color={status.color} size="small" />
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
                          padding: "6px",
                          borderRadius: "6px",
                          border: "1px solid #ccc",
                        }}
                      />

                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => updateStock(p.id)}
                        sx={{
                          background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                          color: '#000',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                            color: '#000',
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
      <Paper sx={{ p: 2, borderLeft: "4px solid orange" }}>
        <Typography fontWeight="bold" mb={2}>
          ⚠ Low Stock Alerts
        </Typography>

        {lowStockProducts.map((p) => (
          <Box
            key={p.id}
            sx={{
              p: 2,
              mb: 1,
              bgcolor: "#fff3cd",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography>{p.name}</Typography>
              <Typography variant="caption">
                Only {p.stock_quantity} units remaining
              </Typography>
            </Box>

            {/* 🔥 ONLY CHANGE HERE */}
            <Button onClick={() => handleRestock(p)}>Restock</Button>
          </Box>
        ))}
      </Paper>

      <Dialog open={openBulk} onClose={() => setOpenBulk(false)}>
        <DialogTitle>Bulk Update Stock</DialogTitle>

        <DialogContent>
          {data.products.map((p) => (
            <TextField
              key={p.id}
              label={p.name}
              type="number"
              fullWidth
              margin="dense"
              onChange={(e) =>
                setBulkData({
                  ...bulkData,
                  [p.id]: e.target.value,
                })
              }
            />
          ))}

          <Button
            fullWidth
            sx={{ mt: 2 }}
            variant="contained"
            onClick={handleBulkUpdate}
          >
            Update All
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Inventory;