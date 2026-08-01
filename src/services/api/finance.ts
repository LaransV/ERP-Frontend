import type { APIConfig } from '@/types/api';
// Clients
export const getClients:          APIConfig = { endPoint:'/finance/clients',              keys:['clients'],          method:'GET',    accessToken:true };
export const getClientById:       APIConfig = { endPoint:'/finance/clients/{id}',         keys:['client-detail'],    method:'GET',    accessToken:true };
export const postClient:          APIConfig = { endPoint:'/finance/clients',              keys:['client-create'],    method:'POST',   accessToken:true };
export const putClient:           APIConfig = { endPoint:'/finance/clients/{id}',         keys:['client-update'],    method:'PUT',    accessToken:true };
export const deleteClient:        APIConfig = { endPoint:'/finance/clients/{id}',         keys:['client-delete'],    method:'DELETE', accessToken:true };
export const exportClientsExcel:  APIConfig = { endPoint:'/finance/clients/export/excel', keys:['client-exp-xl'],    method:'GET',    accessToken:true };
export const exportClientsPdf:    APIConfig = { endPoint:'/finance/clients/export/pdf',   keys:['client-exp-pdf'],   method:'GET',    accessToken:true };
// Products
export const getProducts:    APIConfig = { endPoint:'/finance/products',      keys:['products'],        method:'GET',    accessToken:true };
export const getProductById: APIConfig = { endPoint:'/finance/products/{id}', keys:['product-detail'],  method:'GET',    accessToken:true };
export const postProduct:    APIConfig = { endPoint:'/finance/products',      keys:['product-create'],  method:'POST',   accessToken:true };
export const putProduct:     APIConfig = { endPoint:'/finance/products/{id}', keys:['product-update'],  method:'PUT',    accessToken:true };
export const deleteProduct:  APIConfig = { endPoint:'/finance/products/{id}', keys:['product-delete'],  method:'DELETE', accessToken:true };
// Invoices
export const getInvoices:        APIConfig = { endPoint:'/finance/invoices',            keys:['invoices'],         method:'GET',    accessToken:true };
export const getInvoiceById:     APIConfig = { endPoint:'/finance/invoices/{id}',       keys:['invoice-detail'],   method:'GET',    accessToken:true };
export const postInvoice:        APIConfig = { endPoint:'/finance/invoices',            keys:['invoice-create'],   method:'POST',   accessToken:true };
export const putInvoice:         APIConfig = { endPoint:'/finance/invoices/{id}',       keys:['invoice-update'],   method:'PUT',    accessToken:true };
export const patchInvoiceStatus: APIConfig = { endPoint:'/finance/invoices/{id}/status',keys:['invoice-status'],   method:'PATCH',  accessToken:true };
export const deleteInvoice:      APIConfig = { endPoint:'/finance/invoices/{id}',       keys:['invoice-delete'],   method:'DELETE', accessToken:true };
export const getFinanceDash:     APIConfig = { endPoint:'/finance/dashboard',           keys:['finance-dash'],     method:'GET',    accessToken:true };
// Dispatch From / Ship To address book (Invoice form tabs)
export const getDispatchAddresses: APIConfig = { endPoint:'/finance/dispatch-addresses', keys:['dispatch-addresses'], method:'GET',  accessToken:true };
export const postDispatchAddress:  APIConfig = { endPoint:'/finance/dispatch-addresses', keys:['dispatch-address-create'], method:'POST', accessToken:true };
export const getShipToAddresses:   APIConfig = { endPoint:'/finance/ship-to-addresses',  keys:['ship-to-addresses'],  method:'GET',  accessToken:true };
export const postShipToAddress:    APIConfig = { endPoint:'/finance/ship-to-addresses',  keys:['ship-to-address-create'], method:'POST', accessToken:true };
