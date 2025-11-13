import { Routes } from '@angular/router';
import { ordersResolver } from './features/orders/orders.resolver';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'orders' },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/orders-shell.component')
      .then(m => m.OrdersShellComponent),
    resolve: { orders: ordersResolver }
  },
  { path: '**', redirectTo: 'orders' }
];