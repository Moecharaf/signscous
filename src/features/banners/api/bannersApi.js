import { httpClient } from '../../../shared/api/httpClient';

export const getBannersConfig = () => httpClient.get('/v1/products/banners/config');

export const createBannersQuote = (payload) =>
  httpClient.post('/v1/quotes/banners', payload);
