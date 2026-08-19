import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const CHECK_INTERVAL_MS = 15000; // re-check every 15 seconds

const MaintenanceGuard = ({ children }) => {
  const [status, setStatus] = useState({ loading: true, maintenance: false });
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkMaintenance = () => {
      api.get('/settings')
        .then((res) => {
          const raw = res.data?.dataValues || res.data?.data || res.data;
          if (mounted) setStatus({ loading: false, maintenance: !!raw?.maintenanceMode });
        })
        .catch(() => {
          if (mounted) setStatus((prev) => ({ ...prev, loading: false }));
        });
    };

    checkMaintenance();
    const intervalId = setInterval(checkMaintenance, CHECK_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (status.loading) return null;

  if (status.maintenance && location.pathname !== '/maintenance') {
    return <Navigate to="/maintenance" replace />;
  }
  if (!status.maintenance && location.pathname === '/maintenance') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default MaintenanceGuard;