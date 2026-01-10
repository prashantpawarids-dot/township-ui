import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { HttpClient } from '@angular/common/http';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    BaseChartDirective
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  selectedProject: 'Falcon' | 'Skylark' | 'Tiger' = 'Falcon';
  projects: ('Falcon' | 'Skylark' | 'Tiger')[] = ['Falcon', 'Skylark', 'Tiger'];

  counts: Record<string, number> = {};
  primaryDependent: Record<string, { primary: number; dependent: number }> = {};

  controllerStatus = { connected: false, in: 0, out: 0 };
  vehicleStatus = { connected: false, in: 0, out: 0 };


   

  visitorStatus = { twoWheeler: 0, fourWheeler: 0 };

  displayedCounts: { Encoded: number; NonEncoded: number; Total: number } = { Encoded: 0, NonEncoded: 0, Total: 0 };

  metricColors = [
    '#42a5f5', '#66bb6a', '#ffca28', '#ef5350',
    '#26c6da', '#ff7043', '#ab47bc', '#8d6e63'
  ];
  metricsOrder = [
    'Residents', 'Tenants', 'Landowners', 'Guests',
    'Visitors', 'Service Providers', 'Contractors', 'Employees'
  ];

  barChartData!: ChartConfiguration<'bar'>['data'];
  barChartOptions: ChartOptions<'bar'> = { responsive: true, plugins: { legend: { position: 'top' } } };
  lineChartData!: ChartConfiguration<'line'>['data'];
  lineChartOptions: ChartOptions<'line'> = { responsive: true };
  pieChartData!: ChartConfiguration<'pie'>['data'];
  pieChartOptions: ChartOptions<'pie'> = { responsive: true };

  projectData: Record<string, any> = {
    Falcon: {
      counts: {},
      controllerStatus: { connected: true, in: 12, out: 9 },
      vehicleStatus: { connected: false, in: 8, out: 5 },
      visitorStatus: { twoWheeler: 20, fourWheeler: 10 },
      chartData: { months: ['Jan','Feb','Mar','Apr','May','Jun'], visitors: [65,59,80,81,56,55], vehicles: [20,30,50,40,60,70] }
    },
    Skylark: {
      counts: {},
      controllerStatus: { connected: true, in: 6, out: 4 },
      vehicleStatus: { connected: true, in: 10, out: 8 },
      visitorStatus: { twoWheeler: 18, fourWheeler: 8 },
      chartData: { months: ['Jan','Feb','Mar','Apr','May','Jun'], visitors: [45,49,70,61,36,75], vehicles: [25,35,45,55,65,75] }
    },
    Tiger: {
      counts: {},
      controllerStatus: { connected: false, in: 3, out: 2 },
      vehicleStatus: { connected: true, in: 14, out: 11 },
      visitorStatus: { twoWheeler: 25, fourWheeler: 12 },
      chartData: { months: ['Jan','Feb','Mar','Apr','May','Jun'], visitors: [85,79,90,71,96,95], vehicles: [40,60,80,100,120,140] }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    const apiUrl = `${environment.apiurl}Report/Dashboard`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        this.processApiData(data);
        this.loadProjectData(this.selectedProject);
      },
      error: () => this.loadProjectData(this.selectedProject)
    });
  }

  processApiData(data: any[]) {
    const counts: any = {};
    const primaryDependent: any = {};
    let controllerActive = 0, controllerNonActive = 0;
    let encoded = 0, nonEncoded = 0, total = 0;

    let twoWheelerCount = 0;
    let fourWheelerCount = 0;

    for (const item of data) {
      // Cardholder counts
      if (item.keyName === 'CardHoldersCount') {
        const type = item.displayData;
        const count = +item.total;

       if (type === 'DResident') { 
  counts['Residents'] = (counts['Residents'] || 0) + count; 
  primaryDependent['Residents'] = { 
    primary: primaryDependent['Residents']?.primary || 0, 
    dependent: count 
  }; 
}
if (type === 'PResident') { 
  counts['Residents'] = (counts['Residents'] || 0) + count; 
  primaryDependent['Residents'] = { 
    primary: count, 
    dependent: primaryDependent['Residents']?.dependent || 0 
  }; 
}

if (type === 'DTenant') { 
  counts['Tenants'] = (counts['Tenants'] || 0) + count; 
  primaryDependent['Tenants'] = { 
    primary: primaryDependent['Tenants']?.primary || 0, 
    dependent: count 
  }; 
}
if (type === 'PTenant') { 
  counts['Tenants'] = (counts['Tenants'] || 0) + count; 
  primaryDependent['Tenants'] = { 
    primary: count, 
    dependent: primaryDependent['Tenants']?.dependent || 0 
  }; 
}

if (type === 'DLandOwner') { 
  counts['Landowners'] = (counts['Landowners'] || 0) + count; 
  primaryDependent['Landowners'] = { 
    primary: primaryDependent['Landowners']?.primary || 0, 
    dependent: count 
  }; 
}
if (type === 'PLandOwner') { 
  counts['Landowners'] = (counts['Landowners'] || 0) + count; 
  primaryDependent['Landowners'] = { 
    primary: count, 
    dependent: primaryDependent['Landowners']?.dependent || 0 
  }; 
}


        if (type === 'Guest') counts['Guests'] = (counts['Guests']||0)+count;
        if (type === 'Visitor') counts['Visitors'] = (counts['Visitors']||0)+count;
        if (type === 'SProvider') counts['Service Providers'] = (counts['Service Providers']||0)+count;
        if (type === 'Employee') counts['Employees'] = (counts['Employees']||0)+count;
      }

      // Encoded/Non-encoded counts
      if (item.groupID === 'CardEncodedNonEncode') {
        if (item.displayData === 'Encoded') encoded = +item.total;
        if (item.displayData === 'NonEncoded') nonEncoded = +item.total;
        if (item.displayData === 'Encode/NonEncodeTotal') total = +item.total;
      }

      // Controller status
      if (item.keyName==='ControllerCount') {
        if (item.displayData==='Active') controllerActive = +item.total;
        if (item.displayData==='Non-Active') controllerNonActive = +item.total;
      }

      // Vehicle counts
      if (item.groupID === 'Vehicle') {
        if (item.displayData === 'Two Wheeler') twoWheelerCount = +item.total;
        if (item.displayData === 'Four Wheeler') fourWheelerCount = +item.total;
      }
    }

    // Update component state
    this.counts = counts;
    this.primaryDependent = primaryDependent;
    this.counts['Encoded'] = encoded;
    this.counts['NonEncoded'] = nonEncoded;
    this.controllerStatus = { connected: controllerActive>0, in: controllerActive, out: controllerNonActive };
    this.vehicleStatus = { connected: (twoWheelerCount+fourWheelerCount)>0, in: twoWheelerCount+fourWheelerCount, out: 0 };
    this.visitorStatus = { twoWheeler: twoWheelerCount, fourWheeler: fourWheelerCount };

    // Set displayed counts with API total if available
    this.displayedCounts = {
      Encoded: encoded,
      NonEncoded: nonEncoded,
      Total: total || (encoded + nonEncoded)
    };

    this.animateCounts();
    this.updatePieChart();
    this.loadBarChartFromCounts();
  }

  animateCounts() {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    const targets = { ...this.displayedCounts };
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      this.displayedCounts.Encoded = Math.floor(targets.Encoded*(currentStep/steps));
      this.displayedCounts.NonEncoded = Math.floor(targets.NonEncoded*(currentStep/steps));
      this.displayedCounts.Total = Math.floor(targets.Total*(currentStep/steps));
      if(currentStep>=steps){ 
        this.displayedCounts = {...targets}; 
        clearInterval(timer); 
      }
    }, interval);
  }

  updatePieChart() {
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    this.metricsOrder.forEach((metric, i)=>{
      const pd = this.primaryDependent[metric];
      if(pd){
        labels.push(`${metric} Primary`);
        labels.push(`${metric} Dependent`);
        data.push(pd.primary);
        data.push(pd.dependent);
        colors.push(this.metricColors[i]);
        colors.push(this.metricColors[i]+'80');
      } else {
        labels.push(metric);
        data.push(this.counts[metric]||0);
        colors.push(this.metricColors[i]);
      }
    });

    this.pieChartData = { labels, datasets: [{ data, backgroundColor: colors }] };
  }

  loadBarChartFromCounts() {
    const labels = this.metricsOrder;
    const primaryData: number[] = [];
    const dependentData: number[] = [];
    const dependentColors = this.metricColors.map(c => c+'80');

    this.metricsOrder.forEach((metric, i) => {
      const pd = this.primaryDependent[metric];
      if(pd){
        primaryData.push(pd.primary);
        dependentData.push(pd.dependent);
      } else {
        primaryData.push(this.counts[metric] || 0);
        dependentData.push(0);
      }
    });

    this.barChartData = {
      labels,
      datasets: [
        { data: primaryData, label: 'Primary', backgroundColor: this.metricColors },
        { data: dependentData, label: 'Dependent', backgroundColor: dependentColors }
      ]
    };
  }

  loadProjectData(project: 'Falcon'|'Skylark'|'Tiger') {
    const pd = this.projectData[project];
    if(!pd) return;

    this.lineChartData = {
      labels: pd.chartData.months,
      datasets: [
        { data: pd.chartData.visitors, label: `${project} - Visitors`, borderColor: '#42a5f5', backgroundColor: 'rgba(66,165,245,0.2)', fill: true, tension: 0.35 },
        { data: pd.chartData.vehicles, label: `${project} - Vehicles`, borderColor: '#ab47bc', backgroundColor: 'rgba(171,71,188,0.2)', fill: true, tension: 0.35 }
      ]
    };
  }

  onProjectChange(project: 'Falcon'|'Skylark'|'Tiger') {
    this.selectedProject = project;
    this.loadProjectData(project);
  }

  getStatusClass(connected: boolean) { return connected ? 'connected' : 'disconnected'; }
}
