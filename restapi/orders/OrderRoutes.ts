import express, { Request, Response, Router } from 'express';
import * as OrderController from './OrderController';

const api:Router = express.Router()

api.get('/orders/list', OrderController.getOrders)

api.get('/orders/findByUserId/:userId', OrderController.getUserOrders)

api.post('/orders/create', OrderController.createOrder)

api.delete('/orders/deleteByOrderId/:id', OrderController.deleteOrder)

//api.post('/orders/update', OrderController.updateOrder)

export default api