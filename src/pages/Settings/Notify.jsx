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

const notificationData = [
  { id: 'newOrders', title: 'New Orders', description: 'Get notified when you receive a new order', defaultChecked: true },
  { id: 'lowStock', title: 'Low Stock Alerts', description: 'Receive alerts when products are running low', defaultChecked: true },
  { id: 'productReviews', title: 'Product Reviews', description: 'Get notified about new product reviews', defaultChecked: true },
  { id: 'paymentUpdates', title: 'Payment Updates', description: 'Updates about payments and settlements', defaultChecked: true },
  { id: 'marketingEmails', title: 'Marketing Emails', description: 'Tips and best practices for sellers', defaultChecked: true },
  { id: 'weeklySummary', title: 'Weekly Summary', description: 'Weekly report of your sales and performance', defaultChecked: true },
];

export default function Notifications() {
  const [isEditing, setIsEditing] = useState(false);

  // Keeps track of the real data so we can revert if the user clicks "Cancel"
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

  // ---------------- HANDLERS ----------------

  const handleToggle = (id) => {
    setPreferences(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCancel = () => {
    setPreferences({ ...savedData }); // Revert to original data
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await updateNotificationPreferencesAPI(preferences);
      setSavedData({ ...preferences });
      setIsEditing(false);
      alert("Preferences saved successfully");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  // ---------------- UI ----------------

  return (
    <Card sx={{ 
      borderRadius: '12px', 
      border: '1px solid #e5e7eb', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      maxWidth: '1000px',
      fontFamily: 'sans-serif'
    }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827', fontSize: '1.125rem' }}>
            Notification Preferences
          </Typography>

          {!isEditing && <EditButton onClick={() => setIsEditing(true)} />}
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
                  <Typography sx={{ color: '#111827', fontSize: '14px', mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: '#6b7280', fontSize: '13px' }}>
                    {item.description}
                  </Typography>
                </Box>

                <Switch
                  checked={preferences[item.id]}
                  onChange={() => handleToggle(item.id)}
                  disabled={!isEditing}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#ffffff',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#111827',
                      opacity: 1,
                    },
                    '& .MuiSwitch-track': {
                      backgroundColor: '#d1d5db',
                      opacity: 1,
                    }
                  }}
                />
              </Box>

              {index < notificationData.length - 1 && (
                <Divider sx={{ borderColor: '#f3f4f6' }} />
              )}
            </React.Fragment>
          ))}
        </Box>

        {isEditing && (
            <Box sx={{ mt: 2 }}>
                <SaveCancelButtons onCancel={handleCancel} onSave={handleSave} />
            </Box>
        )}

      </CardContent>
    </Card>
  );
}
