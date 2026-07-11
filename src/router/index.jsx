import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PageLoader from '../components/common/PageLoader/PageLoader';
import SellerLayout from '../components/layout/SellerLayout/SellerLayout';
import Support from '../pages/Support/Support';
// For Inventory
import Inventory from "../pages/Inventory/Inventory";
//settings
import Maintenance from '../pages/Maintenance/Maintenance';
import Settings from '../pages/Settings/Setting';


const Login = lazy(() => import('../pages/Auth/Login'));
const ForgotPassword = lazy(() => import('../pages/Auth/ForgotPassword'));
const OnboardingEntry = lazy(() => import('../pages/Onboarding/OnboardingEntry'));
const SellerOnboarding = lazy(() => import('../pages/Onboarding/SellerOnboarding'));
const RegistrationSuccess = lazy(() => import('../pages/Onboarding/RegistrationSuccess'));
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Products = lazy(() => import('../pages/Products/Products'));
const ProductForm = lazy(() => import('../pages/ProductForm/ProductForm'));
const SellerReviews = lazy(()=> import('../pages/SellerReviews/SellerReviews'));
const Orders = lazy(() => import('../pages/Orders/Orders'));
const Analytics = lazy(() => import('../pages/Analytics/Analytics'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const Wallet       = lazy(() => import('../pages/Wallet/Wallet'));
const Coupons = lazy(() => import('../pages/Coupons/Coupons'));
const Notifications = lazy(() => import('../pages/Notifications/Notifications'));
const Returns = lazy(() => import('../pages/Returns/SellerReturns'));
const SellerCMS = lazy(() => import('../pages/CMS/SellerCMS'));
const DeleteAccount = lazy(() => import('../pages/DeleteAccount/DeleteAccount'));



const PrivateRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user && user.role !== 'seller') return <Navigate to="/login" replace />;
  
  return children;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((s) => s.auth || {});
  const location = useLocation();
  
  // 🌟 REVISED: Only redirect if we are on Login/Register and ALREADY registered.
  // This completely stays out of the way of the onboarding flow.
  const isAuthPath = location.pathname === '/login' || location.pathname === '/register';
  
  if (isAuthenticated && isAuthPath) {
    if (user?.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    
    if (user?.seller_status === 'approved') {
      return <Navigate to="/dashboard" replace />;
    } else if (user?.seller_status === 'pending' || user?.seller_status === 'rejected') {
      return <Navigate to="/onboarding/success" replace />;
    }
  }
  
  return children || null;
};

const AppRouter = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route 
          path="/register" 
          element={
            <GuestRoute>
                <OnboardingEntry />
            </GuestRoute>
          } 
          />

          <Route
          path="/onboarding/success"
          element={<RegistrationSuccess />}
          />

          {/* 🌟 ADDED: Handle the base /onboarding URL by redirecting to Step 1 */}
          <Route 
            path="/onboarding" 
            element={<Navigate to="/onboarding/1" replace />} 
          />

          <Route
          path="/onboarding/:step"
          element={
              <SellerOnboarding />
          }
          />

        <Route path="/maintenance" element={<Maintenance />} />
        <Route element={<PrivateRoute><SellerLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
          <Route path="/sellerreviews" element={<SellerReviews />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/support" element={<Support />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/inventory" element={<Inventory />} />
           <Route path="/wallet" element={<Wallet />} />
          <Route path="/coupons" element={<Coupons />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/cms" element={<SellerCMS />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
