import { HttpClient } from '@angular/common/http';
import { inject, Inject, Injectable } from '@angular/core';
import { BehaviorSubject, delay, map, Observable, of } from 'rxjs';
import { User } from '../../types/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private httpClient = inject(HttpClient);

  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable(); 

  private baseUrl = 'https://api.example.com/'; // Replace with your API base URL

  // -- STUB fake user insrtead of real login for demo purposes --
  private fakeUser: User = {
    id: 1,
    username: 'demoUser',
    knownAs: 'Demo',
    token: 'fake-jwt-token',
  };


  init(autoLogin: boolean = true) : Observable<User | null> {
    debugger;
    const stored = localStorage.getItem('user');
    
    if (stored) {
      try {
        const user: User = JSON.parse(stored);
        this.currentUserSource.next(user);
        return of(user);
      } catch (e) {
        console.error('Error parsing stored user', e);
        localStorage.removeItem('user');
        this.currentUserSource.next(null);
      }
    }

    if(!autoLogin) {
      this.currentUserSource.next(null);
      return of(null);
    }

    return this.login({username: 'demo', password: 'password'});
  }


  login(credentials: {username: string, password: string}) : Observable<User> {
    const {username, password} = credentials;

    // simulate API call
    return of(null).pipe(
      delay(1000),
      map(() => {
        if (username === 'demo' && password === 'password') {
          this.setCurrentUser(this.fakeUser);
          return this.fakeUser;
        } 
        throw new Error('Invalid username or password');
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