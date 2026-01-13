// angular import
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SpinnerComponent } from './_core/shared/components/spinner/spinner.component';
import { AuthorityService } from 'src/app/services/authority.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [RouterOutlet, SpinnerComponent]
})
export class AppComponent {
  title = 'Township';

  constructor(private authorityService: AuthorityService) {
    // console.log('🔵 AppComponent init');
    this.authorityService.initFromLocalStorage();
  }
}
