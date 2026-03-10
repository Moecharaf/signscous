import { httpClient } from '../../../shared/api/httpClient';

export const calculateCheckoutPrice = (payload) =>
  httpClient.post('/v1/checkout/price', payload);

export const placeOrder = (payload) => httpClient.post('/v1/orders', payload);
