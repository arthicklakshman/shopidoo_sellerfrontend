// 👉 Add API integration (POST/PUT)
// 👉 Add GET API to auto-fill existing bank details
// 👉 Add Toast instead of alert (professional UX)



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
import Notifications from "./Notifications";

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
      <Typography variant="h5" fontWeight="bold">
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
          backgroundColor: "#f1f3f5",
          width: "fit-content",
        }}
      >
        {tabs.map((item, index) => (
          <Button
            key={index}
            onClick={() => setTab(index)}
            startIcon={item.icon}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              px: 2,
              py: 1,
              color: tab === index ? "#000" : "#555",
              backgroundColor: tab === index ? "#fff" : "transparent",
              boxShadow: tab === index ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
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