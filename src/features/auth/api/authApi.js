import { httpClient } from '../../../shared/api/httpClient';

export const apiLogin = (payload) => httpClient.post('/v1/auth/login', payload);

export const apiSignup = (payload) => httpClient.post('/v1/auth/signup', payload);

export const apiMe = () => httpClient.get('/v1/auth/me');
