// // project import
// import { Component, OnInit } from '@angular/core';
// import { Router, RouterLink } from '@angular/router';
// //import { AuthService } from '../../../services/auth.service';  
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
// import { AuthService } from 'src/app/services/auth.service';
// import { ErrorHandlerService } from 'src/app/services/error-handler.service';


// @Component({
//   selector: 'app-auth-login',
//   imports: [RouterLink, FormsModule, ReactiveFormsModule],
//   templateUrl: './auth-login.component.html',
//   styleUrl: './auth-login.component.scss'
// })
// export class AuthLoginComponent implements OnInit{

//   loginForm: FormGroup;

//   constructor(
//     private fb: FormBuilder,
//     private router: Router,
//     private authService: AuthService,
//     private errorHandlerService: ErrorHandlerService
//   ) {
//     this.loginForm = this.fb.group({
//       email: ['', [Validators.required]],
//       password: ['', Validators.required]

//     });
//   }

//   ngOnInit(): void {
//     this.clearAllLocalStorage();
//   }


//   //submit button function added by NB

//   onSubmit() {
//     if(this.loginForm.valid) {
//       this.authService.postAuthLogin(this.loginForm.value).subscribe({
//       next: (res) => {
//         this.setLocalstorage((res[0]));
//         this.router.navigate(['/dashboard']);
//       },
//       error: (err: any) => {
//         this.errorHandlerService.handleError(err);
//         this.clearAllLocalStorage();
//       }
//     });
//     }
//   }

//   setLocalstorage(user) {
//     localStorage.setItem("name", user.name);
//     localStorage.setItem("companyID", user.companyID);
//     localStorage.setItem("companyName", user.company);
//     localStorage.setItem("email", user.email);
//     localStorage.setItem("uid", user.uid);
//     localStorage.setItem("loginTime", new Date().toISOString());
//     localStorage.setItem("role", "true");
//   }

//   clearAllLocalStorage() {
//     localStorage.clear()
//   }
// }



//new code 


// project import
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
//import { AuthService } from '../../../services/auth.service';  
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
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


  //submit button function added by NB

  onSubmit() {
  if (this.loginForm.valid) {
    this.authService.postAuthLogin(this.loginForm.value).subscribe({
      next: (res) => {
        if (res && res.length > 0) {
          this.setLocalstorage(res[0]);
          this.router.navigate(['/dashboard']);
          Swal.fire({
            icon: 'success',
            title: 'Login Successful',
            text: 'Welcome!',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Login Failed',
            text: 'Please enter correct credentials',
            confirmButtonColor: '#3085d6'
          });
          this.clearAllLocalStorage();
        }
      },
      error: (err: any) => {
        if (err.status === 401) {
          Swal.fire({
            icon: 'error',
            title: 'Unauthorized',
            text: 'Invalid User ID or Password',
            confirmButtonColor: '#d33'
          });
        } else if (err.error && typeof err.error === 'string') {
          const errorMessage = err.error.toLowerCase();
          if (errorMessage.includes('user') || errorMessage.includes('uid')) {
            Swal.fire({
              icon: 'error',
              title: 'Login Error',
              text: 'User ID is incorrect',
              confirmButtonColor: '#d33'
            });
          } else if (errorMessage.includes('password')) {
            Swal.fire({
              icon: 'error',
              title: 'Login Error',
              text: 'Password is incorrect',
              confirmButtonColor: '#d33'
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Login Failed',
              text: 'Please enter correct credentials',
              confirmButtonColor: '#3085d6'
            });
          }
        } else {
          Swal.fire({
            icon: 'warning',
            title: 'Login Failed',
            text: 'Please enter correct credentials',
            confirmButtonColor: '#3085d6'
          });
        }
        this.clearAllLocalStorage();
      }
    });
  } else {
    Swal.fire({
      icon: 'info',
      title: 'Missing Information',
      text: 'Please fill in both User ID and Password',
      confirmButtonColor: '#3085d6'
    });
  }
}


  setLocalstorage(user) {
    localStorage.setItem("name", user.name);
    localStorage.setItem("companyID", user.companyID);
    localStorage.setItem("companyName", user.company);
    localStorage.setItem("email", user.email);
    localStorage.setItem("uid", user.uid);
    localStorage.setItem("loginTime", new Date().toISOString());
    localStorage.setItem("role", "true");
    localStorage.setItem("roleid",user.roleID);
  }

  clearAllLocalStorage() {
    localStorage.clear()
  }
}