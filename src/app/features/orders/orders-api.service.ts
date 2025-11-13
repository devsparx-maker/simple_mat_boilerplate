import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ChildItem {
  id: number;
  name: string;
  amount: number;
  status: string;
}

export interface OrderItem {
  id: number;
  customer: string;
  orderNo: string;
  city: string;
  total: number;
  children?: ChildItem[];
}

@Injectable({ providedIn: 'root' })
export class OrdersApiService {
  getOrders(): Observable<OrderItem[]> {
    const mock: OrderItem[] = [
      {
        id: 1,
        customer: 'אורי כהן',
        orderNo: 'A-1001',
        city: 'תל אביב',
        total: 1260,
        children: [
          { id: 11, name: 'מוצר X', amount: 2, status: 'נשלח' },
          { id: 12, name: 'מוצר Y', amount: 1, status: 'בטיפול' }
        ]
      },
      {
        id: 2,
        customer: 'מיכל לוי',
        orderNo: 'A-1002',
        city: 'חיפה',
        total: 890,
        children: [
          { id: 21, name: 'מוצר Z', amount: 5, status: 'הושלם' }
        ]
      },
      {
        id: 3,
        customer: 'דוד ישראלי',
        orderNo: 'A-1003',
        city: 'ירושלים',
        total: 430,
        children: []
      }
    ];

    console.log('🔵 OrdersApiService.getOrders() called, returning mock data:', mock);
    return of(mock).pipe(delay(500));
  }
}
