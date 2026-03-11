import { Navigate, Route, Routes } from 'react-router-dom';
import App from '../App.jsx';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage.jsx';
import AccountOrdersPage from '../features/account/pages/AccountOrdersPage.jsx';
import LoginPage from '../features/auth/pages/LoginPage.jsx';
import SignupPage from '../features/auth/pages/SignupPage.jsx';
import CartPage from '../features/cart/pages/CartPage.jsx';
import CheckoutPage from '../features/checkout/pages/CheckoutPage.jsx';
import OrderConfirmationPage from '../features/orders/pages/OrderConfirmationPage.jsx';
import OrderTrackingPage from '../features/orders/pages/OrderTrackingPage.jsx';
import YardSignsArtworkPage from '../features/yardSigns/pages/YardSignsArtworkPage.jsx';
import YardSignsQuotePage from '../features/yardSigns/pages/YardSignsQuotePage.jsx';
import BannersQuotePage from '../features/banners/pages/BannersQuotePage.jsx';
import BannersArtworkPage from '../features/banners/pages/BannersArtworkPage.jsx';
import AluminumSignsQuotePage from '../features/aluminumSigns/pages/AluminumSignsQuotePage.jsx';
import AluminumSignsArtworkPage from '../features/aluminumSigns/pages/AluminumSignsArtworkPage.jsx';
import PvcSignsQuotePage from '../features/pvcSigns/pages/PvcSignsQuotePage.jsx';
import PvcSignsArtworkPage from '../features/pvcSigns/pages/PvcSignsArtworkPage.jsx';
import AcrylicSignsQuotePage from '../features/acrylicSigns/pages/AcrylicSignsQuotePage.jsx';
import AcrylicSignsArtworkPage from '../features/acrylicSigns/pages/AcrylicSignsArtworkPage.jsx';
import WindowGraphicsQuotePage from '../features/windowGraphics/pages/WindowGraphicsQuotePage.jsx';
import WindowGraphicsArtworkPage from '../features/windowGraphics/pages/WindowGraphicsArtworkPage.jsx';
import ProtectedRoute from '../shared/auth/ProtectedRoute.jsx';

export const appRoutes = [
  { path: '/', element: <App /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    path: '/account/orders',
    element: (
      <ProtectedRoute>
        <AccountOrdersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute adminOnly>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
  },
  { path: '/yard-signs', element: <YardSignsQuotePage /> },
  { path: '/yard-signs/artwork/:quoteId', element: <YardSignsArtworkPage /> },
  { path: '/banners', element: <BannersQuotePage /> },
  { path: '/banners/artwork/:quoteId', element: <BannersArtworkPage /> },
  { path: '/aluminum-signs', element: <AluminumSignsQuotePage /> },
  { path: '/aluminum-signs/artwork/:quoteId', element: <AluminumSignsArtworkPage /> },
  { path: '/pvc-signs', element: <PvcSignsQuotePage /> },
  { path: '/pvc-signs/artwork/:quoteId', element: <PvcSignsArtworkPage /> },
  { path: '/acrylic-signs', element: <AcrylicSignsQuotePage /> },
  { path: '/acrylic-signs/artwork/:quoteId', element: <AcrylicSignsArtworkPage /> },
  { path: '/window-graphics', element: <WindowGraphicsQuotePage /> },
  { path: '/window-graphics/artwork/:quoteId', element: <WindowGraphicsArtworkPage /> },
  { path: '/cart/:cartId', element: <CartPage /> },
  { path: '/checkout/:cartId', element: <CheckoutPage /> },
  { path: '/order-confirmation/:orderNumber', element: <OrderConfirmationPage /> },
  { path: '/orders/:orderNumber', element: <OrderTrackingPage /> },
];

export default function AppRouter() {
  return (
    <Routes>
      {appRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
