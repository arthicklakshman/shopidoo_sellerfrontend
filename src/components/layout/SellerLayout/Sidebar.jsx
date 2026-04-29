import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Divider, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useLocation, useNavigate } from 'react-router-dom';

// 🌟 IMPORT GRADIENT TEXT
import GradientText from '../../shared/GradientButton/GradientText';

const Sidebar = ({ collapsed, setCollapsed, navItems }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden'
      }}
    >
      {/* TOP */}
      <Box>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* 🌟 Updated to Brand Green */}
          <StorefrontIcon sx={{ color: '#0B8457' }} />
          {!collapsed && (
            <Box>
              {/* 🌟 Updated to use your GradientText component */}
              <GradientText variant="body1" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
                My Store
              </GradientText>
              <Typography variant="caption" sx={{ display: 'block', mt: -0.5, color: '#6b7280' }}>
                Seller Panel
              </Typography>
            </Box>
          )}
        </Box>

        <Divider />

        <List>
          {navItems.map(({ label, icon: Icon, path }) => {
            const active = location.pathname === path;

            return (
              <ListItem key={path} disablePadding>
                <ListItemButton
                  onClick={() => navigate(path)}
                  sx={{
                    mx: 1,
                    my: 0.5, // Added spacing between items
                    borderRadius: 2,
                    // 🌟 Swapped 'bgcolor' for 'background' to support your gradient
                    background: active ? 'linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)' : 'transparent',
                    color: active ? '#fff' : '#555',
                    '&:hover': {
                      background: active ? 'linear-gradient(90deg, #0FB9B1 20%, #0B8457 120%)' : '#f3f4f6'
                    }
                  }}
                >
                  {/* Keep icon white if active, otherwise gray */}
                  <ListItemIcon sx={{ color: active ? '#fff' : '#777', minWidth: 40 }}>
                    <Icon />
                  </ListItemIcon>
                  
                  {/* Slightly bolder text for the active item */}
                  {!collapsed && (
                    <ListItemText 
                      primary={label} 
                      primaryTypographyProps={{ fontWeight: active ? 600 : 500 }} 
                    />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* BOTTOM */}
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'center', borderTop: '1px solid #eee' }}>
        <IconButton onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default Sidebar;