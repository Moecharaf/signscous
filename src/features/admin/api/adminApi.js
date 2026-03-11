import { httpClient } from '../../../shared/api/httpClient';

export const getAdminOrders = () => httpClient.get('/v1/admin/orders');

export const getAdminCustomers = () => httpClient.get('/v1/admin/customers');

export const updateAdminOrderStatus = (orderNumber, status) =>
  httpClient.patch(`/v1/admin/orders/${orderNumber}/status`, { status });
