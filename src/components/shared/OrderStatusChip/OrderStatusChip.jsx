import { Chip } from '@mui/material';
import { ORDER_STATUS } from '../../../constants/orderStatus';
const OrderStatusChip = ({ status, size = 'small' }) => {
  const cfg = ORDER_STATUS[status] || { label: status, color: 'default' };
  return <Chip label={cfg.label} color={cfg.color} size={size} sx={{ fontWeight: 600 }} />;
};
export default OrderStatusChip;
