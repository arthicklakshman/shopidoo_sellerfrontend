import { Box, Typography, Button } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
const EmptyState = ({ icon: Icon = InboxIcon, title = 'Nothing here', description = '', actionLabel, onAction }) => (
  <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
    <Icon sx={{ fontSize: 72, color: 'text.disabled', mb: 2 }} />
    <Typography variant="h6" fontWeight={600} gutterBottom>{title}</Typography>
    {description && <Typography color="text.secondary" sx={{ mb: 3 }}>{description}</Typography>}
    {actionLabel && onAction && (
      <Button 
        variant="contained" 
        onClick={onAction}
        sx={{
          background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
          color: '#000',
          fontWeight: 600,
          textTransform: 'none',
          borderRadius: '8px',
          px: 3,
          boxShadow: 'none',
          '&:hover': {
            background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
            boxShadow: 'none',
          }
        }}
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);
export default EmptyState;
