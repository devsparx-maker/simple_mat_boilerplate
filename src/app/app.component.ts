import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet }     from '@angular/router';
import { ToolbarComponent } from "../layout/toolbar/toolbar/toolbar.component";
import { AuthService } from '../core/services/auth.service';

// If you must use a legacy NgModule (declarations/pipes), import it here:
// import { SharedModule } from 'projects/legacy/shared/shared.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit{
  private auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.init().subscribe({
      error: err => console.log('AppComponent init error', err)
    })
  }
  

}
