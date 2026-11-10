
import { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import socket, { connectSellerSocket, disconnectSellerSocket } from '../../../services/socket';
import SEO from '../../SEO/SEO';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Badge,
  Chip,
  alpha,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReviewsIcon from '@mui/icons-material/Reviews';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import BarChartIcon from '@mui/icons-material/BarChart';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import StorefrontIcon from '@mui/icons-material/Storefront';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import CampaignIcon from '@mui/icons-material/Campaign';
import CircleIcon from '@mui/icons-material/Circle';
import SettingsIcon from '@mui/icons-material/Settings';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AssignmentReturnIcon from '@mui/icons-material/AssignmentReturn';
import CloseIcon from '@mui/icons-material/Close';
import api from '../../../services/api';
import { toggleTheme } from '../../../features/ui/uiSlice';
import { logoutSeller, fetchMe } from '../../../features/auth/authSlice';
import Toast from '../../common/Toast/Toast';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { label: 'Products', icon: InventoryIcon, path: '/products' },
  { label: 'Reviews', icon: ReviewsIcon, path: '/sellerreviews' },
  { label: 'Orders', icon: ShoppingBagIcon, path: '/orders' },
  { label: 'Returns', icon: AssignmentReturnIcon, path: '/returns' },
  { label: 'Inventory', icon: Inventory2Icon, path: '/inventory' },
  { label: 'Coupons', icon: LocalOfferIcon, path: '/coupons' },
  { label: 'CMS', icon: CampaignIcon, path: '/cms' },
  { label: 'Analytics', icon: BarChartIcon, path: '/analytics' },
  { label: 'Support', icon: SupportAgentIcon, path: '/support' },
  { label: 'Wallet', icon: AccountBalanceWalletIcon, path: '/wallet' },
  { label: 'Profile', icon: PersonIcon, path: '/profile' },
  { label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

const SELLER_SIDEBAR_CONFIG = {
  Products: {
    path: '/products',
    types: ['product_status', 'product_approval'],
  },
  Reviews: {
    path: '/sellerreviews',
    types: ['new_review'],
  },
  Orders: {
    path: '/orders',
    types: ['new_order', 'order_status_update', 'order_delivered', 'shipment_status'],
  },
  Returns: {
    path: '/returns',
    types: ['return_request', 'return_penalty'],
  },
  Inventory: {
    path: '/inventory',
    types: ['low_stock'],
  },
  CMS: {
    path: '/cms',
    types: ['banner_status', 'banner_approval'],
  },
  Support: {
    path: '/support',
    types: ['support_reply'],
  },
  Wallet: {
    path: '/wallet',
    types: ['payout_status', 'wallet_transaction'],
  },
};

const getSellerModuleConfigForPath = (pathname) => {
  return Object.values(SELLER_SIDEBAR_CONFIG).find(
    (cfg) => pathname === cfg.path || pathname.startsWith(`${cfg.path}/`)
  );
};

const SellerLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((s) => s.auth);
  const { themeMode } = useSelector((s) => s.ui);
  const isProductFormPage = location.pathname === '/products/new' || /^\/products\/[^/]+\/edit$/.test(location.pathname);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);
  // Navigating in the same tick as closing the Menu can race with its exit
  // transition/Popper repositioning, leaving a detached menu paper stuck on
  // screen. Deferring the navigate() to the Menu's onExited avoids that.
  const pendingNavigationRef = useRef(null);

  const getBadgeCount = (label) => {
    const config = SELLER_SIDEBAR_CONFIG[label];
    if (!config) return 0;

    // Filter unseen & unread notifications matching this module
    const matching = notifications.filter(
      (n) => !n.is_seen && !n.is_read && config.types.includes(n.type)
    );

    // Count each activity only once (deduplicate by reference_id or notification id)
    const seenActivities = new Set();
    matching.forEach((n) => {
      const key = n.reference_id != null ? `ref_${n.reference_id}` : `id_${n.id}`;
      seenActivities.add(key);
    });

    return seenActivities.size;
  };

  const markModuleAsSeen = async (configOrTypes) => {
    const types = Array.isArray(configOrTypes)
      ? configOrTypes
      : configOrTypes?.types;
    if (!types || types.length === 0) return;

    // Immediately mark matching notifications as seen in local state
    setNotifications((prev) =>
      prev.map((n) =>
        types.includes(n.type) ? { ...n, is_seen: true } : n
      )
    );

    // Persist seen state to backend
    try {
      await api.patch('/notifications/seen', { types });
    } catch (err) {
      console.error('Failed to mark notifications as seen', err);
    }
  };

  // Automatically mark module notifications as seen when entering its page
  useEffect(() => {
    const config = getSellerModuleConfigForPath(location.pathname);
    if (config) {
      markModuleAsSeen(config);
    }
  }, [location.pathname]);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    fetchNotifications();
    connectSellerSocket();

    const joinRoom = () => {
      if (user?.id) {
        console.log('JOINING SELLER ROOM', `seller_${user.id}`);
        socket.emit('join', `seller_${user.id}`, {
          id: user.id,
          name: user.storeName || user.businessName || user.name || 'Seller Store',
        });
      }
    };

    if (socket.connected) {
      joinRoom();
    }

    const handleConnect = () => {
      joinRoom();
      fetchNotifications();
    };

    socket.on('connect', handleConnect);

    const handleNewNotification = (data) => {
      if (!data) return;
      // Strict seller data isolation: do not accept notifications for another seller
      if (data.user_id != null && user?.id && String(data.user_id) !== String(user.id)) {
        return;
      }
      console.log('SELLER NEW NOTIFICATION', data);
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === data.id);
        if (exists) return prev;
        return [data, ...prev];
      });
    };

    const handleSidebarSeen = (data) => {
      if (data?.all) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_seen: true })));
      } else if (data?.id) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === data.id ? { ...n, is_seen: true, is_read: true } : n))
        );
      } else if (data?.types && Array.isArray(data.types)) {
        setNotifications((prev) =>
          prev.map((n) =>
            data.types.includes(n.type) ? { ...n, is_seen: true } : n
          )
        );
      }
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('sidebar:notification:new', handleNewNotification);
    socket.on('sidebar_notifications_seen', handleSidebarSeen);
    socket.on('sidebar:notification:read', handleSidebarSeen);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('new_notification', handleNewNotification);
      socket.off('sidebar:notification:new', handleNewNotification);
      socket.off('sidebar_notifications_seen', handleSidebarSeen);
      socket.off('sidebar:notification:read', handleSidebarSeen);
    };
  }, [user?.id, user?.storeName, user?.name]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleNotificationRead = (e) => {
      const id = e.detail;
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    };

    window.addEventListener('notification-read', handleNotificationRead);
    return () => {
      window.removeEventListener('notification-read', handleNotificationRead);
    };
  }, []);

  useEffect(() => {
    const closeMenu = () => {
      setNotificationAnchor(null);
    };

    window.addEventListener('close-notification-menu', closeMenu);
    return () => {
      window.removeEventListener('close-notification-menu', closeMenu);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const data = res.data?.data || [];
      setNotifications(data);

      const currentConfig = getSellerModuleConfigForPath(location.pathname);
      if (currentConfig) {
        const hasUnseen = data.some(
          (n) => !n.is_seen && !n.is_read && currentConfig.types.includes(n.type)
        );
        if (hasUnseen) {
          markModuleAsSeen(currentConfig);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleOpenNotifications = (event) => {
    if (notificationAnchor) {
      setNotificationAnchor(null);
      return;
    }
    setNotificationAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationAnchor(null);
  };

  const handleNotificationClick = async (item) => {
    try {
      if (!item.is_read) {
        await api.patch(`/notifications/${item.id}/read`);
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === item.id
            ? {
              ...n,
              is_read: true,
            }
            : n
        )
      );

      if (
        item.type === 'product_status' ||
        item.type === 'product_approval'
      ) {
        navigate(`/products?highlight=${item.reference_id}`);
      }

      if (item.type === 'support_reply') {
        navigate(`/support?highlight=${item.reference_id}`);
      }

      if (item.type === 'payout_status' || item.type === 'wallet_transaction') {
        navigate('/wallet');
      }

      if (
        item.type === 'new_order' ||
        item.type === 'order_delivered' ||
        item.type === 'shipment_status' ||
        item.type === 'order_status_update'
      ) {
        navigate('/orders');
      }

      if (item.type === 'new_review') {
        navigate('/sellerreviews');
      }

      if (item.type === 'return_penalty' || item.type === 'return_request') {
        navigate('/returns');
      }

      if (item.type === 'low_stock') {
        navigate('/inventory');
      }

      if (item.type === 'banner_status' || item.type === 'banner_approval') {
        navigate('/cms');
      }

      handleCloseNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    disconnectSellerSocket();
    await dispatch(logoutSeller());
    navigate('/login');
  };

  const renderDrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box 
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box
          onClick={() => navigate('/login')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', '&:hover': { opacity: 0.85 } }}
        >
          <Avatar
            sx={{
              background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
              width: 36,
              height: 36,
            }}
          >
            <StorefrontIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={800}
              sx={{
                background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Shopidoo
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Seller Panel
            </Typography>
          </Box>
        </Box>

        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Divider />

      <List sx={{ flex: 1, pt: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <ListItem key={path} disablePadding>
              <ListItemButton
                onClick={() => {
                  const config = SELLER_SIDEBAR_CONFIG[label];
                  if (config) {
                    markModuleAsSeen(config);
                  }
                  if (isMobile) {
                    setMobileOpen(false);
                    setTimeout(() => {
                      navigate(path);
                    }, 250);
                  } else {
                    navigate(path);
                  }
                }}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  background: active
                    ? 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)'
                    : 'transparent',
                  color: active ? '#000' : 'text.primary',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                    color: '#000',
                  },
                  '& .MuiListItemIcon-root': {
                    color: active ? '#000' : 'text.secondary',
                  },
                  '&:hover .MuiListItemIcon-root': {
                    color: '#000',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  <Icon fontSize="small" />
                </ListItemIcon>

                <ListItemText
                  primary={label}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 500,
                    fontSize: 14,
                  }}
                />

                {getBadgeCount(label) > 0 && (
                  <Chip
                    label={getBadgeCount(label) > 99 ? '99+' : getBadgeCount(label)}
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      bgcolor: '#ef4444',
                      color: '#ffffff',
                      borderRadius: '10px',
                      ml: 1,
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                      '& .MuiChip-label': {
                        px: 0.8,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>


      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            src={user?.avatar}
            sx={{
              width: 36,
              height: 36,
              background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user?.name}
            </Typography>

            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              Seller ID: {user?.seller_id || `S${String(user?.id).padStart(5, '0')}`}
            </Typography>

            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        width: '100%',
        bgcolor: 'background.default',
      }}
    >
      <SEO title="Seller Dashboard" noIndex={true} />
      <Box
        component="nav"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          disableScrollLock
          sx={{
            display: { xs: 'block', md: 'none' },
            zIndex: (theme) => theme.zIndex.modal + 10,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {renderDrawerContent()}
        </Drawer>
        
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {renderDrawerContent()}
        </Drawer>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <AppBar
          position={isProductFormPage ? 'sticky' : 'static'}
          elevation={0}
          sx={{
            top: 0,
            zIndex: (theme) => ({
              xs: theme.zIndex.appBar,
              md: theme.zIndex.drawer + 1,
            }),
            bgcolor: 'background.paper',
            color: 'text.primary',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar>
            {isMobile && (
              <IconButton
                onClick={() => setMobileOpen(true)}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
              {NAV_ITEMS.find((i) => i.path === location.pathname)?.label ||
                'Seller Panel'}
            </Typography>

            <Tooltip title="Toggle theme">
              <IconButton
                onClick={() => dispatch(toggleTheme())}
                size="small"
              >
                {themeMode === 'dark' ? (
                  <LightModeIcon />
                ) : (
                  <DarkModeIcon />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Notifications">
              <Box
                onClick={handleOpenNotifications}
                sx={{ display: 'flex', alignItems: 'center', height: '100%', cursor: 'pointer', ml: 1 }}
              >
                <IconButton component="span" size="small">
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsNoneIcon />
                  </Badge>
                </IconButton>
              </Box>
            </Tooltip>

            <Menu
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleCloseNotifications}
              keepMounted={false}
              disableScrollLock={true}
              marginThreshold={0}
              TransitionProps={{
                onExited: () => {
                  if (pendingNavigationRef.current) {
                    navigate(pendingNavigationRef.current);
                    pendingNavigationRef.current = null;
                  }
                },
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  width: 360,
                  maxWidth: '95vw',
                  borderRadius: 3,
                  overflow: 'hidden',
                },
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box>
                  <Typography fontWeight={700} color="text.primary">Notifications</Typography>

                  <Typography variant="caption" color="text.secondary">
                    {unreadCount} unread
                  </Typography>
                </Box>

                {unreadCount > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                    onClick={async () => {
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
                    }}
                  >
                    Mark all as read
                  </Typography>
                )}
              </Box>

              <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No notifications
                    </Typography>
                  </Box>
                ) : (
                  notifications.map((item) => (
                    <Box
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      sx={{
                        px: 2,
                        py: 1.5,
                        cursor: 'pointer',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        bgcolor: item.is_read ? 'background.paper' : alpha(theme.palette.success.main, 0.05),
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {!item.is_read && (
                          <CircleIcon
                            sx={{
                              fontSize: 10,
                              color: '#0FB9B1',
                              mt: 0.7,
                            }}
                          />
                        )}

                        <Box sx={{ flex: 1 }}>
                          <Typography fontWeight={700} fontSize={14}>
                            {item.title}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: 13,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {item.message}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {new Date(item.created_at).toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>

              <Box
                onClick={() => {
                  pendingNavigationRef.current = '/notifications';
                  handleCloseNotifications();
                }}
                sx={{
                  py: 1.5,
                  textAlign: 'center',
                  background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 800,
                  cursor: 'pointer',
                  borderTop: `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                View All Notifications
              </Box>
            </Menu>

            <Tooltip title="Account">
              <Box
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '100%',
                  gap: 1.5,
                  ml: 2,
                  cursor: 'pointer',
                  p: 0.5,
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  }
                }}
              >
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 36,
                    height: 36,
                    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      color: 'text.primary',
                      lineHeight: 1.2,
                    }}
                  >
                    {user?.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      mt: 0.2,
                      fontSize: '11px',
                    }}
                  >
                    Seller ID: {user?.seller_id || `S${String(user?.id).padStart(5, '0')}`}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{
                horizontal: 'right',
                vertical: 'top',
              }}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
              disableScrollLock={true}
              marginThreshold={0}
              PaperProps={{
                elevation: 4,
                sx: {
                  minWidth: 200,
                  borderRadius: 2,
                },
              }}
            >
              {/* Profile Dropdown Header matching user screenshot */}
              <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 36,
                    height: 36,
                    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    noWrap
                    sx={{
                      color: 'text.primary',
                      fontSize: 14,
                    }}
                  >
                    {user?.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.2 }}>
                    Seller ID: {user?.seller_id || `S${String(user?.id).padStart(5, '0')}`}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 0.5 }} />

              <MenuItem
                onClick={() => {
                  setAnchorEl(null);
                  navigate('/profile');
                }}
              >
                Profile
              </MenuItem>

              <Divider />

              <MenuItem
                onClick={handleLogout}
                sx={{ color: 'error.main' }}
              >
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            p: { xs: 2, md: 3 },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' }
          }}
        >
          <Outlet />
        </Box>
      </Box>

      <Toast />
    </Box>
  );
};

export default SellerLayout;
