import { Component } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from 'src/app/_core/shared/utils/custom-date-adapter';
@Component({
  selector: 'app-agreement-end-report',
  imports: [],
  
providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
  templateUrl: './agreement-end-report.component.html',
  styleUrl: './agreement-end-report.component.scss'
})
export class AgreementEndReportComponent {

}
