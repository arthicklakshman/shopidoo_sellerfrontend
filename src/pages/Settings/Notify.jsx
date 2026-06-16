import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  Divider
} from '@mui/material';

// ✅ Custom Helper Imports
import { EditButton, SaveCancelButtons } from '../../pages/Settings/SettingActions';
import {
  getNotificationPreferencesAPI,
  updateNotificationPreferencesAPI,
} from '../../features/settings/settings.service';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';

const notificationData = [
  { id: 'newOrders', title: 'New Orders', description: 'Get notified when you receive a new order', defaultChecked: true },
  { id: 'lowStock', title: 'Low Stock Alerts', description: 'Receive alerts when products are running low', defaultChecked: true },
  { id: 'productReviews', title: 'Product Reviews', description: 'Get notified about new product reviews', defaultChecked: true },
  { id: 'paymentUpdates', title: 'Payment Updates', description: 'Updates about payments and settlements', defaultChecked: true },
];

export default function Notifications() {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);

  const [savedData, setSavedData] = useState(
    notificationData.reduce((acc, item) => {
      acc[item.id] = item.defaultChecked;
      return acc;
    }, {})
  );

  const [preferences, setPreferences] = useState({ ...savedData });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await getNotificationPreferencesAPI();
        const dbPreferences = response.data?.notificationPreferences;
        if (dbPreferences) {
          setSavedData(dbPreferences);
          setPreferences(dbPreferences);
        }
      } catch (err) {
        console.error("Failed to load notification preferences", err);
      }
    };
    fetchPreferences();
  }, []);

  const handleToggle = (id) => {
    setPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCancel = () => {
    setPreferences({ ...savedData });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateNotificationPreferencesAPI(preferences);
      setSavedData({ ...preferences });
      setIsEditing(false);
      dispatch(showToast({ message: "Preferences saved successfully", severity: "success" }));
    } catch (err) {
      console.error(err);
      dispatch(showToast({ message: "Something went wrong.", severity: "error" }));
    }
  };

  return (
    <Card sx={{ 
      borderRadius: '12px', 
      border: 1, 
      borderColor: 'divider', 
      boxShadow: 'none',
      maxWidth: '1000px',
      bgcolor: 'background.paper'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '1.125rem' }}>
            Notification Preferences
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {notificationData.map((item, index) => (
            <React.Fragment key={item.id}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  py: 2.5
                }}
              >
                <Box sx={{ pr: 2 }}>
                  <Typography sx={{ color: 'text.primary', fontSize: '14px', fontWeight: 600, mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: 'text.secondary', fontSize: '13px' }}>
                    {item.description}
                  </Typography>
                </Box>

                <Switch
                  checked={false}
                  disabled={true}
                />
              </Box>

              {index < notificationData.length - 1 && (
                <Divider sx={{ borderColor: 'divider' }} />
              )}
            </React.Fragment>
          ))}
        </Box>

      </CardContent>
    </Card>
  );
}
