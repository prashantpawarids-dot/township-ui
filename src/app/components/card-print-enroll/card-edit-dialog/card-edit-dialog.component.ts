import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { CardEditDetail } from '../../../models/common.model';

@Component({
  selector: 'app-card-edit-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatDialogModule, MatButtonModule,
    MatInputModule, MatFormFieldModule, MatTableModule
  ],
  templateUrl: './card-edit-dialog.component.html',
  styleUrls: ['./card-edit-dialog.component.scss']
})
export class CardEditDialogComponent {

  accessPointColumns = ['id', 'accessPoint', 'action'];

  constructor(
    public dialogRef: MatDialogRef<CardEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CardEditDetail
  ) {}

  saveAndPrint(): void {
    alert(`✅ Saved & Print triggered for: ${this.data.cardHolder}\nCSN: ${this.data.cardCSN}`);
    this.dialogRef.close(true);
  }

  blockAccessPoint(id: number): void {
    if (confirm(`Block access point ID ${id}?`)) {
      this.data.accessPoints = this.data.accessPoints.filter(ap => ap.id !== id);
    }
  }

  close(): void { this.dialogRef.close(false); }
}