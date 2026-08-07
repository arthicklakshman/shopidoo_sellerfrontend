import { useState, useEffect } from 'react';
import { useTheme, alpha } from '@mui/material';
import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, MenuItem, Select, Pagination, FormControl, TextField, CircularProgress, Menu } from '@mui/material';
import { sellerService } from '../../services/seller.service';
import { shipmentService } from '../../services/shipment.service';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import OrderStatusChip from '../../components/shared/OrderStatusChip/OrderStatusChip';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';
import { generateInvoice } from '../../utils/generateInvoice';
import { getZoomCorrectedAnchor } from '../../utils/zoomCorrectedAnchor';
import { fetchSettingsOnce } from '../../utils/settingsCache';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Tooltip from '@mui/material/Tooltip';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import PrintIcon from '@mui/icons-material/Print';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';


const ALLOWED_STATUSES = ['pending', 'confirmed', 'packed', 'ready_to_ship', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'returned', 'return_requested', 'replacement_sent'];

// ── Fee/GST helper (shared logic with Wallet & Dashboard) ────────────────────
// Cached at module scope so every component on this page shares one fetch.
let cachedFeeRates = null;
let feeRatesPromise = null;

const getFeeRates = () => {
  if (cachedFeeRates) return Promise.resolve(cachedFeeRates);
  if (!feeRatesPromise) {
    feeRatesPromise = fetchSettingsOnce()
      .then((raw) => {
        cachedFeeRates = {
          gatewayFeeRate: Number(raw?.gatewayFee || 0) / 100,
          gstRate: Number(raw?.gst || 0) / 100,
        };
        return cachedFeeRates;
      })
      .catch(() => {
        cachedFeeRates = { gatewayFeeRate: 0, gstRate: 0 };
        return cachedFeeRates;
      });
  }
  return feeRatesPromise;
};

const computeNetAmount = (grossAmount, rates) => {
  const gross = Number(grossAmount) || 0;
  const gatewayFee = gross * (rates?.gatewayFeeRate || 0);
  const gstOnFee = gatewayFee * (rates?.gstRate || 0);
  return Math.round((gross - gatewayFee - gstOnFee) * 100) / 100;
};

const GRADIENT_BUTTON_SX = {
  background: '#fff',
  color: '#0B8457',
  border: '1px solid #0B8457',
  fontWeight: 700,
  textTransform: 'none',
  borderRadius: '8px',
  boxShadow: 'none',
  '&:hover': {
    background: 'rgba(11, 132, 87, 0.04)',
    border: '1px solid #0B8457',
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    background: '#fff',
    color: '#9e9e9e',
    border: '1px solid #e0e0e0',
  }
};

const OUTLINED_GREEN_SX = {
  borderColor: '#0FB9B1',
  color: '#0FB9B1',
  fontWeight: 700,
  textTransform: 'none',
  borderRadius: '8px',
  boxShadow: 'none',
  '&:hover': {
    borderColor: '#0B8457',
    color: '#0B8457',
    bgcolor: 'rgba(15, 185, 177, 0.04)',
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    borderColor: '#e0e0e0',
    color: '#9e9e9e',
    opacity: 0.7
  }
};

const SELECT_GREEN_SX = {
  borderRadius: '8px',
  color: '#0FB9B1',
  fontWeight: 700,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#0FB9B1',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#0B8457',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#0FB9B1',
  },
  '& .MuiSelect-icon': {
    color: '#0FB9B1',
  },
  bgcolor: 'transparent',
};

const BUTTON_GREEN_SX = {
  borderColor: '#0FB9B1',
  color: '#0FB9B1',
  fontWeight: 700,
  borderRadius: '8px',
  height: 40,
  textTransform: 'none',
  bgcolor: 'transparent',
  border: '1px solid #0FB9B1',
  '&:hover': {
    borderColor: '#0B8457',
    color: '#0B8457',
    bgcolor: 'rgba(15, 185, 177, 0.04)',
  },
  '&.Mui-disabled': {
    borderColor: '#e0e0e0',
    color: '#9e9e9e',
    opacity: 0.7
  }
};

