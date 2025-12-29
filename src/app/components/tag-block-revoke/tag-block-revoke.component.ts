import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';

@Component({
  selector: 'app-tag-block-revoke',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    MatNativeDateModule,
    MatButtonModule,
    MatRadioModule,
    MaterialModule
  ],
  templateUrl: './tag-block-revoke.component.html',
  styleUrl: './tag-block-revoke.component.scss'
})
export class TagBlockRevokeComponent {

  tagForm: FormGroup;

  searchType: string = '';

  searchByOptions = [
    { name: 'Card Number' },
    { name: 'Employee ID' },
    { name: 'Visitor Name' },
    // add more options as needed
  ];

  cardTypes = [
    { value: 'Resident', label: 'Resident' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'Service provider', label: 'Service provider' },
    { value: 'Contractor Employee', label: 'Contractor Employee' },
    { value: 'Nanded Employee', label: 'Nanded Employee' },
    { value: 'Land Owner', label: 'Land Owner' },
    { value: 'Guest', label: 'Guest' }
  ];

  constructor(private fb: FormBuilder) {
    this.tagForm = this.fb.group({
      liableType: [''],
      cardType: [''],
      searchType: [''],
      searchData: ['']
    });
  }

  showAll() {
    console.log('Form Values:', this.tagForm.value);
  }

  search(){
    console.log('Form Values:', this.tagForm.value);
  }

  save(){
    console.log('Form Values:', this.tagForm.value);
  }



}
