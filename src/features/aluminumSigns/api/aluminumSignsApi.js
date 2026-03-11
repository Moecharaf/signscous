import { httpClient } from '../../../shared/api/httpClient';

export const getAluminumSignsConfig = () => httpClient.get('/v1/products/aluminum-signs/config');

export const createAluminumSignsQuote = (payload) =>
  httpClient.post('/v1/quotes/aluminum-signs', payload);
