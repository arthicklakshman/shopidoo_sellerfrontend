import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import socket from '../../services/socket';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';

import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

const Notifications = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  // useEffect(() => {
  //   fetchNotifications();
  // }, []);

  // Socket
  
  useEffect(() => {
  fetchNotifications();

  const handleNewNotification = (data) => {
    if (
      data.type === 'product_status' ||
      data.type === 'support_reply'
    ) {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === data.id);

        if (exists) return prev;

        return [data, ...prev];
      });
    }
  };

  socket.on('new_notification', handleNewNotification);

  return () => {
    socket.off('new_notification', handleNewNotification);
  };
}, []);

//   const fetchNotifications = async () => {
//     try {
//       const res = await api.get('/notifications');
//       setNotifications(res.data.data || []);
//     } catch (err) {
//       console.error(err);
//     }
//   };
    const fetchNotifications = async () => {
  try {
    const res = await api.get('/notifications');

    const onlyProductNotifications = (res.data.data || []).filter(
      (item) =>
       item.type === 'product_status' ||
       item.type === 'support_reply'
    );

    setNotifications(onlyProductNotifications);
  } catch (err) {
    console.error(err);
  }
};
  const handleMarkAllRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.is_read)
          .map((n) => api.patch(`/notifications/${n.id}/read`))
      );

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          is_read: true,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpen = async (item) => {
    try {
      if (!item.is_read) {
        await api.patch(`/notifications/${item.id}/read`);
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id
            ? { ...n, is_read: true }
            : n
        )
      );

      if (item.type === 'support_reply') {
        navigate(`/support?highlight=${item.reference_id}`);
      } else {
        navigate(`/products?highlight=${item.reference_id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Notifications
          </Typography>

          <Typography color="text.secondary" mt={0.5}>
            {unreadCount} unread notifications
          </Typography>
        </Box>

        {unreadCount > 0 && (
          <Button
            variant="contained"
            onClick={handleMarkAllRead}
            sx={{
              bgcolor: 'rgb(76, 175, 80)',
              '&:hover': {
                bgcolor: 'rgb(67, 160, 71)',
              },
            }}
          >
            Mark All as Read
          </Button>
        )}
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {notifications.length === 0 ? (
          <Box sx={{ p: 5, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications found
            </Typography>
          </Box>
        ) : (
          notifications.map((item, index) => (
            <Box key={item.id}>
              <Box
                sx={{
                  p: 3,
                  bgcolor: item.is_read ? '#fff' : '#f5fff5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2,
                  '&:hover': {
                    bgcolor: '#eef7ee',
                  },
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography fontWeight={700}>
                      {item.title}
                    </Typography>

                    {!item.is_read && (
                      <Chip
                        label="Unread"
                        size="small"
                        sx={{
                          bgcolor: 'rgb(76, 175, 80)',
                          color: '#fff',
                        }}
                      />
                    )}
                  </Box>

                  <Typography color="text.secondary" mb={1}>
                    {item.message}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {new Date(item.created_at).toLocaleString()}
                  </Typography>
                </Box>

                <Tooltip title="Open">
                  <IconButton
                    onClick={() => handleOpen(item)}
                    sx={{
                      bgcolor: '#eef7ee',
                      color: 'rgb(76, 175, 80)',
                      '&:hover': {
                        bgcolor: 'rgb(76, 175, 80)',
                        color: '#fff',
                      },
                    }}
                  >
                    <VisibilityOutlinedIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {index !== notifications.length - 1 && <Divider />}
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
};

export default Notifications;