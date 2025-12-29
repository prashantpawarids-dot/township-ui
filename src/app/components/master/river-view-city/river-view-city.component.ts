import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';



@Component({
  selector: 'app-river-view-city',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './river-view-city.component.html',
  styleUrl: './river-view-city.component.scss'
})
export class RiverViewCityComponent {

  onSave() {
    console.log('Save button clicked');
    // Add your save logic here
  }
  onCancel() {
    console.log('Save button clicked');
    // Add your save logic here
  }
}
