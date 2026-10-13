import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-nrdcardtemplate',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './nrdcardtemplate.component.html',
  styleUrls: ['./nrdcardtemplate.component.scss']
})
export class NrdcardtemplateComponent implements OnInit {

  neighbourhoods: any[] = [];
  selectedNRDId: number | null = null;
  selectedNRDName: string = '';
  selectedFile: File | null = null;
  previewUrl: string = '';
  currentTemplate: string = '';

  isViewMode: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  successMsg: string = '';
  errorMsg: string = '';

  private templateCache: Record<number, string> = {};

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
  this.route.queryParamMap.subscribe(params => {
    const id   = params.get('id');
    const view = params.get('view');
    this.isViewMode = view === 'true';

    this.authService.getNeighbourhood().subscribe({
      next: (res) => {
        this.neighbourhoods = res;
        if (id) {
          this.selectedNRDId = +id;
          const nrd = this.neighbourhoods.find(n => n.id == id);
          this.selectedNRDName = nrd?.name ?? '';
          this.loadTemplate(+id);
        }
      },
      error: () => {}
    });
  });
}

  loadTemplate(nrdId: number): void {
  if (this.templateCache[nrdId]) {
    this.currentTemplate = this.templateCache[nrdId];
    return;
  }
  this.isLoading = true;
  this.authService.getNRDTemplate(nrdId).subscribe({
    next: (res: any) => {
      const url = res?.imageKitUrl ?? res?.ImageKitUrl ?? res?.base64 ?? res?.Base64 ?? '';
      this.templateCache[nrdId] = url;
      this.currentTemplate = url;
      this.isLoading = false;
    },
    error: () => { this.isLoading = false; }
  });
}

  onNRDChange(): void {
    this.previewUrl = '';
    this.currentTemplate = '';
    this.selectedFile = null;
    const nrd = this.neighbourhoods.find(n => n.id == this.selectedNRDId);
    this.selectedNRDName = nrd?.name ?? '';
    if (this.selectedNRDId) this.loadTemplate(this.selectedNRDId);
  }

  onFileChange(e: Event): void {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => { this.previewUrl = ev.target?.result as string; };
    reader.readAsDataURL(file);
  }

  clearFile(): void {
    this.selectedFile = null;
    this.previewUrl = '';
  }

  save(): void {
    if (!this.selectedNRDId || !this.selectedFile) return;
    this.isSaving = true;
    this.successMsg = '';
    this.errorMsg = '';
    this.authService.uploadNRDTemplate(
      this.selectedNRDId, this.selectedNRDName, this.selectedFile
    ).subscribe({
      next: () => {
        this.isSaving = false;
        this.navigateBack();
      },
      error: () => {
        this.errorMsg = '❌ Failed to save.';
        this.isSaving = false;
      }
    });
  }

  navigateBack(): void {
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/nrdcardtemplate' }
    });
  }
}