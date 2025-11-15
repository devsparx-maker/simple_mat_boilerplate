import { HttpClient } from '@angular/common/http';
import { inject, Inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { User } from '../../types/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient);

  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable(); 

  private baseUrl = 'https://api.example.com/'; // Replace with your API base URL


  init() : Observable<User | null> {
    const stored = localStorage.getItem('user');
    if (!stored) {
      this.currentUserSource.next(null);
      return of(null);
    }

    const user: User = JSON.parse(stored);
    this.currentUserSource.next(user);

    return this.httpClient.get<User>(`${this.baseUrl}account/me`).pipe(
      map(freshUser => {
        const mergedUser = { ...user, ...freshUser };
        this.setCurrentUser(mergedUser);
        return mergedUser;
      })
    );  
  }

  setCurrentUser(user: User | null) : void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    this.currentUserSource.next(user);
  }

  get token() : string | null {
    const user = this.currentUserSource.value;
    return user?.token || null;
  }


}