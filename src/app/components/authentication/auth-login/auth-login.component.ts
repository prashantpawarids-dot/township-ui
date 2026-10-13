
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { AuthorityService } from 'src/app/services/authority.service';  // ✅ ADD
import Swal from 'sweetalert2';


@Component({
  selector: 'app-auth-login',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent implements OnInit{

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private authorityService: AuthorityService, // ✅ ADD
    private errorHandlerService: ErrorHandlerService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.clearAllLocalStorage();
  }

// Helper to map roleID → profileName (MATCH SQL EXACTLY)
// getProfileName(roleID: number): string {
//   switch (roleID) {
//     case 1: return 'admin';   // ⚠ must match DB
//     case 2: return 'manager';
//     case 3: return 'user';
//     default: return '';
//   }
// }

onSubmit() {
  // 1️⃣ Check if form is valid
  if (!this.loginForm.valid) {
    Swal.fire({
      icon: 'info',
      title: 'Missing Information',
      text: 'Please fill in both User ID and Password'
    });
    return;
  }

  // 2️⃣ Call login API
  this.authService.postAuthLogin(this.loginForm.value).subscribe({
    next: (res: any[]) => {
      // console.log('🔵 LOGIN RESPONSE:', res);

      if (!res || res.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Failed',
          text: 'Invalid credentials'
        });
        return;
      }

      // 3️⃣ Extract user
      const user = res[0];

      // console.log('🟢 LOGGED USER:', user);

      // 4️⃣ Set profileName from roleID
      // user.profileName = this.getProfileName(user.roleID);
      user.Name = user.name;
      // console.log('UserName NAME:', user.Name);

    
      this.setLocalstorage(user);

      
      this.authService.getAuthorityModules(user.Name).subscribe({
        next: (authModules: any[]) => {
          // console.log('🔵 AUTH MODULES FROM SQL (RAW):');
          // console.table(authModules);

          // 7️⃣ Map to authority service format
          // const mappedAuthorities = authModules.map(m => ({
          //   moduleKey: m.moduleKey,          // Use exact API property
          //   authorityLevel: m.authorityLevel     // match exact case
          // }));

// DEBUG — see exact field names from API
// console.log('RAW FIRST MODULE:', JSON.stringify(authModules[0]));
const mappedAuthorities = authModules.map(m => ({
  moduleKey:  m.moduleKey,
  canInsert:  m.canInsert,
  canUpdate:  m.canUpdate,
  canDelete:  m.canDelete,
  canView:    m.canView
}));

// console.log('MAPPED FIRST:', JSON.stringify(mappedAuthorities[0]));
          // console.log('🟢 MAPPED AUTHORITIES (FOR UI):');
          // console.table(mappedAuthorities);

          // 8️⃣ Load into AuthorityService
          this.authorityService.loadAuthorities(mappedAuthorities);

          // 9️⃣ Save in localStorage for quick access
          localStorage.setItem('authorities', JSON.stringify(mappedAuthorities));

          //  🔟 Show success and navigate
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            timer: 1500,
            showConfirmButton: false
          });

          // this.router.navigate(['/dashboard']);

          const hasAnyAccess = authModules.some(m => m.canView === true);
if (!hasAnyAccess) {
  Swal.fire({ icon: 'warning', title: 'No Access', text: 'You have no module permissions. Contact Admin.' });
  return;
}
this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('❌ AUTH LOAD ERROR:', err);
          Swal.fire({
            icon: 'error',
            title: 'Failed to load permissions',
            text: err.message || 'Please try again'
          });
        }
      });
    },
    error: (err) => {
      console.error('❌ LOGIN ERROR:', err);
      Swal.fire({
        icon: 'error',
        title: 'Login Error',
        text: err.message || 'Check credentials'
      });
    }
  });
}



  setLocalstorage(user) {
    localStorage.setItem("id",user.id);
    localStorage.setItem("Name", user.name);
    localStorage.setItem("companyID", user.companyID);
    localStorage.setItem("companyName", user.company || '');
    localStorage.setItem("email", user.email);
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("loginTime", new Date().toISOString());
    localStorage.setItem("role", "true");
    localStorage.setItem("roleid",user.roleID);

    // ✅ store mapped profileName
    localStorage.setItem("profileName", user.profileName);
  }

  clearAllLocalStorage() {
    localStorage.clear()
  }
}

