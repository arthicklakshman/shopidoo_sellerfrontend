import { Snackbar, Alert } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { hideToast } from '../../../features/ui/uiSlice';
const Toast = () => {
  const dispatch = useDispatch();
  const toast = useSelector((s) => s.ui.toast);
  return (
    <Snackbar
      open={!!toast}
      autoHideDuration={4000}
      onClose={() => dispatch(hideToast())}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ zIndex: 99999 }}
    >
      {toast ? (
        <Alert
          onClose={() => dispatch(hideToast())}
          severity={toast.severity || 'info'}
          variant="filled"
          sx={{ minWidth: 280, borderRadius: 2, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
        >
          {toast.message}
        </Alert>
      ) : undefined}
    </Snackbar>
  );
};
export default Toast;
