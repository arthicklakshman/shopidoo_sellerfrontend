import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Drawer } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PaymentsIcon from '@mui/icons-material/Payments';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ReviewsIcon from '@mui/icons-material/Reviews';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DescriptionIcon from '@mui/icons-material/Description';
import SettingsIcon from '@mui/icons-material/Settings';

const DRAWER_WIDTH = 240;

const NAV_ITEMS = [
  { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
  { label: 'Products', icon: Inventory2Icon, path: '/products' },
  { label: 'Orders', icon: ShoppingCartIcon, path: '/orders' },
  { label: 'Inventory', icon: Inventory2Icon, path: '/inventory' },
  { label: 'Payments', icon: PaymentsIcon, path: '/payments' },
  { label: 'Offers', icon: LocalOfferIcon, path: '/coupons' },
  { label: 'Reviews', icon: ReviewsIcon, path: '/reviews' },
  { label: 'Support', icon: SupportAgentIcon, path: '/support' },
  { label: 'CMS', icon: DescriptionIcon, path: '/cms' },
  { label: 'Settings', icon: SettingsIcon, path: '/settings' },
];

const SellerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box sx={{ display: 'flex' }}>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? 70 : DRAWER_WIDTH,
          '& .MuiDrawer-paper': {
            width: collapsed ? 70 : DRAWER_WIDTH,
            transition: '0.3s',
          }
        }}
      >
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          navItems={NAV_ITEMS}
        />
      </Drawer>

      {/* Main */}
      <Box sx={{ flex: 1 }}>
        <Header />

        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>

    </Box>
  );
};

export default SellerLayout;




// import { useState } from 'react';
// import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// import {
//   Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
//   AppBar, Toolbar, Typography, IconButton, Divider, InputBase, Badge
// } from '@mui/material';

// import DashboardIcon from '@mui/icons-material/Dashboard';
// import Inventory2Icon from '@mui/icons-material/Inventory2';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
// import PaymentsIcon from '@mui/icons-material/Payments';
// import LocalOfferIcon from '@mui/icons-material/LocalOffer';
// import ReviewsIcon from '@mui/icons-material/Reviews';
// import SupportAgentIcon from '@mui/icons-material/SupportAgent';
// import DescriptionIcon from '@mui/icons-material/Description';
// import SettingsIcon from '@mui/icons-material/Settings';
// import NotificationsIcon from '@mui/icons-material/Notifications';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import StorefrontIcon from '@mui/icons-material/Storefront';
// import SearchIcon from '@mui/icons-material/Search';
// import PersonIcon from '@mui/icons-material/Person';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// const DRAWER_WIDTH = 240;

// const NAV_ITEMS = [
//   { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
//   { label: 'Products', icon: Inventory2Icon, path: '/products' },
//   { label: 'Orders', icon: ShoppingCartIcon, path: '/orders' },
//   { label: 'Inventory', icon: Inventory2Icon, path: '/inventory' },
//   { label: 'Payments', icon: PaymentsIcon, path: '/payments' },
//   { label: 'Offers', icon: LocalOfferIcon, path: '/offers' },
//   { label: 'Reviews', icon: ReviewsIcon, path: '/reviews' },
//   { label: 'Support', icon: SupportAgentIcon, path: '/support' },
//   { label: 'CMS', icon: DescriptionIcon, path: '/cms' },
//   { label: 'Settings', icon: SettingsIcon, path: '/settings' },
// ];

// const SellerLayout = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [collapsed, setCollapsed] = useState(false);

//   const DrawerContent = () => (
//   <Box
//   sx={{
//     height: '100%',
//     display: 'flex',
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     overflow: 'hidden' // 🔥 no scroll at all
//   }}
// >
    
//     {/* TOP */}
//     <Box>
//       <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
//         <StorefrontIcon color="success" />
//         {!collapsed && (
//           <Box>
//             <Typography fontWeight={800}>My Store</Typography>
//             <Typography variant="caption">Seller Panel</Typography>
//           </Box>
//         )}
//       </Box>

//       <Divider />

//       <List>
//         {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
//           const active = location.pathname === path;

//           return (
//             <ListItem key={path} disablePadding>
//               <ListItemButton
//                 onClick={() => navigate(path)}
//                 sx={{
//                   mx: 1,
//                   borderRadius: 2,
//                   bgcolor: active ? '#4CAF50' : 'transparent',
//                   color: active ? '#fff' : '#555',
//                   '&:hover': {
//                     bgcolor: active ? '#4CAF50' : '#f5f5f5'
//                   }
//                 }}
//               >
//                 <ListItemIcon sx={{ color: active ? '#fff' : '#777' }}>
//                   <Icon />
//                 </ListItemIcon>
//                 {!collapsed && <ListItemText primary={label} />}
//               </ListItemButton>
//             </ListItem>
//           );
//         })}
//       </List>
//     </Box>

