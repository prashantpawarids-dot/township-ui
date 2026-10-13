import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { AuthService } from '../../../services/auth.service';
import { AuthService } from '../../../services/auth.service';
import Swal from 'sweetalert2';

interface BackupSettings {
  enabled: boolean;
  frequency: string;
  time: string;
  dayOfWeek: number;
  dayOfMonth: number;
  folderPath: string;
  retentionDays: number;
  server?: string;
  database?: string;
  sqlUser?: string;
  sqlPassword?: string;
  emailEnabled: boolean;
  fromEmail?: string;
  appPassword?: string;
  toEmail?: string;
  lastRunTime?: string;
  lastRunStatus?: string;
}

interface BackupHistoryEntry {
  runTime: string;
  success: boolean;
  database: string;
  fileName?: string;
  sizeMB?: number;
  errorMessage?: string;
  triggerType: string;
}

@Component({
  selector: 'app-backup-maintenance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backup-maintenance.component.html',
  styleUrl: './backup-maintenance.component.scss'
})
export class BackupMaintenanceComponent implements OnInit {

  settings: BackupSettings = {
    enabled: false,
    frequency: 'Daily',
    time: '00:00',
    dayOfWeek: 0,
    dayOfMonth: 1,
    folderPath: '',
    retentionDays: 1,
    emailEnabled: false
  };

  history: BackupHistoryEntry[] = [];

  viewMode = false;
  // showAdvancedDb = false;
  showEmailSettings = false;
  showFolderBrowser = false;

  currentBrowsePath = 'C:\\';
  folderList: { name: string; path: string }[] = [];

  saving = false;
  running = false;
  loadingHistory = false;
  message = '';
  messageType: 'success' | 'error' | '' = '';

  weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadSettings();
    this.loadHistory();
  }

    loadSettings(): void {
    this.authService.getBackupSettings().subscribe({
      next: (res) => {
        this.settings = { ...this.settings, ...res };
        this.viewMode = !!this.settings.folderPath;
      },
      error: () => this.showMessage('Failed to load settings.', 'error')
    });
  }

  loadHistory(): void {
    this.loadingHistory = true;
    this.authService.getBackupHistory().subscribe({
      next: (res) => { this.history = res || []; this.loadingHistory = false; },
      error: () => this.loadingHistory = false
    });
  }

    saveSettings(): void {
    if (!this.settings.folderPath) {
      Swal.fire({ icon: 'warning', title: 'Folder required', text: 'Please select a backup folder before saving.' });
      return;
    }
    this.saving = true;
    this.authService.saveBackupSettings(this.settings).subscribe({
      next: () => {
        this.saving = false;
        this.viewMode = true;
        Swal.fire({ icon: 'success', title: 'Saved!', text: 'Backup settings saved successfully.', timer: 2000, showConfirmButton: false });
      },
      error: () => {
        this.saving = false;
        Swal.fire({ icon: 'error', title: 'Save failed', text: 'Could not save backup settings. Please try again.' });
      }
    });
  }

   runNow(): void {
    this.running = true;
    this.authService.runBackupNow().subscribe({
      next: (res) => {
        this.running = false;
        Swal.fire({ icon: 'success', title: 'Backup Completed', text: `Backup finished successfully (${res.sizeMB} MB).` });
        this.loadHistory();
        this.loadSettings();
      },
      error: () => {
        this.running = false;
        Swal.fire({ icon: 'error', title: 'Backup Failed', text: 'Backup could not be completed. Check settings and try again.' });
        this.loadHistory();
      }
    });
  }

  openFolderBrowser(): void {
  this.showFolderBrowser = true;
  this.browseFolder(this.settings.folderPath || '');
}

browseFolder(path: string): void {
  this.authService.browseBackupFolders(path).subscribe({
    next: (res) => { this.currentBrowsePath = res.currentPath; this.folderList = res.folders || []; },
    error: () => this.showMessage('Could not open that folder.', 'error')
  });
}

goUp(): void {
  if (!this.currentBrowsePath) return; // already at This PC
  this.browseFolder(this.getParentPath(this.currentBrowsePath));
}

goToThisPC(): void {
  this.browseFolder('');
}

private getParentPath(path: string): string {
  const trimmed = path.endsWith('\\') ? path.slice(0, -1) : path;
  if (/^[A-Za-z]:$/.test(trimmed)) return ''; // "D:" -> This PC
  const idx = trimmed.lastIndexOf('\\');
  if (idx === -1) return '';
  const parent = trimmed.substring(0, idx);
  return /^[A-Za-z]:$/.test(parent) ? parent + '\\' : parent;
}

      selectFolder(): void {
    this.settings.folderPath = this.currentBrowsePath;
    this.showFolderBrowser = false;
  }

  editSettings(): void {
    this.viewMode = false;
  }

  deleteSettings(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Remove backup configuration?',
      text: 'This will disable automatic backup and clear all saved settings.',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      confirmButtonColor: '#ef4444'
    }).then((result) => {
      if (result.isConfirmed) {
        const resetSettings: BackupSettings = {
          enabled: false,
          frequency: 'Daily',
          time: '00:00',
          dayOfWeek: 0,
          dayOfMonth: 1,
          folderPath: '',
          retentionDays: 1,
          emailEnabled: false
        };
        this.authService.saveBackupSettings(resetSettings).subscribe({
          next: () => {
            this.settings = resetSettings;
            this.viewMode = false;
            Swal.fire({ icon: 'success', title: 'Deleted', text: 'Backup configuration removed.', timer: 1800, showConfirmButton: false });
          },
          error: () => Swal.fire({ icon: 'error', title: 'Failed', text: 'Could not remove configuration.' })
        });
      }
    });
  }

  cancelFolderBrowser(): void {
    this.showFolderBrowser = false;
  }
       formatRunTime(value?: any): string {
    if (!value) return '-';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '-';

    const day = d.getDate().toString().padStart(2, '0');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = d.getMinutes().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 5000);
  }
}