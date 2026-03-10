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
