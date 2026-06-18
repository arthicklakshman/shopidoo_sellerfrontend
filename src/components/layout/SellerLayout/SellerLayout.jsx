import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import socket from '../../../services/socket';
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

const SellerLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((s) => s.auth);
  const { themeMode } = useSelector((s) => s.ui);
  const isProductFormPage =
    location.pathname === '/products/new' ||
    /^\/products\/[^/]+\/edit$/.test(location.pathname);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [notificationAnchor, setNotificationAnchor] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  useEffect(() => {
    fetchNotifications();

    socket.emit('join', `seller_${user?.id}`, {
      id: user?.id,
      name: user?.storeName || user?.businessName || user?.name || 'Seller Store',
    });

    const handleNewNotification = (data) => {
      console.log('SELLER NEW NOTIFICATION', data);

      if (
        data.type === 'product_status' ||
        data.type === 'support_reply' ||
        data.type === 'payout_status' ||
        data.type === 'new_order' ||
        data.type === 'new_review' ||
        data.type === 'low_stock'
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
  }, [user?.id]);

  useEffect(() => {
    if (notificationAnchor) {
      setNotificationAnchor(null);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleNotificationRead = (e) => {
      const id = e.detail;
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
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

      const onlyProductNotifications = (res.data.data || []).filter(
        (item) =>
          item.type === 'product_status' ||
          item.type === 'support_reply' ||
          item.type === 'payout_status' ||
          item.type === 'new_order' ||
          item.type === 'new_review' ||
          item.type === 'low_stock'
      );

      setNotifications(onlyProductNotifications);
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

      if (item.type === 'product_status' || item.type === 'product_approval') {
        navigate(`/products?highlight=${item.reference_id}`);
      }

      if (item.type === 'support_reply') {
        navigate(`/support?highlight=${item.reference_id}`);
      }

      if (item.type === 'payout_status') {
        navigate('/wallet');
      }

      if (item.type === 'new_order') {
        navigate('/orders');
      }

      if (item.type === 'new_review') {
        navigate('/sellerreviews');
      }

      handleCloseNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    setAnchorEl(null);
    await dispatch(logoutSeller());
    navigate('/login');
  };

  const DrawerContent = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
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

      <Divider />

      <List sx={{ flex: 1, pt: 1 }}>
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active = location.pathname === path;
          return (
            <ListItem key={path} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(path);
                  if (isMobile) setMobileOpen(false);
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
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Box
        component="nav"
        sx={{
          width: { md: DRAWER_WIDTH },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <DrawerContent />
        </Drawer>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: isProductFormPage ? 'visible' : 'hidden',
        }}
      >
        <AppBar
          position={isProductFormPage ? 'sticky' : 'fixed'}
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            ml: { md: `${DRAWER_WIDTH}px` },
            top: 0,
            zIndex: theme.zIndex.drawer + 1,
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
              <IconButton
                size="small"
                onClick={handleOpenNotifications}
                sx={{ ml: 1 }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsNoneIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              key={location.pathname}
              anchorEl={notificationAnchor}
              open={Boolean(notificationAnchor)}
              onClose={handleCloseNotifications}
              keepMounted={false}
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
                  mt: 1,
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
                  handleCloseNotifications();
                  navigate('/notifications');
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
              PaperProps={{
                elevation: 4,
                sx: {
                  minWidth: 200,
                  mt: 1,
                  borderRadius: 2,
                },
              }}
            >
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
            overflow: isProductFormPage ? 'visible' : 'auto',
            p: { xs: 2, md: 3 },
            pt: { xs: '72px !important', md: '88px !important' },
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