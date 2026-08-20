import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Tooltip,
  Paper,
  Divider,
  Alert,
  useTheme,
  Grid
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';
import { returnService } from '../../services/return.service';
import { formatDate } from '../../utils/formatDate';
import { formatCurrency } from '../../utils/formatCurrency';

const STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  picked_up: 'info',
  refunded: 'primary',
  replacement_sent: 'secondary',
  return_requested: 'warning',
  seller_review: 'warning',
  return_approved: 'success',
  return_rejected: 'error',
  awaiting_customer_shipment: 'info',
  customer_shipped: 'info',
  reverse_pickup_scheduled: 'info',
  return_in_transit: 'info',
  received_by_seller: 'success',
  returned_to_seller: 'success',
  inspection_pending: 'warning',
  refund_pending: 'warning',
  refund_processing: 'warning',
  refund_approved: 'success',
  refund_completed: 'primary',
  replacement_dispatched: 'secondary',
};

const STAGE_LABELS = {
  seller_review: 'Seller Review',
  reverse_pickup: 'Reverse Pickup',
  customer_shipment: 'Customer Shipment',
  inspection: 'Inspection',
  refund_processing: 'Refund Processing'
};

const SLA_STATUS_COLORS = {
  active: 'primary',
  paused: 'warning',
  overdue: 'error',
  completed: 'success',
  cancelled: 'default',
};

const getActiveSla = (req) => {
  if (!req.sla_logs || req.sla_logs.length === 0) return null;
  const active = req.sla_logs.find(log => ['active', 'paused', 'overdue'].includes(log.status));
  if (active) return active;
  return req.sla_logs[req.sla_logs.length - 1];
};

const SellerReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', response: '' });
  const dispatch = useDispatch();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState('');
  const [lightboxType, setLightboxType] = useState('image');

  // Inspection & Refund states
  const [inspectionResult, setInspectionResult] = useState('Approve Refund');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [inspectionImages, setInspectionImages] = useState([]);
  const [inspectionVideo, setInspectionVideo] = useState('');
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [metrics, setMetrics] = useState(null);

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingEvidence(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('proof', file);
      const res = await returnService.uploadProof(formData);
      const url = res.data?.data?.url;
      if (url) {
        setInspectionImages(prev => [...prev, url]);
      }
    } catch (err) {
      setErrorMsg('Failed to upload image. Please try again.');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleUploadVideo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingEvidence(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('proof', file);
      const res = await returnService.uploadProof(formData);
      const url = res.data?.data?.url;
      if (url) {
        setInspectionVideo(url);
      }
    } catch (err) {
      setErrorMsg('Failed to upload video. Please try again.');
    } finally {
      setUploadingEvidence(false);
    }
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const fetchReturns = async () => {
    try {
      const res = await returnService.getSellerReturns();
      setReturns(res.data.data || []);
    } catch (err) {
      console.error('Error fetching seller returns:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await returnService.getSellerMetrics();
      setMetrics(res.data?.data || res.data || null);
    } catch (err) {
      console.error('Error fetching seller metrics:', err);
    }
  };

  useEffect(() => {
    fetchReturns();
    fetchMetrics();
  }, []);

  const handleUpdateStatus = async () => {
    setErrorMsg('');

    // Prevent receiving returns without customer tracking data and receipts uploaded (Self Shipping only)
    // Mirrors the backend default in return.service.js#updateReturnStatusSeller: a missing shipment record is treated as platform logistics, not self-ship.
    const isSelfShip = !!selectedReturn.returnShipment && selectedReturn.returnShipment.shippingMode === 'self';
    if (isSelfShip && (statusUpdate.status === 'received_by_seller' || statusUpdate.status === 'inspection_pending')) {
      if (!selectedReturn.return_tracking_number || !selectedReturn.return_receipt_url) {
        const msg = 'Verification Error: Customer must submit a tracking number and courier receipt before you can receive the product.';
        setErrorMsg(msg);
        return;
      }
    }

    try {
      await returnService.updateReturnStatus(selectedReturn.id, {
        status: statusUpdate.status,
        seller_response: statusUpdate.response
      });
      dispatch(showToast({ message: 'Return status updated successfully.', severity: 'success' }));
      setOpenDetail(false);
      fetchReturns();
      fetchMetrics();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status';
      setErrorMsg(msg);
      console.error(err);
    }
  };

  const handleInspectionSubmit = async () => {
    setErrorMsg('');
    try {
      await returnService.submitInspection(selectedReturn.id, {
        result: 'Approve Refund',
        notes: inspectionNotes,
        inspection_images: inspectionImages,
        inspection_video: inspectionVideo
      });
      dispatch(showToast({ message: 'Inspection evidence submitted successfully.', severity: 'success' }));
      setOpenDetail(false);
      fetchReturns();
      fetchMetrics();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit inspection';
      setErrorMsg(msg);
      console.error(err);
    }
  };

  const handleRefundSubmit = async () => {
    setErrorMsg('');
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      const msg = 'Please enter a valid refund amount.';
      setErrorMsg(msg);
      return;
    }
    try {
      await returnService.processRefund(selectedReturn.id, {
        amount: parseFloat(refundAmount)
      });
      dispatch(showToast({ message: 'Refund processed successfully.', severity: 'success' }));
      setOpenDetail(false);
      fetchReturns();
      fetchMetrics();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to process refund';
      setErrorMsg(msg);
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{
          fontSize: { xs: 28, md: 24 }, fontWeight: 500, lineHeight: 1.1,
          color: isDark ? '#FFFFFF' : 'text.primary', mb: 0.6,
        }}>
          Return Requests
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 400 }}>
          Manage and respond to customer return requests for your products.
        </Typography>
      </Box>

      {/* Performance Metrics Panel */}
      {metrics && metrics.enabled !== false && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              p: 2.5,
              borderRadius: 3,
              background: isDark ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#bbf7d0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <Typography variant="caption" fontWeight={700} color={isDark ? 'success.light' : 'success.dark'} sx={{ textTransform: 'uppercase' }}>
                Return Quality Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mt: 1.5 }}>
                <Typography variant="h4" fontWeight={800} color={isDark ? '#fff' : 'success.dark'}>
                  {metrics.sellerReturnScore !== undefined ? Math.round(metrics.sellerReturnScore) : 100}
                </Typography>
                <Typography variant="body2" color="text.secondary">/100</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                {metrics.sellerReturnScore >= 90 ? 'Excellent performance' : metrics.sellerReturnScore >= 75 ? 'Good performance' : 'Action required'}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              p: 2.5,
              borderRadius: 3,
              background: isDark ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #fefafd, #fae8ff)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#f5d0fe',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <Typography variant="caption" fontWeight={700} color={isDark ? 'secondary.light' : 'secondary.dark'} sx={{ textTransform: 'uppercase' }}>
                Response Speed
              </Typography>
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="h5" fontWeight={800}>
                  {metrics.firstResponseTime ? `${metrics.firstResponseTime} hrs` : '0 hrs'}
                </Typography>
                <Typography variant="caption" color="text.secondary">Avg First Response Time</Typography>
              </Box>
              <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 600, color: '#334155' }}>
                Avg Resolution: {metrics.avgResolutionTime ? `${metrics.avgResolutionTime} days` : '0 days'}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              p: 2.5,
              borderRadius: 3,
              background: isDark ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #fffbeb, #fef3c7)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#fde68a',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <Typography variant="caption" fontWeight={700} color={isDark ? 'warning.light' : 'warning.dark'} sx={{ textTransform: 'uppercase' }}>
                Dispute Health
              </Typography>
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="h5" fontWeight={800}>
                  {metrics.disputeRate ? `${metrics.disputeRate}%` : '0%'}
                </Typography>
                <Typography variant="caption" color="text.secondary">Customer Dispute Rate</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Open Disputes: {metrics.openDisputes || 0}
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              p: 2.5,
              borderRadius: 3,
              background: isDark ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.05)' : '#bae6fd',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)' }
            }}>
              <Typography variant="caption" fontWeight={700} color={isDark ? 'info.light' : 'info.dark'} sx={{ textTransform: 'uppercase' }}>
                Activity Overview
              </Typography>
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="h5" fontWeight={800}>
                  {metrics.totalReturns || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">Total Return Requests</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Refund Completion Rate: {metrics.refundApprovalRate ? `${metrics.refundApprovalRate}%` : '0%'}
              </Typography>
            </Card>
          </Grid>
          {metrics.cachedAt && (
            <Grid item xs={12} sx={{ mt: -1.5 }}>
              <Typography variant="caption" color="text.secondary">
                * Metrics cached hourly. Last updated: {formatDate(metrics.cachedAt)}
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      <TableContainer component={Paper} sx={{
        borderRadius: 3,
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.05)',
        overflowX: 'auto'
      }}>
        <Table sx={{ minWidth: 1000 }}>
          <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Return Amount</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>SLA Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Penalty</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 10 }}>
                  <Typography color="text.secondary" variant="body1">No return requests found.</Typography>
                </TableCell>
              </TableRow>
            ) : returns.map((req) => (
              <TableRow key={req.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar variant="rounded" src={req.product?.images?.[0]?.image_url} sx={{
                      width: 45, height: 45,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.100',
                    }}>
                      {req.product?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={700}>{req.product?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">Order: #{req.order?.order_number}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{req.user?.name}</Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    {formatCurrency(
                      typeof req.seller_wallet_amount === 'object'
                        ? req.seller_wallet_amount.netAmount
                        : (req.seller_wallet_amount || req.net_payout || req.orderItem?.total_price || req.order?.total_amount || 0)
                    )}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Net Wallet (Gross: {formatCurrency(req.gross_amount || req.orderItem?.total_price || req.order?.total_amount || 0)})
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight={700} sx={{ textTransform: 'uppercase', color: 'primary.main' }}>
                    {req.return_type || 'refund'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{req.reason}</Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={req.status.toUpperCase().replace(/_/g, ' ')}
                    size="small"
                    color={STATUS_COLORS[req.status] || 'default'}
                    sx={{ fontWeight: 800, borderRadius: 1.5, fontSize: '0.65rem' }}
                  />
                </TableCell>
                <TableCell>
                  {(() => {
                    const activeSla = getActiveSla(req);
                    if (!activeSla) return <Typography variant="caption" color="text.secondary">-</Typography>;
                    const label = `${STAGE_LABELS[activeSla.stage] || activeSla.stage}: ${activeSla.status.toUpperCase()}`;
                    return (
                      <Chip
                        label={label.replace(/_/g, ' ')}
                        size="small"
                        color={SLA_STATUS_COLORS[activeSla.status] || 'default'}
                        sx={{ fontWeight: 700, borderRadius: 1.5, fontSize: '0.65rem' }}
                      />
                    );
                  })()}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {parseFloat(req.total_penalty_amount || 0) > 0
                    ? <Typography variant="body2" fontWeight={700} color="error.main" sx={{ whiteSpace: 'nowrap' }}>
                      {`-₹${parseFloat(req.total_penalty_amount).toFixed(2)}`}
                    </Typography>
                    : <Typography variant="body2" color="text.disabled">—</Typography>
                  }
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{formatDate(req.created_at)}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="View & Respond">
                    <IconButton
                      onClick={() => {
                        setSelectedReturn(req);
                        setStatusUpdate({ status: req.status, response: req.seller_response || '' });
                        setInspectionResult('Approve Refund');
                        setInspectionNotes(req.inspection_notes || '');
                        setInspectionImages([]);
                        setInspectionVideo('');
                        setRefundAmount(req.refund_amount || '');
                        setErrorMsg('');
                        setOpenDetail(true);
                      }}
                      sx={{
                        color: '#0FB9B1',
                        bgcolor: isDark ? 'rgba(15, 185, 177, 0.15)' : 'rgba(15, 185, 177, 0.1)',
                        '&:hover': { bgcolor: '#0FB9B1', color: 'white' },
                      }}
                    >
                      <VisibilityOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="sm" fullWidth scroll="body">
        <DialogTitle sx={{ fontWeight: 800 }}>Return Request Details</DialogTitle>
        <DialogContent dividers>
          {selectedReturn && (
            <Box sx={{ py: 1 }}>
              {errorMsg && (
                <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>
              )}
              <Box sx={{ mb: 2 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>Return Request Information</Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Type</Typography>
                    <Typography variant="body2" fontWeight={700} color="primary" sx={{ textTransform: 'uppercase' }}>
                      {selectedReturn.return_type || 'refund'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" display="block">Current Status</Typography>
                    <Typography variant="body2" fontWeight={700}>{selectedReturn.status.toUpperCase().replace(/_/g, ' ')}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* SLA Information */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>SLA Monitoring</Typography>
                {(!selectedReturn.sla_logs || selectedReturn.sla_logs.length === 0) ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>No SLA tracking history available.</Typography>
                ) : (
                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {selectedReturn.sla_logs.map((log) => {
                      return (
                        <Paper key={log.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderColor: log.status === 'overdue' ? 'error.light' : log.status === 'paused' ? 'warning.light' : 'divider' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" fontWeight={700} color={log.status === 'overdue' ? 'error.main' : 'text.primary'}>
                              {STAGE_LABELS[log.stage] || log.stage}
                            </Typography>
                            <Chip
                              label={log.status.toUpperCase()}
                              size="small"
                              color={SLA_STATUS_COLORS[log.status] || 'default'}
                              sx={{ fontWeight: 800, fontSize: '0.55rem', height: 18 }}
                            />
                          </Box>
                          <Grid container spacing={1}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary" display="block">Started</Typography>
                              <Typography variant="caption" fontWeight={600}>{formatDate(log.startedAt || log.started_at)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="caption" color="text.secondary" display="block">Due Date</Typography>
                              <Typography variant="caption" fontWeight={700} color={log.status === 'overdue' ? 'error.main' : 'text.primary'}>
                                {formatDate(log.dueAt || log.due_at)}
                              </Typography>
                            </Grid>
                          </Grid>
                          {log.pausedAt && (
                            <Typography variant="caption" color="warning.dark" display="block" sx={{ mt: 0.5 }}>
                              Paused: {log.pauseReason} ({formatDate(log.pausedAt)})
                            </Typography>
                          )}
                          {log.completedAt && (
                            <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                              Completed: {formatDate(log.completedAt)}
                            </Typography>
                          )}
                          {log.escalation && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: log.escalation.status === 'open' ? 'error.50' : 'grey.50', borderRadius: 1, border: '1px solid', borderColor: log.escalation.status === 'open' ? 'error.light' : 'divider' }}>
                              <Typography variant="caption" fontWeight={700} color={log.escalation.status === 'open' ? 'error.main' : 'text.secondary'} display="block">
                                Escalation: {log.escalation.status.toUpperCase()} ({log.escalation.priority.toUpperCase()})
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block">
                                Reason: {log.escalation.reason} | Assigned: {log.escalation.assignedRole}
                              </Typography>
                            </Box>
                          )}
                        </Paper>
                      );
                    })}
                  </Box>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>Customer Issue Description</Typography>
                <Paper variant="outlined" sx={{
                  p: 2, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'grey.50', mt: 0.5, borderRadius: 2,
                }}>
                  <Typography variant="body2">{selectedReturn.message}</Typography>
                </Paper>
              </Box>

              {selectedReturn.proof_image && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Image Proof</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setLightboxSrc(selectedReturn.proof_image);
                        setLightboxType('image');
                        setLightboxOpen(true);
                      }}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                        color: '#000',
                        boxShadow: 'none',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                          boxShadow: 'none',
                          opacity: 0.9
                        }
                      }}
                    >
                      🖼️ View Image Proof
                    </Button>
                  </Box>
                </Box>
              )}

              {selectedReturn.proof_video && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Video Proof</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => {
                        setLightboxSrc(selectedReturn.proof_video);
                        setLightboxType('video');
                        setLightboxOpen(true);
                      }}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                        color: '#000',
                        boxShadow: 'none',
                        '&:hover': {
                          background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                          boxShadow: 'none',
                          opacity: 0.9
                        }
                      }}
                    >
                      🎥 View Video Proof
                    </Button>
                  </Box>
                </Box>
              )}

              {/* Customer Manual Courier Details (Self Shipping) */}
              {selectedReturn.return_tracking_number && (
                <Box sx={{ mb: 3, p: 2, border: '1px solid #0FB9B1', borderRadius: '8px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
                    Customer Courier Shipment Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Courier Name</Typography>
                      <Typography variant="body2" fontWeight={700}>{selectedReturn.return_courier_name}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="caption" color="text.secondary" display="block">Tracking Number</Typography>
                      <Typography variant="body2" fontWeight={700}>{selectedReturn.return_tracking_number}</Typography>
                    </Grid>
                    {selectedReturn.customer_notes && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" display="block">Customer Notes</Typography>
                        <Typography variant="body2">{selectedReturn.customer_notes}</Typography>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Button
                        variant="outlined"
                        size="small"
                        component="a"
                        href={selectedReturn.return_receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          textTransform: 'none',
                          borderColor: '#0FB9B1',
                          color: '#0FB9B1',
                          '&:hover': {
                            borderColor: '#0B8457',
                            color: '#0B8457',
                            backgroundColor: 'rgba(15, 185, 177, 0.04)'
                          }
                        }}
                      >
                        View Uploaded Receipt Document
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Return Shipment Details (Platform Logistics) */}
              {selectedReturn.returnShipment && selectedReturn.returnShipment.shippingMode !== 'self' && (
                <Box sx={{ mb: 3, p: 2, border: '1px solid #0FB9B1', borderRadius: '8px', bgcolor: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                  <Typography variant="subtitle2" fontWeight={800} color="primary" sx={{ mb: 1.5 }}>
                    Return Shipment Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary" display="block">Courier Name</Typography>
                      <Typography variant="body2" fontWeight={700}>{selectedReturn.returnShipment.courierName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary" display="block">Reverse AWB</Typography>
                      <Typography variant="body2" fontWeight={700}>{selectedReturn.returnShipment.reverseAwbCode}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="caption" color="text.secondary" display="block">Return Status</Typography>
                      <Typography variant="body2" fontWeight={700}>{selectedReturn.status.toUpperCase().replace(/_/g, ' ')}</Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {errorMsg && (
                <Alert severity="error" sx={{ mb: 2 }}>{errorMsg}</Alert>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Action Forms based on Status */}
              {['refund_approved', 'refund_pending'].includes(selectedReturn.status) ? (
                <Box>
                  <Typography variant="overline" color="primary" fontWeight={800}>Refund Processing</Typography>
                  <Alert severity="info" sx={{ mt: 1, borderRadius: 2 }}>
                    The physical inspection was passed. The financial refund is currently being processed by the Platform Admin. No further action is required from you.
                  </Alert>
                </Box>
              ) : ['inspection_pending', 'received_by_seller', 'returned_to_seller'].includes(selectedReturn.status) ? (
                <Box>
                  <Typography variant="overline" color="primary" fontWeight={800}>Submit Product Inspection Evidence</Typography>
                  <TextField
                    fullWidth
                    label="Inspection Notes"
                    multiline
                    rows={3}
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    margin="normal"
                    placeholder="Describe the physical condition of the returned item..."
                  />
                  <Box sx={{ mt: 2, mb: 1 }}>
                    <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                      Inspection Evidence (Photos & Video)
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          disabled={uploadingEvidence}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#0FB9B1',
                            color: '#0FB9B1',
                            '&:hover': {
                              borderColor: '#0B8457',
                              color: '#0B8457',
                              backgroundColor: 'rgba(15, 185, 177, 0.04)'
                            }
                          }}
                        >
                          Upload Condition Photo
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handleUploadImage}
                          />
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          disabled={uploadingEvidence || !!inspectionVideo}
                          sx={{
                            textTransform: 'none',
                            borderColor: '#0FB9B1',
                            color: '#0FB9B1',
                            '&:hover': {
                              borderColor: '#0B8457',
                              color: '#0B8457',
                              backgroundColor: 'rgba(15, 185, 177, 0.04)'
                            }
                          }}
                        >
                          Upload Condition Video
                          <input
                            type="file"
                            hidden
                            accept="video/*"
                            onChange={handleUploadVideo}
                          />
                        </Button>
                      </Grid>
                    </Grid>

                    {inspectionImages.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Uploaded Photos:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {inspectionImages.map((img, idx) => (
                            <Box key={idx} sx={{ position: 'relative' }}>
                              <img
                                src={img}
                                alt={`evidence-${idx}`}
                                style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
                              />
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {inspectionVideo && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Uploaded Video:
                        </Typography>
                        <Typography variant="body2" color="success.main" sx={{ mt: 0.5 }}>
                          ✓ Video Uploaded: {inspectionVideo.split('/').pop()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleInspectionSubmit}
                    disabled={uploadingEvidence}
                    sx={{
                      mt: 2,
                      fontWeight: 700,
                      background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                      '&:hover': { background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)' }
                    }}
                  >
                    Submit Inspection Evidence
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Typography variant="overline" color="primary" fontWeight={800}>Respond to Request</Typography>
                  <TextField
                    select
                    fullWidth
                    label="Update Request Status"
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                    margin="normal"
                    variant="filled"
                    SelectProps={{
                      MenuProps: {
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left'
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left'
                        }
                      }
                    }}
                  >
                    {selectedReturn.status === 'pending' && (
                      <MenuItem value="approved">Approve Return</MenuItem>
                    )}
                    {selectedReturn.status === 'pending' && (
                      <MenuItem value="rejected">Reject Return</MenuItem>
                    )}

                    {selectedReturn.status === 'customer_shipped' && (
                      <MenuItem value="received_by_seller">Mark as Received</MenuItem>
                    )}
                    {selectedReturn.status === 'reverse_pickup_scheduled' && (
                      <MenuItem value="picked_up">Mark as Picked Up</MenuItem>
                    )}
                    {selectedReturn.status === 'picked_up' && (
                      <MenuItem value="return_in_transit">Mark as In Transit</MenuItem>
                    )}
                    {selectedReturn.status === 'return_in_transit' && (
                      <MenuItem value="returned_to_seller">Mark as Returned</MenuItem>
                    )}

                    {/* Fallback to show current status if no valid transitions are available above */}
                    {!['pending', 'customer_shipped', 'reverse_pickup_scheduled', 'picked_up', 'return_in_transit'].includes(selectedReturn.status) && (
                      <MenuItem value={statusUpdate.status}>
                        {statusUpdate.status === 'approved' ? 'Approve Return' :
                          statusUpdate.status === 'rejected' ? 'Reject Return' :
                            statusUpdate.status.toUpperCase().replace(/_/g, ' ')}
                      </MenuItem>
                    )}
                  </TextField>

                  <TextField
                    fullWidth
                    label="Your Response to Customer"
                    multiline
                    rows={3}
                    value={statusUpdate.response}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, response: e.target.value })}
                    margin="normal"
                    placeholder="Provide details about approval, rejection, or pickup..."
                  />
                  {errorMsg && (
                    <Alert severity="error" onClose={() => setErrorMsg('')} sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}>{errorMsg}</Alert>
                  )}
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleUpdateStatus}
                    sx={{
                      mt: 2,
                      fontWeight: 700,
                      background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                      '&:hover': { background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)' }
                    }}
                  >
                    Update Status
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button
            onClick={() => setOpenDetail(false)}
            sx={{
              fontWeight: 700,
              color: '#0FB9B1',
              '&:hover': { color: '#0B8457' }
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog fullScreen open={lightboxOpen} onClose={() => setLightboxOpen(false)} PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)' } }}>
        <IconButton
          onClick={() => setLightboxOpen(false)}
          sx={{ position: 'absolute', top: 16, right: 16, color: 'white', zIndex: 9999 }}
        >
          <CloseIcon fontSize="large" />
        </IconButton>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
          {lightboxType === 'image' ? (
            <img src={lightboxSrc} alt="Proof Full" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <video src={lightboxSrc} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%' }} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SellerReturns;
