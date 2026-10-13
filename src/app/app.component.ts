// // angular import
// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { SpinnerComponent } from './_core/shared/components/spinner/spinner.component';
// import { AuthorityService } from 'src/app/services/authority.service';
// import { CommonLoaderComponent } from 'src/app/_core/shared/utils/common-loader.component';
// import { AiChatbotComponent } from 'src/app/_core/shared/components/ai-chatbot/ai-chatbot/ai-chatbot.component';
// @Component({
//   selector: 'app-root',
//   templateUrl: './app.component.html',
//   styleUrls: ['./app.component.scss'],
//   imports: [RouterOutlet, SpinnerComponent,CommonLoaderComponent, AiChatbotComponent]
// })
// export class AppComponent {
//   title = 'Township';

//   constructor(private authorityService: AuthorityService) {
//     // console.log('🔵 AppComponent init');
//     this.authorityService.initFromLocalStorage();
//   }
// }


import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SpinnerComponent } from './_core/shared/components/spinner/spinner.component';
import { AuthorityService } from 'src/app/services/authority.service';
import { CommonLoaderComponent } from 'src/app/_core/shared/utils/common-loader.component';
import { AiChatbotComponent } from 'src/app/_core/shared/components/ai-chatbot/ai-chatbot/ai-chatbot.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [CommonModule, RouterOutlet, SpinnerComponent, CommonLoaderComponent, AiChatbotComponent]
})
export class AppComponent {
  title = 'Township';

  constructor(private authorityService: AuthorityService) {
    this.authorityService.initFromLocalStorage();
  }

  get isLoggedIn(): boolean {
    return localStorage.getItem('role') === 'true';
  }
}
