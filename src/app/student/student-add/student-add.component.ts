import { Component } from '@angular/core';
import { StudentComponent } from '../student.component';
import {
  AbstractControlOptions,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { emailExistsValidator } from '../../validators/emailValidator';
import { StudentService } from '../../services/student.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-student-add',
  imports: [ 
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './student-add.component.html',
  styleUrl: './student-add.component.css',
  standalone: true,
})
export class StudentAddComponent {
  isLoading = false;
  model ="add"
  profileForm!: FormGroup;
  constructor(
    private studentService: StudentService,
    private toastr: ToastrService,
     private router: Router,
     private route: ActivatedRoute 
  ) {}

  ngOnInit() {
     const student = this.route.snapshot.data['studentData'];
    console.log('StudentData', student);
   
    const studentId = this.route.snapshot.paramMap.get('id');
    console.log("studentId", studentId);
    
    
    this.profileForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(4)]),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        asyncValidators: studentId ? [] : [emailExistsValidator(this.studentService)],
        updateOn: 'blur',
      } as AbstractControlOptions),
      id: new FormControl(0, [Validators.required]),
      address: new FormControl(''),
    });
    
   if (student) {
    this.model = 'update';
    this.profileForm.patchValue({
      id: student.id,
      name: student.name,
      email: student.email,
      address: student.address?.city || '',
    });
  }

  }
//   loadStudentData(id: string) {
//   this.studentService.getStudentById(Number(id)).subscribe({
//     next: (student) => {
//       this.profileForm.patchValue({
//         id: student.id,
//         name: student.name,
//         email: student.email,
//         address: student.address?.city || '',
//       });

      
//       this.profileForm.get('id')?.disable();
//     },
//     error: (err) => {
//       console.error('Failed to load student:', err);
//     }
//   });
// }

saveStudent() {
   console.log("hello");
  if (this.profileForm.invalid) {
    this.profileForm.markAllAsTouched();
    return;
  }
 
  

  this.isLoading = true;

  const studentPayload: any = {
    id: this.profileForm.getRawValue().id,
    name: this.profileForm.value.name,
    email: this.profileForm.value.email,
    address: {
      city: this.profileForm.value.address
    }
  };

  const studentId = this.route.snapshot.paramMap.get('id');

  const request = studentId
    ? this.studentService.updateStudent(Number(studentId),studentPayload) 
    : this.studentService.addStudent(studentPayload);

  request.subscribe({
    next: (response: any) => {
      console.log("response", response);
      
      this.toastr.success(`Student ${studentId ? 'updated' : 'added'} successfully`);
      this.router.navigate(['']);
    },
    error: (err) => {
      console.error('Error:', err);
      this.toastr.error('Something went wrong!');
      this.isLoading = false;
    }
  });
}

}
