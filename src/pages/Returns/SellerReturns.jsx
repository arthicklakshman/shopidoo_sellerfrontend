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
  useTheme
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { returnService } from '../../services/return.service';
import { formatDate } from '../../utils/formatDate';

const STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  picked_up: 'info',
  refunded: 'primary',
  replacement_sent: 'secondary'
};

const SellerReturns = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [openDetail, setOpenDetail] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', response: '' });
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

  useEffect(() => {
    fetchReturns();
  }, []);

  const handleUpdateStatus = async () => {
    try {
      await returnService.updateReturnStatus(selectedReturn.id, {
        status: statusUpdate.status,
        seller_response: statusUpdate.response
      });
      setOpenDetail(false);
      fetchReturns();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: { xs: 28, md: 24 }, fontWeight: 500, lineHeight: 1.1, color: isDark ? '#FFFFFF' : 'text.primary', mb: 0.6 }}>
          Return Requests
        </Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary', fontWeight: 400 }}>
          Manage and respond to customer return requests for your products.
        </Typography>
      </Box>
      
      <TableContainer component={Paper} sx={{ 
        borderRadius: 3, 
        boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.05)', 
        overflow: 'hidden' 
      }}>
        <Table>
          <TableHead sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'grey.50' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Reason</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {returns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 10 }}>
                  <Typography color="text.secondary" variant="body1">No return requests found.</Typography>
                </TableCell>
              </TableRow>
            ) : returns.map((req) => (
              <TableRow key={req.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar variant="rounded" src={req.product?.images?.[0]?.image_url} sx={{ 
                      width: 45, 
                      height: 45, 
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'grey.100' 
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
                  <Typography variant="body2">{req.reason}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={req.status.toUpperCase()} 
                    size="small" 
                    color={STATUS_COLORS[req.status]} 
                    sx={{ fontWeight: 800, borderRadius: 1.5, fontSize: '0.65rem' }}
                  />
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
                        setOpenDetail(true);
                      }}
                      sx={{ 
                        color: '#0FB9B1',
                        bgcolor: isDark ? 'rgba(15, 185, 177, 0.15)' : 'rgba(15, 185, 177, 0.1)',
                        '&:hover': { bgcolor: '#0FB9B1', color: 'white' }
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700}>Customer Issue Description</Typography>
                <Paper variant="outlined" sx={{ 
                  p: 2, 
                  bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'grey.50', 
                  mt: 0.5, 
                  borderRadius: 2 
                }}>
                  <Typography variant="body2">{selectedReturn.message}</Typography>
                </Paper>
              </Box>

              {selectedReturn.proof_image && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={700}>Customer Uploaded Proof</Typography>
                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <img 
                      src={selectedReturn.proof_image} 
                      alt="Proof" 
                      style={{ maxWidth: '100%', borderRadius: 12, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} 
                    />
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="overline" color="primary" fontWeight={800}>Respond to Request</Typography>
              <TextField
                select
                fullWidth
                label="Update Request Status"
                value={statusUpdate.status}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                margin="normal"
                variant="filled"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="picked_up">Item Picked Up</MenuItem>
                <MenuItem value="replacement_sent">Replacement Dispatched</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Your Response to Customer"
                multiline
                rows={4}
                value={statusUpdate.response}
                onChange={(e) => setStatusUpdate({ ...statusUpdate, response: e.target.value })}
                margin="normal"
                placeholder="Provide details about the pickup or replacement process..."
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Note: Refunds are typically processed by the platform administrator.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenDetail(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleUpdateStatus} 
            sx={{ 
              fontWeight: 700, 
              px: 4,
              background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
              '&:hover': { background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)' }
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SellerReturns;
