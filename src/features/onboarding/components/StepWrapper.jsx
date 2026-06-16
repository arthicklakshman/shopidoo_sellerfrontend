import { Card, CardContent } from '@mui/material';

const StepWrapper = ({ children }) => {
  return (
    <Card 
      sx={{ 
        borderRadius: '16px', 
        border: '1px solid #e5e7eb', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        mb: 4 
      }}
    >
      <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default StepWrapper;