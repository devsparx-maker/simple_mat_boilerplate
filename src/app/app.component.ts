import { Component, inject } from '@angular/core';
import { RouterOutlet }     from '@angular/router';
import { ToolbarComponent } from "../layout/toolbar/toolbar/toolbar.component";

// If you must use a legacy NgModule (declarations/pipes), import it here:
// import { SharedModule } from 'projects/legacy/shared/shared.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  

}
