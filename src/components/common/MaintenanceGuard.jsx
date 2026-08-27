import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../../services/api';

const CHECK_INTERVAL_MS = 15000;

// Keep the latest result outside the component.
// This prevents duplicate API calls when the component mounts again.
let cachedMaintenance = null;
let maintenanceRequest = null;
let lastCheckTime = 0;

const getMaintenanceStatus = async () => {
  const now = Date.now();

  // Use cached result for 15 seconds
  if (cachedMaintenance !== null && now - lastCheckTime < CHECK_INTERVAL_MS) {
    return cachedMaintenance;
  }

  // If a request is already running, reuse it
  if (maintenanceRequest) {
    return maintenanceRequest;
  }

  maintenanceRequest = api.get('/settings')
    .then((res) => {
      const raw =
        res.data?.dataValues ||
        res.data?.data ||
        res.data;

      const maintenance = !!raw?.maintenanceMode;

      cachedMaintenance = maintenance;
      lastCheckTime = Date.now();

      return maintenance;
    })
    .catch(() => {
      // If API fails, don't put the app into maintenance mode
      return cachedMaintenance ?? false;
    })
    .finally(() => {
      maintenanceRequest = null;
    });

  return maintenanceRequest;
};

const MaintenanceGuard = ({ children }) => {
  const [status, setStatus] = useState({
    loading: true,
    maintenance: false,
  });

  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    const checkMaintenance = async () => {
      const maintenance = await getMaintenanceStatus();

      if (mounted) {
        setStatus({
          loading: false,
          maintenance,
        });
      }
    };

    checkMaintenance();

    return () => {
      mounted = false;
    };
  }, []);

  if (status.loading) {
    return null;
  }

  if (
    status.maintenance &&
    location.pathname !== '/maintenance'
  ) {
    return <Navigate to="/maintenance" replace />;
  }

  if (
    !status.maintenance &&
    location.pathname === '/maintenance'
  ) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default MaintenanceGuard;