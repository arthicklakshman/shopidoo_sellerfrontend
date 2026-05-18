import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import socket from '../../services/socket';
import api from '../../services/api';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

const Notifications = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { user } = useSelector((s) => s.auth);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new Event('close-notification-menu'));
  }, []);

  useEffect(() => {
    fetchNotifications();

    const room = `seller_${user?.id}`;
    socket.emit('join', room);

    const handleNewNotification = (data) => {
      if (
        data.type === 'product_status' ||
        data.type === 'support_reply' ||
        data.type === 'payout_status'
      ) {
        setNotifications((prev) => {
          const alreadyExists = prev.some((n) => n.id === data.id);
          if (alreadyExists) return prev;
          return [data, ...prev];
        });
      }
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      socket.off('new_notification', handleNewNotification);
    };
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const sellerTypes = ['product_status', 'support_reply', 'payout_status'];
      const filtered = (res.data.data || []).filter((n) =>
        sellerTypes.includes(n.type)
      );
      setNotifications(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (item) => {
    if (item.is_read) return;
    try {
      await api.patch(`/notifications/${item.id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
      window.dispatchEvent(new CustomEvent('notification-read', { detail: item.id }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClick = async (item) => {
    try {
      if (!item.is_read) {
        await handleMarkAsRead(item);
      }

      const updatedItem = { ...item, is_read: true };
      setSelectedNotification(updatedItem);
      setOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.is_read);
      if (unread.length === 0) return;
      await Promise.all(unread.map((n) => api.patch(`/notifications/${n.id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      unread.forEach((n) =>
        window.dispatchEvent(new CustomEvent('notification-read', { detail: n.id }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedNotification(null);
  };

  const handleNavigate = (item) => {
    handleMarkAsRead(item);
    if (item.type === 'product_status') {
      navigate(`/products?highlight=${item.reference_id}`);
    } else if (item.type === 'support_reply') {
      navigate(`/support?highlight=${item.reference_id}`);
    } else if (item.type === 'payout_status') {
      navigate('/wallet');
    }
  };

  const renderPayoutStatus = () => (
    <>
      <Box sx={{ border: `1px solid ${isDarkMode ? theme.palette.warning.dark : '#ffeeba'}`, bgcolor: isDarkMode ? 'rgba(251, 191, 36, 0.05)' : '#fffdf5', borderRadius: 3, p: 3 }}>
        <Typography fontWeight={700} fontSize={22} mb={2}>💰 Payout Update</Typography>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
          <Typography color="text.secondary" sx={{ fontSize: 16 }}>
            {selectedNotification?.message}
          </Typography>
        </Paper>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button fullWidth variant="outlined" onClick={handleClose} sx={{ py: 1.5, borderRadius: 2 }}>Close</Button>
        <Button fullWidth variant="contained" onClick={() => { handleClose(); navigate('/wallet'); }} sx={{ py: 1.5, borderRadius: 2, bgcolor: '#0b8457', '&:hover': { bgcolor: '#086d48' } }}>Go to Wallet</Button>
      </Box>
    </>
  );

  const renderStatusUpdate = (title, color) => (
    <>
      <Box sx={{ border: `1px solid ${color}${isDarkMode ? '66' : '44'}`, bgcolor: `${color}${isDarkMode ? '15' : '08'}`, borderRadius: 3, p: 3 }}>
        <Typography fontWeight={700} fontSize={22} mb={2}>{title}</Typography>
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: theme.palette.background.paper }}>
          <Typography color="text.secondary">{selectedNotification?.message}</Typography>
        </Paper>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button fullWidth variant="outlined" onClick={handleClose} sx={{ py: 1.5, borderRadius: 2 }}>Close</Button>
        <Button fullWidth variant="contained" onClick={() => handleNavigate(selectedNotification)} sx={{ py: 1.5, borderRadius: 2, bgcolor: '#0b8457', '&:hover': { bgcolor: '#086d48' } }}>View Details</Button>
      </Box>
    </>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Notifications
        </Typography>

        {notifications.some((n) => !n.is_read) && (
          <Button
            variant="contained"
            onClick={handleMarkAllAsRead}
            sx={{
              height: 40,
              px: 2,
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 600,
              background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
              color: '#000',
              boxShadow: 'none',
              '&:hover': {
                background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                color: '#000',
                boxShadow: 'none',
              },
            }}
          >
            Mark all as read
          </Button>
        )}
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography color="text.secondary">Loading notifications...</Typography>
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 10, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>All caught up!</Typography>
            <Typography variant="body2" color="text.secondary">You don't have any notifications at the moment.</Typography>
          </Box>
        ) : (
          notifications.map((item, index) => (
            <Box key={item.id}>
              <Box
                sx={{
                  p: 3,
                  bgcolor: item.is_read ? theme.palette.background.paper : (isDarkMode ? 'rgba(124, 58, 237, 0.08)' : '#f8f9ff'),
                  transition: '0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                  '&:hover': { bgcolor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#f4f6fa' },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography fontWeight={700}>{item.title}</Typography>
                    {!item.is_read && <Chip label="Unread" color="primary" size="small" />}
                  </Box>

                  <Typography color="text.secondary" mb={1}>{item.message}</Typography>

                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.created_at).toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignSelf: 'center' }}>
                  <Tooltip title="View">
                    <IconButton
                      onClick={() => handleNavigate(item)}
                      sx={{
                        width: 42, height: 42, 
                        bgcolor: isDarkMode ? 'rgba(37, 99, 235, 0.15)' : '#f0f4ff', 
                        color: isDarkMode ? '#60a5fa' : '#2563eb', 
                        border: `1px solid ${isDarkMode ? 'rgba(37, 99, 235, 0.3)' : '#dbe4ff'}`,
                        '&:hover': { bgcolor: '#2563eb', color: '#fff' },
                      }}
                    >
                      <VisibilityOutlinedIcon />
                    </IconButton>
                  </Tooltip>

                  {!item.is_read && (
                    <Tooltip title="Mark as read">
                      <IconButton
                        onClick={() => handleMarkAsRead(item)}
                        sx={{
                          width: 42, height: 42, 
                          bgcolor: isDarkMode ? 'rgba(22, 163, 74, 0.15)' : '#ecfdf5', 
                          color: isDarkMode ? '#4ade80' : '#16a34a', 
                          border: `1px solid ${isDarkMode ? 'rgba(22, 163, 74, 0.3)' : '#bbf7d0'}`,
                          '&:hover': { bgcolor: '#16a34a', color: '#fff' },
                        }}
                      >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                  )}

                  <Tooltip title="Details">
                    <IconButton
                      onClick={() => handleClick(item)}
                      sx={{
                        width: 42, height: 42, 
                        bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : '#f6f6f6', 
                        color: theme.palette.text.secondary, 
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { bgcolor: isDarkMode ? '#fff' : '#222', color: isDarkMode ? '#000' : '#fff' },
                      }}
                    >
                      <SupportAgentOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {index !== notifications.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </Paper>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        {selectedNotification && (
          <>
            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography fontWeight={700} fontSize={28}>{selectedNotification.title}</Typography>
                <Typography color="text.secondary" fontSize={14}>
                  {new Date(selectedNotification.created_at).toLocaleString()}
                </Typography>
              </Box>
              <IconButton onClick={handleClose}><CloseIcon /></IconButton>
            </Box>

            <DialogContent sx={{ p: 3 }}>
              {selectedNotification.type === 'payout_status' && renderPayoutStatus()}
              {selectedNotification.type === 'product_status' && renderStatusUpdate('Product Status Update', '#6366f1')}
              {selectedNotification.type === 'support_reply' && renderStatusUpdate('Support Response', '#ff9800')}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
  };

export default Notifications;