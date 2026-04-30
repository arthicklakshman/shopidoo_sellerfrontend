import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageLoader from '../components/common/PageLoader/PageLoader';
import SellerLayout from '../components/layout/SellerLayout/SellerLayout';
import Support from '../pages/Support/Support';
// For Inventory
import Inventory from "../pages/Inventory/Inventory";
//settings
import Maintenance from '../pages/Maintenance/Maintenance';


const Login = lazy(() => import('../pages/Auth/Login'));
// const Register = lazy(() => import('../pages/Auth/Register'));
const OnboardingEntry = lazy(() => import('../pages/Onboarding/OnboardingEntry'));
const SellerOnboarding = lazy(() => import('../pages/Onboarding/SellerOnboarding'));
const RegistrationSuccess = lazy(() => import('../pages/Onboarding/RegistrationSuccess'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Products = lazy(() => import('../pages/Products/Products'));
const ProductForm = lazy(() => import('../pages/ProductForm/ProductForm'));
const Orders = lazy(() => import('../pages/Orders/Orders'));
const Analytics = lazy(() => import('../pages/Analytics/Analytics'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const Coupons = lazy(() => import('../pages/Coupons/Coupons'));
const Notifications = lazy(() => import('../pages/Notifications/Notifications'));



const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && user.role !== 'seller') return <Navigate to="/login" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((s) => s.auth);
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        {/* <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} /> */}
        <Route 
 path="/register" 
 element={
   <GuestRoute>
      <OnboardingEntry />
   </GuestRoute>
 } 
/>

<Route
 path="/onboarding/:step"
 element={
   <GuestRoute>
      <SellerOnboarding />
   </GuestRoute>
 }
/>

<Route
 path="/onboarding/success"
 element={<RegistrationSuccess />}
/>

        <Route path="/maintenance" element={<Maintenance />} />
        <Route element={<PrivateRoute><SellerLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/support" element={<Support />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
