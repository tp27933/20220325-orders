import axios from 'axios'

import service from './request'

export const RequestLogin = (data) =>service.post('/auth/login',data)

export const RequestOrder = (data) =>service.get('/orders', {params: data})
