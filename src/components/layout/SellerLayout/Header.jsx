  // import {
  //   AppBar, Toolbar, Box, IconButton, InputBase, Typography, Badge
  // } from '@mui/material';
  // import SearchIcon from '@mui/icons-material/Search';
  // import NotificationsIcon from '@mui/icons-material/Notifications';
  // import PersonIcon from '@mui/icons-material/Person';
  // import { useState } from 'react';
  // import { Menu, MenuItem } from '@mui/material';
  // import { useNavigate } from 'react-router-dom';
  // import { useDispatch } from 'react-redux';
  // import { logoutSeller } from '../../../features/auth/authSlice';

  // const Header = () => {



  //   const [anchorEl, setAnchorEl] = useState(null);
  //   const open = Boolean(anchorEl);

  //   const navigate = useNavigate();
  //   const dispatch = useDispatch();




  //   const handleProfileClick = (event) => {
  //     setAnchorEl(event.currentTarget);
  //   };

  //   const handleClose = () => {
  //     setAnchorEl(null);
  //   };

  //   const handleLogout = () => {
  //     dispatch(logoutSeller());
  //     // localStorage.clear(); 

  //     handleClose();
  //     navigate('/login');
  //   };



  //   return (
  //     <AppBar
  //       position="static"
  //       sx={{
  //         bgcolor: '#fff',
  //         color: '#000',
  //         boxShadow: 'none',
  //         borderBottom: '1px solid #ddd'
  //       }}
  //     >
  //       <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>

  //         {/* Search */}
  //         <Box
  //           sx={{
  //             display: 'flex',
  //             alignItems: 'center',
  //             gap: 1,
  //             width: '50%',
  //             bgcolor: '#f5f5f5',
  //             px: 2,
  //             py: 0.5,
  //             borderRadius: 2
  //           }}
  //         >
  //           <SearchIcon sx={{ color: '#777' }} />
  //           <InputBase placeholder="Search orders, products..." fullWidth />
  //         </Box>

  //         {/* Right Side */}
  //         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

  //           {/* Notifications */}
  //           <IconButton>
  //             <Badge badgeContent={3} color="error">
  //               <NotificationsIcon />
  //             </Badge>
  //           </IconButton>

  //           {/* User */}
  //           <Box
  //             onClick={handleProfileClick}
  //             sx={{
  //               display: 'flex',
  //               alignItems: 'center',
  //               gap: 1,
  //               px: 1.5,
  //               py: 0.5,
  //               borderRadius: 2,
  //               cursor: 'pointer',
  //               '&:hover': {
  //                 bgcolor: '#4CAF50',
  //                 color: '#fff'
  //               }
  //             }}
  //           >
  //             <PersonIcon />
  //             <Box>
  //               <Typography fontSize={14}>John Doe</Typography>
  //               <Typography variant="caption">Seller ID: #54321</Typography>
  //             </Box>
  //           </Box>

  //         </Box>
  //       </Toolbar>
  //       <Menu
  //         anchorEl={anchorEl}
  //         open={open}
  //         onClose={handleClose}
  //         anchorOrigin={{
  //           vertical: 'bottom',
  //           horizontal: 'right',
  //         }}
  //         transformOrigin={{
  //           vertical: 'top',
  //           horizontal: 'right',
  //         }}
  //       >
  //         <MenuItem onClick={handleLogout}>
  //           Logout
  //         </MenuItem>
  //       </Menu>
  //     </AppBar>
  //   );
  // };

  // export default Header;


  import {
  AppBar, Toolbar, Box, IconButton, Typography, Badge
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux'; // 🌟 Added useSelector
import { logoutSeller } from '../../../features/auth/authSlice';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 🌟 Pull the logged-in user's data from Redux
  const { user } = useSelector((state) => state.auth);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logoutSeller());
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: '#fff',
        color: '#000',
        boxShadow: 'none',
        borderBottom: '1px solid #ddd'
      }}
    >
      {/* 🌟 Changed justifyContent to flex-end since the search bar is removed */}
      <Toolbar sx={{ display: 'flex', justifyContent: 'flex-end' }}>

        {/* Right Side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

          {/* Notifications */}
          <IconButton>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* User Profile Box */}
          <Box
            onClick={handleProfileClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                // 🌟 Updated to your brand's green gradient
                background: 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)',
                color: '#fff'
              }
            }}
          >
            <PersonIcon />
            <Box>
              {/* 🌟 Dynamic Full Name */}
              <Typography fontSize={14} fontWeight={600} sx={{ textTransform: 'capitalize', lineHeight: 1.2 }}>
                {user?.fullName || 'Seller Name'}
              </Typography>
              
              {/* 🌟 Dynamic Role & Registration ID */}
             <Typography variant="caption" sx={{ textTransform: 'capitalize', display: 'block' }}>
  {user?.role === 'seller' ? 'Seller' : (user?.role || 'User')} 
  {/* Checks for both camelCase and snake_case just to be safe! */}
  {(user?.registrationId || user?.registration_id) ? ` | ${user?.registrationId || user?.registration_id}` : ''}
</Typography>
            </Box>
          </Box>

        </Box>
      </Toolbar>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;