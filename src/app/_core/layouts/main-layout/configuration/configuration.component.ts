import { Component } from '@angular/core';
import { AuthorityService } from 'src/app/services/authority.service';
@Component({
  selector: 'app-configuration',
  imports: [],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.scss'
})
export class ConfigurationComponent {
  constructor(public auth: AuthorityService) {}
}