//     {/* 🔽 BOTTOM COLLAPSE BUTTON */}
//    <Box
//   sx={{
//     p: 1,
//     display: 'flex',
//     justifyContent: 'center',
//     bgcolor: 'transparent', 
//     borderTop: '1px solid #eee'
//   }}
// >
//      <IconButton
//   disableRipple
//   onClick={() => setCollapsed(!collapsed)}
//   sx={{
//     bgcolor: 'transparent',
//     '&:hover': {
//       bgcolor: '#f5f5f5'
//     }
//   }}
// >
//         {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
//       </IconButton>
//     </Box>
//   </Box>
// );

//   return (
//     <Box sx={{ display: 'flex' }}>

//       {/* Sidebar */}
//       <Drawer
//         variant="permanent"
//         sx={{
//           width: collapsed ? 70 : DRAWER_WIDTH,
//           '& .MuiDrawer-paper': {
//             width: collapsed ? 70 : DRAWER_WIDTH,
//             transition: '0.3s',
//           }
//         }}
//       >
//         <DrawerContent />
//       </Drawer>

//       {/* Main */}
//       <Box sx={{ flex: 1 }}>

//         {/* Top Bar */}
//        <AppBar
//   position="static"
//   sx={{
//     bgcolor: '#fff',
//     color: '#000',
//     boxShadow: 'none',
//     borderBottom: '1px solid #ddd'
//   }}
// >
//   <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>

//     {/* 🔍 Search Bar (50% width) */}
//     <Box
//       sx={{
//         display: 'flex',
//         alignItems: 'center',
//         gap: 1,
//         width: '50%',   // 🔥 reduced size
//         bgcolor: '#f5f5f5',
//         px: 2,
//         py: 0.5,
//         borderRadius: 2
//       }}
//     >
//       <SearchIcon sx={{ color: '#777' }} />
//       <InputBase placeholder="Search orders, products..." fullWidth />
//     </Box>

//     {/* RIGHT SIDE */}
//     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

//       {/* 🔔 Notification */}
//       <IconButton
//         sx={{
//           borderRadius: 2,
//           '&:hover': {
//             bgcolor: '#4CAF50',
//             color: '#fff'
//           }
//         }}
//       >
//         <Badge badgeContent={3} color="error">
//           <NotificationsIcon />
//         </Badge>
//       </IconButton>

//       {/* 👤 User Info */}
//       <Box
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: 1,
//           px: 1.5,
//           py: 0.5,
//           borderRadius: 2,
//           cursor: 'pointer',
//           transition: '0.2s',
//           '&:hover': {
//             bgcolor: '#4CAF50',
//             color: '#fff',
//             '& .MuiTypography-root': {
//               color: '#fff'
//             },
//             '& svg': {
//               color: '#fff'
//             }
//           }
//         }}
//       >
//         <PersonIcon />
//         <Box>
//           <Typography fontSize={14}>John Doe</Typography>
//           <Typography variant="caption">Seller ID: #54321</Typography>
//         </Box>
//       </Box>

//     </Box>
//   </Toolbar>
// </AppBar>

//         {/* Page Content */}
//         <Box sx={{ p: 3 }}>
//           <Outlet />
//         </Box>

//       </Box>
//     </Box>
//   );
// };

// export default SellerLayout;





// // import { useState } from 'react';
// // import { Outlet, useNavigate, useLocation } from 'react-router-dom';
// // import { useDispatch, useSelector } from 'react-redux';
// // import {
// //   Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton,
// //   AppBar, Toolbar, Typography, IconButton, Avatar, Divider, Tooltip,
// //   useTheme, useMediaQuery, Menu, MenuItem, Badge,
// // } from '@mui/material';
// // import DashboardIcon from '@mui/icons-material/Dashboard';
// // import InventoryIcon from '@mui/icons-material/Inventory';
// // import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
// // import BarChartIcon from '@mui/icons-material/BarChart';
// // import PersonIcon from '@mui/icons-material/Person';
// // import MenuIcon from '@mui/icons-material/Menu';
// // import LogoutIcon from '@mui/icons-material/Logout';
// // import DarkModeIcon from '@mui/icons-material/DarkMode';
// // import LightModeIcon from '@mui/icons-material/LightMode';
// // import StorefrontIcon from '@mui/icons-material/Storefront';
// // import { toggleTheme } from '../../../features/ui/uiSlice';
// // import { logoutSeller } from '../../../features/auth/authSlice';
// // import Toast from '../../common/Toast/Toast';

// // const DRAWER_WIDTH = 240;

