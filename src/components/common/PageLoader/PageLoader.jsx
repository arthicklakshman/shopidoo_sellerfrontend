import { Box, CircularProgress } from '@mui/material';
const PageLoader = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
    <CircularProgress size={48} thickness={4} />
  </Box>
);
export default PageLoader;
