import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { OrdersApiService } from './orders-api.service';

export const ordersResolver: ResolveFn<any> = async () => {
  const svc = inject(OrdersApiService);
  console.log('🟡 ordersResolver: calling OrdersApiService.getOrders()...');
  const result = await firstValueFrom(svc.getOrders());
  console.log('🟡 ordersResolver: received data:', result);
  return result;
};
