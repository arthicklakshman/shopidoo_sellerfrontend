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
  TableContainer,
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
  alpha,
  IconButton
} from "@mui/material";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningIcon from "@mui/icons-material/Warning";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

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
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchInventory();
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearch(searchParam);
    }
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await api.get("/products/inventory");
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getStatus = (stock, alert = LOW_STOCK_DEFAULT) => {
    if (stock === 0) return { label: "Out of Stock", color: "error" };
    if (stock <= alert) return { label: "Low Stock", color: "warning" };
    return { label: "In Stock", color: "success" };
  };

  const filteredProducts = data.products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const handleStockChange = (key, value) => {
    setEditStock({
      ...editStock,
      [key]: value,
    });
  };

  const updateStock = async (productId, variantId = null) => {
    try {
      const key = variantId ? `v-${variantId}` : `p-${productId}`;
      const quantity = Number(editStock[key]);
      if (isNaN(quantity) || quantity < 0) return;

      await api.patch(`/products/${productId}/stock`, {
        quantity,
        variant_id: variantId
      });
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestock = async (item) => {
    try {
      const isVariant = !!item.parentId;
      const productId = isVariant ? item.parentId : item.id;
      const variantId = isVariant ? item.id : null;

      const increaseBy = item.low_stock_alert || LOW_STOCK_DEFAULT;
      const newQuantity = item.stock_quantity + increaseBy;

      await api.patch(`/products/${productId}/stock`, {
        quantity: newQuantity,
        variant_id: variantId
      });

      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkUpdate = async () => {
    try {
      const updates = [];
      Object.keys(bulkData).forEach(key => {
        const quantity = Number(bulkData[key]);
        if (isNaN(quantity) || quantity < 0) return;

        if (key.startsWith('v-')) {
          const [vId, pId] = key.replace('v-', '').split('-');
          updates.push({ product_id: pId, variant_id: vId, quantity });
        } else {
          const pId = key.replace('p-', '');
          updates.push({ product_id: pId, quantity });
        }
      });

      if (updates.length > 0) {
        await api.patch('/products/inventory/bulk-update', { updates });
      }

      setOpenBulk(false);
      setBulkData({});
      fetchInventory();
    } catch (err) {
      console.error(err);
    }
  };

  const lowStockItems = [];
  data.products.forEach(p => {
    const alertThreshold = p.low_stock_alert || LOW_STOCK_DEFAULT;
    if (p.variants && p.variants.length > 0) {
      p.variants.forEach(v => {
        if (v.stock_quantity > 0 && v.stock_quantity <= alertThreshold) {
          const attrs = v.variant_attributes || {};
          const attrStr = Object.values(attrs).join(" / ");
          lowStockItems.push({
            ...v,
            name: `${p.name} (${attrStr})`,
            parentName: p.name,
            parentId: p.id,
            low_stock_alert: alertThreshold
          });
        }
      });
    } else {
      if (p.stock_quantity > 0 && p.stock_quantity <= alertThreshold) {
        lowStockItems.push(p);
      }
    }
  });

  const renderStockRow = (item, isVariant = false, parentId = null, parentAlert = null) => {
    const id = item.id;
    const key = isVariant ? `v-${id}` : `p-${id}`;
    const alertThreshold = isVariant ? parentAlert : (item.low_stock_alert || LOW_STOCK_DEFAULT);
    const hasVariants = !isVariant && item.variants && item.variants.length > 0;
    const isExpanded = !isVariant && expandedRows[id];

    let displayName = item.name;
    if (isVariant) {
      const attrs = item.variant_attributes || {};
      displayName = `↳ ${Object.values(attrs).join(" / ")}`;
    }

    const isParentWithVariants = hasVariants && !isVariant;
    let status = getStatus(item.stock_quantity, alertThreshold);
    if (isParentWithVariants) {
      const variantStatuses = item.variants.map(v => getStatus(v.stock_quantity, alertThreshold));
      const anyLow = variantStatuses.some(s => s.label === "Low Stock" || s.label === "Out of Stock");
      const allOut = variantStatuses.every(s => s.label === "Out of Stock");

      if (allOut) {
        status = { label: "Out of Stock", color: "error" };
      } else if (anyLow) {
        status = { label: "Low Stock", color: "warning" };
      }
    }

    return (
      <TableRow key={key} sx={{ borderBottom: isVariant ? 'none' : '1px solid', borderColor: 'divider' }}>
        <TableCell sx={{
          pl: isVariant ? "64px" : "16px",
          color: isVariant ? theme.palette.text.secondary : theme.palette.text.primary,
          fontSize: isVariant ? "14px" : "inherit",
          py: 1.5
        }}>
          <Box display="flex" alignItems="center" gap={0.5}>
            {!isVariant && hasVariants && (
              <IconButton size="small" onClick={() => toggleRow(id)} sx={{ p: 0.5 }}>
                {isExpanded ? <KeyboardArrowDownIcon fontSize="small" /> : <KeyboardArrowRightIcon fontSize="small" />}
              </IconButton>
            )}
            <Typography variant="body2" color="inherit" fontWeight={isVariant ? 400 : 600}>
              {displayName}
            </Typography>
          </Box>
        </TableCell>
        <TableCell color="text.secondary">{item.sku || "-"}</TableCell>

        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography
              fontWeight={600}
              sx={{
                color: `${status.color}.main`,
              }}
            >
              {isParentWithVariants
                ? `${item.stock_quantity ?? 0} units (Total)`
                : `${item.stock_quantity ?? 0} units`}
            </Typography>
            {isParentWithVariants && (
              <Chip label={`${item.variants.length} Variants`} size="small" variant="outlined" sx={{ fontSize: '0.7rem', height: 20 }} />
            )}
          </Box>
        </TableCell>

        <TableCell color="text.secondary">{alertThreshold}</TableCell>

        <TableCell>
          <Chip label={status.label} color={status.color} size="small" sx={{ fontWeight: 600 }} />
        </TableCell>

        <TableCell align="center">
          {isParentWithVariants ? (
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Expand row (❯) to update variant stocks
            </Typography>
          ) : (
            <Box display="flex" gap={1} justifyContent="center">
              <input
                type="number"
                value={editStock[key] ?? item.stock_quantity}
                onChange={(e) => handleStockChange(key, e.target.value)}
                style={{
                  width: "80px",
                  padding: "8px",
                  borderRadius: "8px",
                  border: "1px solid",
                  borderColor: theme.palette.divider,
                  backgroundColor: theme.palette.action.hover,
                  color: theme.palette.text.primary,
                  outline: 'none',
                  fontSize: "14px"
                }}
              />

              <Button
                variant="contained"
                size="small"
                onClick={() => updateStock(isVariant ? parentId : id, isVariant ? id : null)}
                sx={{
                  background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                  color: '#000',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                    color: '#000',
                    boxShadow: '0 4px 12px rgba(15, 185, 177, 0.3)'
                  }
                }}
              >
                Update
              </Button>
            </Box>
          )}
        </TableCell>
      </TableRow>
    );
  };

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
                <Typography color="text.secondary" variant="body2">Total Items</Typography>
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

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }}>
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
              {filteredProducts.flatMap((p) => [
                renderStockRow(p),
                ...(p.variants && expandedRows[p.id] ? p.variants.map((v) => renderStockRow(v, true, p.id, p.low_stock_alert)) : [])
              ])}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* LOW STOCK */}
      {lowStockItems.length > 0 && (
        <Paper sx={{ p: 2, borderLeft: "4px solid", borderColor: 'warning.main', bgcolor: alpha(theme.palette.warning.main, 0.05), boxShadow: 'none' }}>
          <Typography fontWeight="bold" mb={2} color="warning.main" display="flex" alignItems="center" gap={1}>
            <WarningIcon fontSize="small" /> Low Stock Alerts
          </Typography>

          {lowStockItems.map((item) => {
            const key = item.parentId ? `ls-v-${item.id}` : `ls-p-${item.id}`;
            return (
              <Box
                key={key}
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
                  <Typography fontWeight={600} color="text.primary">{item.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Only {item.stock_quantity} units remaining (Alert at {item.low_stock_alert || LOW_STOCK_DEFAULT})
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleRestock(item)}
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
            );
          })}
        </Paper>
      )}

      <Dialog open={openBulk} onClose={() => setOpenBulk(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>Bulk Update Stock</DialogTitle>
        <DialogContent dividers>
          {data.products.map((p) => {
            const hasVariants = p.variants && p.variants.length > 0;
            return (
              <Box key={p.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="text.primary" fontWeight={700} mb={hasVariants ? 1 : 0.5}>
                  {p.name}
                  {hasVariants && <Chip label="Variant Product" size="small" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />}
                </Typography>

                {!hasVariants ? (
                  <TextField
                    type="number"
                    fullWidth
                    size="small"
                    placeholder="Enter new quantity"
                    onChange={(e) =>
                      setBulkData({
                        ...bulkData,
                        [`p-${p.id}`]: e.target.value,
                      })
                    }
                  />
                ) : (
                  <Box sx={{ ml: 2, mt: 1 }}>
                    {p.variants.map((v) => {
                      const attrs = v.variant_attributes || {};
                      const attrStr = Object.values(attrs).join(" / ");
                      return (
                        <Box key={v.id} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="caption" sx={{ minWidth: 100 }}>{attrStr}</Typography>
                          <TextField
                            type="number"
                            size="small"
                            placeholder="Qty"
                            sx={{ width: 100 }}
                            onChange={(e) =>
                              setBulkData({
                                ...bulkData,
                                [`v-${v.id}-${p.id}`]: e.target.value,
                              })
                            }
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            );
          })}

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