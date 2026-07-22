import { useState } from "react";
import { Box, Typography, Paper, Button } from "@mui/material";

import StoreIcon from "@mui/icons-material/Store";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import LockIcon from "@mui/icons-material/Lock";
import NotificationsIcon from "@mui/icons-material/Notifications";

import StoreInfo from "./StoreInfo";
import BankDetails from "./BankDetails";
import PickupAddress from "./PickupAddress";
import Security from "./Security";
import Notifications from "./Notify";

const Settings = () => {
  const [tab, setTab] = useState(0);

  const tabs = [
    { label: "Store Info", icon: <StoreIcon /> },
    { label: "Bank Details", icon: <AccountBalanceIcon /> },
    { label: "Pickup Address", icon: <LocationOnIcon /> },
    { label: "Security", icon: <LockIcon /> },
    { label: "Notifications", icon: <NotificationsIcon /> },
  ];

  const components = [
    <StoreInfo />,
    <BankDetails />,
    <PickupAddress />,
    <Security />,
    <Notifications />,
  ];

  return (
    <Box p={3}>
      {/* Title */}
      <Typography variant="h5" fontWeight="bold" color="text.primary">
        Settings
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={2}>
        Manage your store and account settings
      </Typography>

      {/* Custom Tabs */}
      <Paper
        sx={{
          display: "flex",
          gap: 1,
          p: 1,
          borderRadius: 3,
          bgcolor: "action.hover",
          width: { xs: "100%", md: "fit-content" },
          overflowX: "auto",
          border: 1,
          borderColor: 'divider',
          boxShadow: 'none',
          /* Hide scrollbar for a cleaner look on mobile tabs */
          '&::-webkit-scrollbar': { display: 'none' },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {tabs.map((item, index) => (
          <Button
            key={index}
            onClick={() => setTab(index)}
            startIcon={item.icon}
            sx={{
              flexShrink: 0,
              whiteSpace: 'nowrap',
              borderRadius: 3,
              textTransform: "none",
              px: 2,
              py: 1,
              color: tab === index ? "text.primary" : "text.secondary",
              bgcolor: tab === index ? "background.paper" : "transparent",
              boxShadow: tab === index ? 1 : "none",
              "&:hover": {
                bgcolor: tab === index ? "background.paper" : "action.selected",
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Paper>

      {/* Content */}
      <Box mt={3}>{components[tab]}</Box>   
    </Box>
  );
};

export default Settings;
