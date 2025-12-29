import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
@Component({
  selector: 'app-add-new-user',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MaterialModule],
  templateUrl: './add-new-user.component.html',
  styleUrl: './add-new-user.component.scss'
})
export class AddNewUserComponent implements OnInit {

  dialogRef = inject(MatDialogRef<AddNewUserComponent>);
  addData: { id: string} = { id: ''

  };

  save() {
    console.log("User data saved"); // Replace with actual save logic
    this.dialogRef.close();
  }

  onCancel() {
    console.log('Cancel button clicked');
    this.dialogRef.close();
  }

  constructor() {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
