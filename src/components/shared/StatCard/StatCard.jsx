import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => (
  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>{title}</Typography>
            <Typography variant="h4" fontWeight={800}>{value}</Typography>
            {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{subtitle}</Typography>}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, width: 48, height: 48 }}>
            <Icon sx={{ color: `${color}.main` }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);
export default StatCard;
