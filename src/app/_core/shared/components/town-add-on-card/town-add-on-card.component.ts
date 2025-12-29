import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, Output, ViewChild, EventEmitter, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { MatDialog } from '@angular/material/dialog';
import { AddonDetailsComponent } from '../../dialogs/addon-details/addon-details.component';
import { DomSanitizer } from '@angular/platform-browser';
import { AddonCard } from 'src/app/models/common.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-town-add-on-card',
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './town-add-on-card.component.html',
  styleUrl: './town-add-on-card.component.scss'
})
export class TownAddOnCardComponent {

  @ViewChild('addonphoto')
  addonphoto: ElementRef;

  files: File[] = [];

  @Input() addonCard: AddonCard;
  @Input() dataSource;
  @Input() tenantType!: number;
  @Output() addonTable: EventListener
  @Output() addonEvent = new EventEmitter<any>();
  @Output() addonEventUpdate = new EventEmitter<any>();
  @Output() addonEventDelete = new EventEmitter<any>();

  // displayedColumns: string[] = ['srno', 'id', 'photo', 'fname', 'mname', 'lname',
  //   'gender', 'blood', 'dob', 'mobile', 'pan', 'licence', 'passport', 'aadhar', 'voter', 'actions'];
  displayedColumns: string[] = ['srno', 'id', 'fname', 'mname', 'lname',
    'mobile', 'actions'];

  @Input() dataToDisplay;

  addonDialog = inject(MatDialog);
  cd = inject(ChangeDetectorRef);
  bloodGroupOptions: string[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  selectedFile: File | null = null;
  photoPreview: string | ArrayBuffer | null = null;

  constructor(private sanitizer: DomSanitizer, private authService: AuthService) {

  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    // console.log('dataToDisplay', this.dataToDisplay);
    
    this.dataToDisplay.forEach((data, index) => {
      data.srno = (index + 1).toString();
    });
    this.dataSource.setData(this.dataToDisplay);
    this.cd.detectChanges();
    // this.getImage(this.addonCard.idNumber)
 if (this.addonCard.idNumber && this.addonCard.idNumber !== '0') {
      this.getImage(this.addonCard.idNumber)
    }
  }
  onClickAddon() {
    if (this.addonphoto)
      this.addonphoto.nativeElement.click()
  }

  getImage(idNumber: string) {
    this.authService.getImage(idNumber).subscribe({
      next: (event: any) => {
        if (event.base64) {
          this.photoPreview = event.base64;

        }
      },
      error: (err) => {
        console.error('Upload failed:', err);
      }
    });
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadFile()
    }
  }
  // onFileSelected(event) {
  //   const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;
  //   for (let i = 0; i < files.length; i++) {
  //     const file = files[i];

  //     //if(!this.isFileSelected(file)){
  //     if (this.validate(file)) {
  //       //      if(this.isImage(file)) {
  //       file.objectURL = this.sanitizer.bypassSecurityTrustUrl((window.URL.createObjectURL(files[i])));
  //       //      }
  //       if (!this.isMultiple()) {
  //         this.files = []
  //       }
  //       this.files.push(files[i]);
  //       //  }
  //     }
  //     //}
  //   }
  // }
  uploadFile() {
    if (!this.selectedFile) return;
    this.showImageOnScreen()
    if (!Number(this.addonCard.idNumber)) {
      this.addonCard.photo = this.selectedFile
      return;
    }
    this.authService.uploadImage(this.selectedFile, this.addonCard.idNumber);
  }

  showImageOnScreen() {
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result;
      // this.addonCard.photo = reader.result as string

    };
    reader.readAsDataURL(this.selectedFile);
  }

  removeFile(event, file) {
    let ix
    if (this.files && -1 !== (ix = this.files.indexOf(file))) {
      this.files.splice(ix, 1)
      this.clearInputElement()
    }
  }

  validate(file: File) {
    for (const f of this.files) {
      if (f.name === file.name
        && f.lastModified === file.lastModified
        && f.size === f.size
        && f.type === f.type
      ) {
        return false
      }
    }
    return true
  }

  clearInputElement() {
    this.addonphoto.nativeElement.value = ''
  }

  isMultiple(): boolean {
    return false
  }

  addData() {
    if (this.photoPreview) {
      this.addonCard.photo = this.photoPreview as string;
    }
    this.addonEvent.emit(this.addonCard)
    this.addonCard = new AddonCard();
    //add local record logic
    // const srno = this.dataToDisplay.length + 1;
    // this.addonCard.srno = srno.toString();
    // this.dataToDisplay = [...this.dataToDisplay, this.addonCard];
    // this.dataSource.setData(this.dataToDisplay);
    // this.addonEvent.emit(this.addonCard)
    // this.addonCard = new AddonCard();
  }

  // removeData(data) {
  //   // local delete logic 
  //   // this.dataToDisplay = this.dataToDisplay.filter(x => x.srno !== data.srno);
  //   // this.dataSource.setData(this.dataToDisplay);
  //   this.addonEventDelete.emit(data);
  // }

  editData(data) {
    const addondialogRef = this.addonDialog.open(AddonDetailsComponent, {
      maxWidth: '100%',
      width: '960px',

    });
    addondialogRef.componentInstance.addonData = data;
    addondialogRef.componentInstance.isView = false;
    addondialogRef.componentInstance.tenantType = this.tenantType;
    addondialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this.photoPreview) {
          result.photo = this.photoPreview as string;
        }
        this.addonEventUpdate.emit(result);

        //local update logic
        // const index = this.dataToDisplay.findIndex(x => x.srno === result.srno);
        // this.dataToDisplay[index] = result;
        // this.dataSource.setData(this.dataToDisplay);
      }
    });
  }

  openAddonDialog(data) {
    const addondialogRef = this.addonDialog.open(AddonDetailsComponent, {
      maxWidth: '100%',
      width: '960px',

    });
    addondialogRef.componentInstance.addonData = data;

  }

}
