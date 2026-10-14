import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, subValue, icon: Icon, color = 'primary', trend }) => (
  <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 },
          '&:last-child': { pb: { xs: 1.5, sm: 2, md: 2.5 } },
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.8125rem', md: '0.875rem' },
                fontWeight: 600,
                lineHeight: 1.25,
                mb: { xs: 0.5, sm: 0.75 },
              }}
            >
              {title}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: { xs: 0.5, sm: 1 }, flexWrap: 'wrap' }}>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem', lg: '2.125rem' },
                  lineHeight: 1.2,
                  wordBreak: 'break-word',
                }}
              >
                {value}
              </Typography>
              {subValue && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                    lineHeight: 1.2,
                    mt: { xs: 0.25, sm: 0 },
                  }}
                >
                  {subValue}
                </Typography>
              )}
            </Box>

            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: `${color}.light`,
              width: { xs: 36, sm: 42, md: 48 },
              height: { xs: 36, sm: 42, md: 48 },
              flexShrink: 0,
            }}
          >
            <Icon sx={{ color: `${color}.main`, fontSize: { xs: 20, sm: 24, md: 26 } }} />
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

export default StatCard;