const DELIVERY_COLORS = (theme) => ({
  delivered: { bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark },
  cancelled: { bg: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.dark },
  shipped: { bg: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.dark },
  processing: { bg: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark },
  confirmed: { bg: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark },
  pending: { bg: theme.palette.action.hover, color: theme.palette.text.secondary },
  refunded: { bg: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.dark },
  packed: { bg: alpha(theme.palette.warning.main, 0.15), color: theme.palette.warning.dark },
  ready_to_ship: { bg: alpha(theme.palette.primary.main, 0.15), color: theme.palette.primary.dark },
  returned: { bg: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.dark },
  return_requested: { bg: alpha(theme.palette.warning.main, 0.15), color: theme.palette.warning.dark },
  replacement_sent: { bg: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.dark },
});

const StatusBadge = ({ label, colorMap }) => {
  return (
    <Box component="span" sx={{ px: 1.5, py: 0.4, borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', bgcolor: colorMap[label]?.bg || 'action.hover', color: colorMap[label]?.color || 'text.secondary' }}>
      {label}
    </Box>
  );
};

const getNextStatuses = (currentStatus, isSelf = false) => {
  if (!currentStatus) return [];
  const s = currentStatus.toLowerCase();
  if(s==="pending") return ["confirmed"];
  if(s==="confirmed") return ["packed"];
  if(s==="packed") return isSelf ? [] : ["ready_to_ship"];
  if(s==="processing") return ["shipped"];
  if(s==="ready_to_ship") return []; // Platform shipments stop manual updates here
  if(s==="shipped") return isSelf ? ["in_transit"] : [];
  if(s==="in_transit") return isSelf ? ["delivered"] : [];
  if(s==="return_requested") return [];
  return [];
};

const OrderDetailDialog = ({ open, onClose, order, onStatusUpdate }) => {
  const theme = useTheme();
  const [updating, setUpdating] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showManualShipForm, setShowManualShipForm] = useState(false);
  const [manualCourier, setManualCourier] = useState('');
  const [manualTracking, setManualTracking] = useState('');
  const [statusMenuAnchor, setStatusMenuAnchor] = useState(null);
  const [feeRates, setFeeRates] = useState({ gatewayFeeRate: 0, gstRate: 0 });
  const dispatch = useDispatch();

  useEffect(() => {
    getFeeRates().then(setFeeRates);
  }, []);

  const getShipmentActiveStep = (status) => {
    if (!status) return 0;
    const s = status.toLowerCase();
    if (['delivered'].includes(s)) return 4;
    if (['in_transit', 'out_for_delivery'].includes(s)) return 2;
    if (['shipped'].includes(s)) return 1;
    return 0;
  };

  useEffect(() => {
    // Reset local states when dialog is opened or order changes
    setExpanded(false);
    setLogs([]);
    setLogsLoading(false);
    setActionLoading(false);
    setShowManualShipForm(false);
    setManualCourier('');
    setManualTracking('');
    setStatusMenuAnchor(null);
  }, [order, open]);

  if (!order) return null;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      if (isSelfShipping && newStatus === 'in_transit') {
        await shipmentService.markInTransit(shipment.id);
      } else if (isSelfShipping && newStatus === 'delivered') {
        await shipmentService.markDelivered(shipment.id);
      } else if (!isSelfShipping && newStatus === 'ready_to_ship') {
        if (!shipment) {
          throw new Error('Shipment record not found for this order.');
        }
        await shipmentService.readyToShip(shipment.id);
      } else {
        await sellerService.updateOrderItemStatus(order.itemId, newStatus);
      }
      dispatch(showToast({ message: 'Status updated successfully', severity: 'success' }));
      onStatusUpdate?.();
      onClose();
    } catch (err) {
      dispatch(showToast({ message: err?.response?.data?.message || 'Failed to update status', severity: 'error' }));
    } finally {
      setUpdating(false);
    }
  };

  const shipment = order.rawItem?.Order?.shipments?.[0] || order.rawItem?.order?.shipments?.[0] || null;
  // Before a Shipment record exists yet, fall back to the seller's own shippingPreference
  // (this is the seller's own Orders page, so it's always the same seller for every row) —
  // Order itself has no shippingMode/shipping_courier field, so those old fallbacks never matched.
  const isSelfShipping = shipment?.shippingMode === 'self' || (!shipment && (order.rawItem?.seller?.shippingPreference === 'self' || order.rawItem?.product?.seller?.shippingPreference === 'self'));

  // ── Amount breakdown (seller-facing only) ──────────────────────────────────
  const rawOrderData = order.rawItem?.Order || order.rawItem?.order;
  const productPriceGross = order.rawItem
    ? Number(order.rawItem.unit_price || 0) * Number(order.rawItem.quantity || 0)
    : Number(order.amount) || 0;
  // Only surface coupons the seller themself created — admin-wide coupons aren't
  // this seller's discount to explain.
  const sellerCoupon = rawOrderData?.coupon?.created_by === 'seller' ? rawOrderData.coupon : null;
  const couponDiscount = sellerCoupon ? Math.max(0, productPriceGross - Number(order.amount || 0)) : 0;
  // Shown for every order, labelled by who actually handles delivery — self-ship
  // sellers front this cost themselves and get it reimbursed via the wallet 1:1.
  const shippingCharge = Number(rawOrderData?.shipping_charge || 0);
  const shippingChargeLabel = isSelfShipping ? 'Self Shipment' : 'Platform Logistics';
  const totalAmountPaid = rawOrderData?.total_amount != null
    ? Number(rawOrderData.total_amount)
    : (productPriceGross + shippingCharge - couponDiscount);

  const handleManualShip = async () => {
    if (!manualCourier || !manualTracking) {
      dispatch(showToast({ message: 'Courier and Tracking Code are required', severity: 'error' }));
      return;
    }
    setActionLoading(true);
    try {
      await shipmentService.selfShip(shipment.id, { courierName: manualCourier, trackingNumber: manualTracking });
      dispatch(showToast({ message: 'Shipment dispatched successfully', severity: 'success' }));
      onStatusUpdate?.();
      onClose();
    } catch (err) {
      dispatch(showToast({ message: err.response?.data?.message || 'Failed to dispatch shipment', severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (actionType) => {
    setActionLoading(true);
    try {
      let res;
      if (actionType === 'retry') {
        res = await shipmentService.retryShipment(shipment.id);
        dispatch(showToast({ message: 'AWB Generation triggered successfully.', severity: 'success' }));
        onStatusUpdate?.();
        onClose();
      } else if (actionType === 'label') {
        res = await shipmentService.generateLabel(shipment.id);
        const url = res.data?.data?.labelUrl;
        if (url) window.open(url, '_blank');
      } else if (actionType === 'invoice') {
        res = await shipmentService.generateInvoice(shipment.id);
        const url = res.data?.data?.invoiceUrl;
        if (url) window.open(url, '_blank');
      } else if (actionType === 'manifest') {
        res = await shipmentService.generateManifest(shipment.id);
        const url = res.data?.data?.manifestUrl;
        if (url) window.open(url, '_blank');
      } else if (actionType === 'print-document') {
        res = await shipmentService.printDocuments(shipment.id);
        const url = res.data?.data?.documentUrl;
        if (url) window.open(url, '_blank');
        dispatch(showToast({ message: 'Documents printed successfully.', severity: 'success' }));
      }
    } catch (err) {
      dispatch(showToast({ message: err.response?.data?.message || `Failed to perform action: ${actionType}`, severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTracking = async () => {
    setExpanded(!expanded);
    if (!expanded && shipment?.awbCode && logs.length === 0) {
      setLogsLoading(true);
      try {
        const { data } = await shipmentService.getTrackingLogs(shipment.awbCode);
        setLogs(data.data.logs || []);
      } catch (err) {
        console.error('Error fetching logs', err);
      } finally {
        setLogsLoading(false);
      }
    }
  };

  const addressString = typeof order.address === 'string' ? order.address : (order.address ? `${order.address.address_line1 || ''}\n${order.address.city || ''}, ${order.address.state || ''} ${order.address.pincode || ''}` : '-');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Order Details - {order.orderNumber}</Typography>
            <Typography variant="body2" color="text.secondary">View and manage order details and status.</Typography>
          </Box>
          <IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Customer Name</Typography>
            <Typography variant="body1">{order.customer || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Product</Typography>
            <Typography variant="body1">{order.product || '-'}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2.5 }} />
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Amount Breakdown</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Product Price</Typography>
                <Typography variant="body2">{formatCurrency(productPriceGross)}</Typography>
              </Box>
              {sellerCoupon && couponDiscount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Coupon Discount ({sellerCoupon.code}) (Seller)</Typography>
                  <Typography variant="body2" color={theme.palette.error.main}>-{formatCurrency(couponDiscount)}</Typography>
                </Box>
              )}
              {shippingCharge > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Shipment Charge ({shippingChargeLabel})</Typography>
                  <Typography variant="body2">{formatCurrency(shippingCharge)}</Typography>
                </Box>
              )}
              <Divider sx={{ my: 0.5 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" fontWeight={700}>Total Amount Paid by Customer</Typography>
                <Typography variant="body1" fontWeight={700}>{formatCurrency(totalAmountPaid)}</Typography>
              </Box>
              {isSelfShipping && shippingCharge > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Self-ship order — the {formatCurrency(shippingCharge)} shipping charge is credited to your wallet along with the settlement.
                </Typography>
              )}
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Quantity</Typography>
            <Typography variant="body1">{order.quantity ?? '-'}</Typography>
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2.5 }} />
        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>Delivery Status</Typography>
            <StatusBadge label={order.status || 'pending'} colorMap={DELIVERY_COLORS(theme)} />
          </Grid>
        </Grid>
        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ mb: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
            <LocationOnOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body1" fontWeight={700}>Shipping Address</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{addressString}</Typography>
        </Box>

        {shipment ? (
          <>
            <Divider sx={{ mb: 2.5 }} />
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" fontWeight={700} sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingIcon fontSize="small" sx={{ color: '#0FB9B1' }} /> {isSelfShipping ? 'Self Shipping' : 'Shiprocket Logistics'}
              </Typography>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>AWB Code</Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {shipment.awbCode || 'Not Generated'}
                      {shipment.awbCode && (
                        <IconButton size="small" onClick={() => { navigator.clipboard.writeText(shipment.awbCode); dispatch(showToast({ message: 'AWB Copied!', severity: 'success' })); }}>
                          <ContentCopyIcon fontSize="inherit" />
                        </IconButton>
                      )}
                    </Typography>
                  </Box>
                  {shipment.courierName && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Courier</Typography>
                      <Typography variant="body1" fontWeight={600}>{shipment.courierName}</Typography>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>Shipment Status</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize', fontWeight: 600 }}>
                      {shipment.status}
                    </Typography>
                  </Grid>
                  {(shipment.estimatedDeliveryDate || shipment.estimated_delivery_date) && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>Estimated Delivery</Typography>
                      <Typography variant="body1" fontWeight={600} color="primary.main">
                        {formatDate(shipment.estimatedDeliveryDate || shipment.estimated_delivery_date)}
                      </Typography>
                    </Grid>
                  )}
                  {!isSelfShipping && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Invoice</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {shipment.invoiceUrl || shipment.combinedDocumentUrl ? 'Generated' : 'Not Generated'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Label</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {shipment.shippingLabelUrl || shipment.combinedDocumentUrl ? 'Generated' : 'Not Generated'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Pickup Status</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {shipment.pickupBooked ? 'Scheduled' : 'Not Scheduled'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Documents</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {shipment.combinedDocumentUrl ? 'Single Combined PDF Available' : 'Not Available'}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  {shipment.failureReason && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="error" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WarningAmberIcon fontSize="inherit" /> Reason for Failure
                      </Typography>
                      <Typography variant="body2" color="error.dark" sx={{ bgcolor: alpha(theme.palette.error.main, 0.05), p: 1, borderRadius: 1 }}>
                        {shipment.failureReason}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {shipment.status && !shipment.failureReason && (
                  <Box sx={{ width: '100%', my: 3 }}>
                    <Stepper
                      activeStep={getShipmentActiveStep(shipment.status)}
                      alternativeLabel
                      sx={{
                        '& .MuiStepIcon-root.Mui-active': {
                          color: '#0FB9B1',
                        },
                        '& .MuiStepIcon-root.Mui-completed': {
                          color: '#0FB9B1',
                        },
                      }}
                    >
                      {['Created', 'Shipped', 'Transit', 'Delivered'].map((label, index) => {
                        const labelProps = {};
                        const activeStep = getShipmentActiveStep(shipment.status);
                        const isFailed = ['cancelled', 'failed', 'rto'].includes(shipment.status?.toLowerCase());
                        if (isFailed && index === activeStep) {
                          labelProps.error = true;
                        }
                        return (
                          <Step key={label}>
                            <StepLabel {...labelProps}>
                              <Typography variant="caption" fontWeight={600}>
                                {isFailed && index === activeStep ? (shipment.status === 'cancelled' ? 'Cancelled' : 'Failed') : label}
                              </Typography>
                            </StepLabel>
                          </Step>
                        );
                      })}
                    </Stepper>
                  </Box>
                )}

                {/* Print & Action Buttons */}
                {!isSelfShipping && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                    {(shipment.status === 'failed' || (shipment.status === 'ready_to_ship' && !shipment.awbCode)) && (
                      <Button variant="contained" size="small" startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <AutorenewIcon />} disabled={actionLoading} onClick={() => handleAction('retry')} sx={{ ...GRADIENT_BUTTON_SX, px: 2 }}>
                        Generate AWB / Retry
                      </Button>
                    )}
                    {shipment.shipmentId && shipment.shiprocketOrderId && (
                      <Button variant="contained" size="small" startIcon={actionLoading ? <CircularProgress size={16} color="inherit" /> : <PrintIcon />} disabled={actionLoading} onClick={() => handleAction('print-document')} sx={{ ...GRADIENT_BUTTON_SX, px: 2 }}>
                        Print Documents
                      </Button>
                    )}
                  </Box>
                )}

                {isSelfShipping && shipment?.status === 'packed' && !showManualShipForm && (
                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <Button variant="contained" size="small" onClick={() => setShowManualShipForm(true)} sx={{ ...GRADIENT_BUTTON_SX, px: 2 }}>
                      Ship Manually
                    </Button>
                  </Box>
                )}

                {showManualShipForm && (
                  <Box sx={{ mt: 2, mb: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: '#fff' }}>
                    <Typography variant="body2" fontWeight={600} mb={1.5}>Ship Manually</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={manualCourier}
                            onChange={(e) => setManualCourier(e.target.value)}
                            displayEmpty
                            sx={{
                              borderRadius: '8px',
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#0FB9B1',
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#0B8457',
                              },
                            }}
                          >
                            <MenuItem value="" disabled>Select Courier</MenuItem>
                            <MenuItem value="Professional Couriers">Professional Couriers</MenuItem>
                            <MenuItem value="Shadowfax">Shadowfax</MenuItem>
                            <MenuItem value="Ecom Express">Ecom Express</MenuItem>
                            <MenuItem value="XpressBees">XpressBees</MenuItem>
                            <MenuItem value="Delhivery">Delhivery</MenuItem>
                            <MenuItem value="DTDC">DTDC</MenuItem>
                            <MenuItem value="Blue Dart">Blue Dart</MenuItem>
                            <MenuItem value="Amazon Shipping">Amazon Shipping</MenuItem>
                            <MenuItem value="Ekart Logistics">Ekart Logistics</MenuItem>
                            <MenuItem value="FedEx">FedEx</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Tracking Code (AWB)"
                          value={manualTracking}
                          onChange={(e) => setManualTracking(e.target.value)}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '8px',
                              '&.Mui-focused fieldset': {
                                borderColor: '#0FB9B1',
                              },
                              '&:hover fieldset': {
                                borderColor: '#0B8457',
                              },
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button
                          size="small"
                          onClick={() => setShowManualShipForm(false)}
                          disabled={actionLoading}
                          sx={{
                            color: '#0FB9B1',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                              bgcolor: 'rgba(15, 185, 177, 0.04)',
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleManualShip}
                          disabled={actionLoading}
                          sx={{
                            background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                            color: '#000',
                            fontWeight: 700,
                            borderRadius: '8px',
                            textTransform: 'none',
                            boxShadow: 'none',
                            '&:hover': {
                              background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                              opacity: 0.9,
                              boxShadow: 'none',
                            },
                          }}
                        >
                          {actionLoading ? <CircularProgress size={16} color="inherit" /> : 'Submit'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                )}

                {shipment.awbCode && (
                  <Box sx={{ mt: 1.5 }}>
                    <Button
                      size="small"
                      onClick={handleToggleTracking}
                      endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        color: '#0B8457',
                        '&:hover': {
                          color: '#0B8457',
                          bgcolor: 'rgba(11, 132, 87, 0.04)',
                        }
                      }}
                    >
                      {expanded ? 'Hide Tracking History' : 'Show Tracking History'}
                    </Button>
                    {expanded && (
                      <Box sx={{ mt: 1.5, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                        {logsLoading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                            <CircularProgress size={16} />
                            <Typography variant="body2" color="text.secondary">Fetching status logs...</Typography>
                          </Box>
                        ) : logs.length === 0 ? (
                          <Typography variant="body2" color="text.secondary">No logs yet.</Typography>
                        ) : (
                          logs.map((log, idx) => (
                            <Box key={idx} sx={{ mb: 1.5, position: 'relative' }}>
                              <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                                {log.status?.replace(/_/g, ' ')}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                {formatDate(log.timestamp)} {log.location ? `| ${log.location}` : ''}
                              </Typography>
                              {log.message && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                  {log.message}
                                </Typography>
                              )}
                            </Box>
                          ))
                        )}
                      </Box>
                    )}
                  </Box>
                )}
              </Card>
            </Box>
          </>
        ) : (
          <>
            <Divider sx={{ mb: 2.5 }} />
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="body1" fontWeight={700} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingIcon fontSize="small" sx={{ color: '#0FB9B1' }} /> {isSelfShipping ? 'Self Shipping' : 'Shiprocket Logistics'}
              </Typography>
              <Typography variant="body2" color="text.secondary">No shipment has been created for this order yet.</Typography>
            </Box>
          </>
        )}

        <Divider sx={{ mb: 2.5 }} />
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
            <AccessTimeOutlinedIcon fontSize="small" color="action" />
            <Typography variant="body1" fontWeight={700}>Order Timeline</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">Order Placed</Typography>
            <Typography variant="body2" color="text.secondary">{order.createdAt ? formatDate(order.createdAt) : '-'}</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<FileDownloadOutlinedIcon />} sx={{ flex: 1, height: 40, ...OUTLINED_GREEN_SX }} onClick={() => generateInvoice(order.rawItem, true)}>
            Download Invoice
          </Button>
          <Button
            variant="outlined"
            endIcon={<KeyboardArrowDownIcon sx={{ color: statusMenuAnchor ? '#0B8457' : '#0FB9B1' }} />}
            disabled={updating || getNextStatuses(isSelfShipping ? (shipment?.status || order?.status) : order?.status, isSelfShipping).length === 0}
            onClick={(e) => setStatusMenuAnchor(e.currentTarget)}
            sx={{ ...BUTTON_GREEN_SX, flex: 1 }}
          >
            Update Status
          </Button>
          <Menu
            anchorEl={getZoomCorrectedAnchor(statusMenuAnchor)}
            open={Boolean(statusMenuAnchor)}
            onClose={() => setStatusMenuAnchor(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            slotProps={{
              paper: {
                style: {
                  width: statusMenuAnchor ? statusMenuAnchor.clientWidth : undefined,
                }
              }
            }}
          >
            {getNextStatuses(isSelfShipping ? (shipment?.status || order?.status) : order?.status, isSelfShipping).map((status) => {
              const label = status === 'ready_to_ship' ? 'Ready For Pickup' : status.replace('_', ' ');
              return (
                <MenuItem
                  key={status}
                  onClick={() => {
                    handleStatusChange(status);
                    setStatusMenuAnchor(null);
                  }}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {label}
                </MenuItem>
              );
            })}
          </Menu>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

const StatCard = ({ title, value, icon, color, loading }) => {
  return (
    <Card sx={{ p: 2.5, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid', borderColor: 'divider', minHeight: 100 }}>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={600} gutterBottom>{title}</Typography>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Typography variant="h4" fontWeight={800} color="text.primary">{value}</Typography>
        )}
      </Box>
      <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(color, 0.1), color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </Box>
    </Card>
  );
};

const Orders = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [sortFilter, setSortFilter] = useState('newest');
  const [yearFilter, setYearFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [feeRates, setFeeRates] = useState({ gatewayFeeRate: 0, gstRate: 0 });

  useEffect(() => {
    getFeeRates().then(setFeeRates);
  }, []);

  const loadAnalytics = () => {
    setAnalyticsLoading(true);
    shipmentService.getLogisticsAnalytics()
      .then(({ data }) => {
        setAnalytics(data.data || data);
      })
      .catch((err) => {
        console.error("Error loading analytics:", err);
      })
      .finally(() => setAnalyticsLoading(false));
  };

  const load = () => {
    setLoading(true);
    sellerService.getOrders({
      page,
      limit: 15,
      status: statusFilter || undefined,
      sort: sortFilter,
      year: yearFilter || undefined,
      month: monthFilter || undefined,
      date: dateFilter || undefined,
    }).then(({ data }) => {
      setOrders(data.data || []);
      setPagination(data.pagination || {});
    }).finally(() => setLoading(false));
    loadAnalytics();
  };

  useEffect(() => {
    load();
  }, [page, statusFilter, sortFilter, yearFilter, monthFilter, dateFilter]);

  const handleStatusChange = async (itemId, status) => {
    try {
      await sellerService.updateOrderItemStatus(itemId, status);
      dispatch(showToast({ message: 'Status updated.', severity: 'success' }));
      load();
    } catch (err) { dispatch(showToast({ message: err.response?.data?.message || 'Error updating status.', severity: 'error' })); }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Orders</Typography>

      {/* StatCards Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Shipments"
            value={analytics?.totalShipments || 0}
            icon={<TrendingUpIcon />}
            color={theme.palette.primary.main}
            loading={analyticsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Active Shipments"
            value={
              (analytics?.totalShipments || 0) -
              (analytics?.statusBreakdown?.delivered || 0) -
              (analytics?.statusBreakdown?.cancelled || 0) -
              (analytics?.rtoCount || 0)
            }
            icon={<LocalShippingIcon />}
            color={theme.palette.info.main}
            loading={analyticsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Delivered"
            value={analytics?.statusBreakdown?.delivered || 0}
            icon={<CheckCircleOutlineIcon />}
            color={theme.palette.success.main}
            loading={analyticsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Delayed SLA"
            value={analytics?.delayedCount || 0}
            icon={<ScheduleIcon />}
            color={theme.palette.warning.main}
            loading={analyticsLoading}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Failed / RTO"
            value={analytics?.rtoCount || 0}
            icon={<ErrorOutlineIcon />}
            color={theme.palette.error.main}
            loading={analyticsLoading}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'flex-end', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
            sx={{ minWidth: 140, bgcolor: 'action.hover' }}
          >
            <MenuItem value="">All Status</MenuItem>
            {ALLOWED_STATUSES.map((status) => (
              <MenuItem key={status} value={status} sx={{ textTransform: 'capitalize' }}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Select
            value={sortFilter}
            onChange={(e) => {
              setSortFilter(e.target.value);
              setPage(1);
            }}
            sx={{ minWidth: 180, bgcolor: 'action.hover' }}
          >
            <MenuItem value="newest">Newest</MenuItem>
            <MenuItem value="oldest">Oldest</MenuItem>
            <MenuItem value="orderIdAsc">Order ID Increment</MenuItem>
            <MenuItem value="orderIdDesc">Order ID Decrement</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Select
            value={yearFilter}
            onChange={(e) => {
              setYearFilter(e.target.value);
              setMonthFilter('');
              setPage(1);
            }}
            displayEmpty
            sx={{ minWidth: 120, bgcolor: 'action.hover' }}
          >
            <MenuItem value="">All Years</MenuItem>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
              <MenuItem key={year} value={String(year)}>{year}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" disabled={!yearFilter} sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Select
            value={monthFilter}
            onChange={(e) => {
              setMonthFilter(e.target.value);
              setPage(1);
            }}
            displayEmpty
            sx={{ minWidth: 140, bgcolor: 'action.hover' }}
          >
            <MenuItem value="">All Months</MenuItem>
            <MenuItem value="1">January</MenuItem>
            <MenuItem value="2">February</MenuItem>
            <MenuItem value="3">March</MenuItem>
            <MenuItem value="4">April</MenuItem>
            <MenuItem value="5">May</MenuItem>
            <MenuItem value="6">June</MenuItem>
            <MenuItem value="7">July</MenuItem>
            <MenuItem value="8">August</MenuItem>
            <MenuItem value="9">September</MenuItem>
            <MenuItem value="10">October</MenuItem>
            <MenuItem value="11">November</MenuItem>
            <MenuItem value="12">December</MenuItem>
          </Select>
        </FormControl>
        <TextField
          type="date"
          size="small"
          value={dateFilter}
          onChange={(e) => {
            setDateFilter(e.target.value);
            setYearFilter('');
            setMonthFilter('');
            setPage(1);
          }}
          sx={{
            minWidth: 170,
            bgcolor: 'action.hover',
          }}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Box>
      <Card>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow>
                {['Order #', 'Product', 'Customer', 'Qty', 'Amount', 'Date', 'Status', 'View'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(8).fill(0).map((__, j) => <TableCell key={j}><Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1 }} /></TableCell>)}
                  </TableRow>
                ))
                : orders.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">No orders yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )
                  : orders.map((item) => {
                      const shipmentForStatus = item.Order?.shipments?.[0] || item.order?.shipments?.[0] || null;
                      const displayStatus = shipmentForStatus?.status === 'in_transit' ? 'in_transit' : item.status;
                      
                      return (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                         {(item.Order || item.order)?.order_number || `ORD${String(item.id).padStart(5, '0')}`}
                        </Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{item.product?.name}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {(item.Order || item.order)?.user?.name || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2">{item.quantity}</Typography></TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{formatCurrency(item.total_price)}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ whiteSpace: 'nowrap' }}>
                          Net payout {formatCurrency(item.net_payout ?? computeNetAmount(item.total_price, feeRates))}
                        </Typography>
                        {(item.Order || item.order)?.coupon && Number(item.unit_price) * Number(item.quantity) - Number(item.total_price) > 0.01 && (
                           <Typography variant="caption" color="text.secondary" display="block" sx={{ whiteSpace: 'nowrap' }}>
                             {formatCurrency(Number(item.unit_price) * Number(item.quantity))} - {formatCurrency((Number(item.unit_price) * Number(item.quantity)) - Number(item.total_price))} (Coupon)
                           </Typography>
                        )}
                      </TableCell>
                      <TableCell><Typography variant="body2">{formatDate(item.created_at)}</Typography></TableCell>
                      <TableCell><OrderStatusChip status={displayStatus} /></TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedOrder({
                                itemId: item.id,
                                orderNumber: (item.Order || item.order)?.order_number || `ORD${String(item.id).padStart(5, '0')}`,
                                customer: (item.Order || item.order)?.user?.name || '-',
                                product: item.product?.name || '-',
                                quantity: item.quantity,
                                amount: item.total_price,
                                status: displayStatus,
                                createdAt: item.created_at,
                                address: (item.Order || item.order)?.address,
                                rawItem: item
                              });
                              setDialogOpen(true);
                            }}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'action.hover' } }}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )})
              }
            </TableBody>
          </Table>
        </TableContainer>
        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Card>
      <OrderDetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        order={selectedOrder}
        onStatusUpdate={load}
      />
    </Box>
  );
};

export default Orders;