// // const NAV_ITEMS = [
// //   { label: 'Dashboard', icon: DashboardIcon, path: '/dashboard' },
// //   { label: 'Products', icon: InventoryIcon, path: '/products' },
// //   { label: 'Orders', icon: ShoppingBagIcon, path: '/orders' },
// //   { label: 'Analytics', icon: BarChartIcon, path: '/analytics' },
// //   { label: 'Profile', icon: PersonIcon, path: '/profile' },
// // ];

// // const SellerLayout = () => {
// //   const theme = useTheme();
// //   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const dispatch = useDispatch();
// //   const { user } = useSelector((s) => s.auth);
// //   const { themeMode } = useSelector((s) => s.ui);
// //   const [mobileOpen, setMobileOpen] = useState(false);
// //   const [anchorEl, setAnchorEl] = useState(null);

// //   const handleLogout = async () => {
// //     setAnchorEl(null);
// //     await dispatch(logoutSeller());
// //     navigate('/login');
// //   };

// //   const DrawerContent = () => (
// //     <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
// //       <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
// //         <StorefrontIcon color="primary" />
// //         <Box>
// //           <Typography variant="subtitle2" fontWeight={800} color="primary">Shopidoo</Typography>
// //           <Typography variant="caption" color="text.secondary">Seller Panel</Typography>
// //         </Box>
// //       </Box>
// //       <Divider />
// //       <List sx={{ flex: 1, pt: 1 }}>
// //         {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
// //           const active = location.pathname === path;
// //           return (
// //             <ListItem key={path} disablePadding>
// //               <ListItemButton
// //                 onClick={() => { navigate(path); if (isMobile) setMobileOpen(false); }}
// //                 sx={{
// //                   mx: 1, borderRadius: 2, mb: 0.5,
// //                   bgcolor: active ? 'primary.main' : 'transparent',
// //                   color: active ? 'primary.contrastText' : 'text.primary',
// //                   '&:hover': { bgcolor: active ? 'primary.dark' : 'action.hover' },
// //                 }}>
// //                 <ListItemIcon sx={{ minWidth: 40, color: active ? 'inherit' : 'text.secondary' }}>
// //                   <Icon fontSize="small" />
// //                 </ListItemIcon>
// //                 <ListItemText primary={label} primaryTypographyProps={{ fontWeight: active ? 700 : 500, fontSize: 14 }} />
// //               </ListItemButton>
// //             </ListItem>
// //           );
// //         })}
// //       </List>
// //       <Divider />
// //       <Box sx={{ p: 2 }}>
// //         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
// //           <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>{user?.name?.[0]}</Avatar>
// //           <Box sx={{ flex: 1, minWidth: 0 }}>
// //             <Typography variant="body2" fontWeight={700} noWrap>{user?.name}</Typography>
// //             <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
// //           </Box>
// //         </Box>
// //       </Box>
// //     </Box>
// //   );

// //   return (
// //     <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
// //       {/* Sidebar desktop */}
// //       <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
// //         <Drawer variant={isMobile ? 'temporary' : 'permanent'} open={isMobile ? mobileOpen : true}
// //           onClose={() => setMobileOpen(false)}
// //           ModalProps={{ keepMounted: true }}
// //           sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', bgcolor: 'background.paper', borderRight: `1px solid ${theme.palette.divider}` } }}>
// //           <DrawerContent />
// //         </Drawer>
// //       </Box>

// //       {/* Main content */}
// //       <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
// //         <AppBar position="static" elevation={0}
// //           sx={{ bgcolor: 'background.paper', color: 'text.primary', borderBottom: `1px solid ${theme.palette.divider}` }}>
// //           <Toolbar>
// //             {isMobile && <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}><MenuIcon /></IconButton>}
// //             <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
// //               {NAV_ITEMS.find((i) => i.path === location.pathname)?.label || 'Seller Panel'}
// //             </Typography>
// //             <Tooltip title="Toggle theme">
// //               <IconButton onClick={() => dispatch(toggleTheme())} size="small">
// //                 {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
// //               </IconButton>
// //             </Tooltip>
// //             <Tooltip title="Account">
// //               <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 1 }}>
// //                 <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>{user?.name?.[0]}</Avatar>
// //               </IconButton>
// //             </Tooltip>
// //             <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}
// //               transformOrigin={{ horizontal: 'right', vertical: 'top' }}
// //               anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
// //               PaperProps={{ elevation: 4, sx: { minWidth: 180, mt: 1, borderRadius: 2 } }}>
// //               <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}>Profile</MenuItem>
// //               <Divider />
// //               <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout</MenuItem>
// //             </Menu>
// //           </Toolbar>
// //         </AppBar>
// //         <Box component="main" sx={{ flex: 1, overflow: 'auto', p: { xs: 2, md: 3 } }}>
// //           <Outlet />
// //         </Box>
// //       </Box>
// //       <Toast />
// //     </Box>
// //   );
// // };

// // export default SellerLayout;
