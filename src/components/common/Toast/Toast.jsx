import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '../../../features/ui/uiSlice';
const Toast = () => {
  const dispatch = useDispatch();
  const toast = useSelector((s) => s.ui.toast);
  return (
    <Snackbar open={!!toast} autoHideDuration={3500} onClose={() => dispatch(hideToast())} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      {toast ? <Alert onClose={() => dispatch(hideToast())} severity={toast.severity || 'info'} variant="filled" sx={{ minWidth: 280 }}>{toast.message}</Alert> : undefined}
    </Snackbar>
  );
};
export default Toast;
