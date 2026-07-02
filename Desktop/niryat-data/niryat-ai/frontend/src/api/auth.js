import { apiPost } from './client'

export const registerUser = (email, name = '', product = '') =>
  apiPost('/register', { email, name, product })
