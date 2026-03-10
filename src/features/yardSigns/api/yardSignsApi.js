import { httpClient } from '../../../shared/api/httpClient';

export const getYardSignsConfig = () => httpClient.get('/v1/products/yard-signs/config');

export const createYardSignsQuote = (payload) =>
  httpClient.post('/v1/quotes/yard-signs', payload);

export const presignArtwork = (payload) =>
  httpClient.post('/v1/artwork/uploads/presign', payload);

export const completeArtworkUpload = (payload) =>
  httpClient.post('/v1/artwork/uploads/complete', payload);
