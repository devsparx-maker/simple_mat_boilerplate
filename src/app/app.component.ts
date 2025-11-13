import { Component, inject } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule }  from '@angular/material/button';
import { MatIconModule }    from '@angular/material/icon';
import { RouterOutlet }     from '@angular/router';

// If you must use a legacy NgModule (declarations/pipes), import it here:
// import { SharedModule } from 'projects/legacy/shared/shared.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule /*, SharedModule*/],
  template: `
    <div style="display: flex; flex-direction: column; height: 100vh;">
      <mat-toolbar color="primary" class="toolbar-fill">
        <!-- Left (since RTL, this visually appears on the left) -->
        <div style="margin-inline-start:8px; display:flex; align-items:center; gap:8px;">
          <mat-icon>account_circle</mat-icon>
          <span>{{ userName }}</span>
        </div>

        <span class="spacer" style="flex:1 1 auto;"></span>

        <!-- Center button (in RTL it still centers by flex) -->
        <button mat-raised-button color="accent" (click)="onFetch()">
          הפעל משיכת נתונים
        </button>
      </mat-toolbar>

      <div style="flex: 1 1 auto; min-height: 0; overflow: auto;">
        <router-outlet />
      </div>
    </div>
  `
})
export class AppComponent {
  userName = 'שלום, דני';
  onFetch() {
    // hook your fetch logic here
    console.log('Fetch clicked');
  }
}
