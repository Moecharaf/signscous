import { httpClient } from '../../../shared/api/httpClient';

export const createCartFromQuote = (quoteId) => httpClient.post('/v1/carts', { quoteId });

export const addQuoteItemToCart = (cartId, quoteItemId, quantity) =>
  httpClient.post(`/v1/carts/${cartId}/items`, { quoteItemId, quantity });

export const getCart = (cartId) => httpClient.get(`/v1/carts/${cartId}`);
