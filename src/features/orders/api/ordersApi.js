import { httpClient } from '../../../shared/api/httpClient';

export const getOrderSummary = (orderNumber) =>
  httpClient.get(`/v1/orders/${orderNumber}`);

export const getOrderTimeline = (orderNumber) =>
  httpClient.get(`/v1/orders/${orderNumber}/timeline`);

export const getMyOrders = () => httpClient.get('/v1/account/orders');
