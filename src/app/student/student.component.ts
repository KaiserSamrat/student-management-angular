import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AbstractControlOptions,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StudentService } from '../services/student.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { emailExistsValidator } from '../validators/emailValidator';
import { StudentAddComponent } from './student-add/student-add.component';
import { Router, RouterLink, RouterModule } from '@angular/router';

interface Student {
  id: number;
  name: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
}

export interface StudentPayload {
  id: number;
  name: string;
  email: string;
  address: string;
}

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    RouterModule,
   
  ],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
})
export class StudentComponent implements OnInit {
  dataSource = new MatTableDataSource<Student>();
  displayedColumns: string[] = ['name', 'id', 'email', 'address', 'action'];
  searchControl = new FormControl('');
  isLoading = false;
  deleteLoading = false;
   constructor(
    private studentService: StudentService,
    private toastr: ToastrService,
    private router: Router
  ) {}
 

  showModal = false;
  showUpdateModal = false;
  deleteModal = false;

  studentToDeleteId: number | null = null;

  // newStudent = {
  //   id: 0,
  //   name: '',
  //   email: '',
  //   address: '',
  // };

  selectedStudent: StudentPayload | any = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

 profileForm!: FormGroup;
goToAddStudent() {
  console.log("line 102");
  
  this.router.navigate(['/addStudent']);
}
goToEditStudent(id: number) {
  console.log("id", id);
  
  this.router.navigate(['/edit-student', id]);
}
  ngOnInit() {
     this.profileForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(4)]),
      email: new FormControl('', {
        validators: [Validators.required, Validators.email],
        asyncValidators: [emailExistsValidator(this.studentService)],
        updateOn: 'blur'
      } as AbstractControlOptions),
      id: new FormControl(0, [Validators.required]),
      address: new FormControl(''),
    });
    this.searchControl.valueChanges
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((term: any) => {
          this.isLoading = true;
          return this.studentService.searchUsers(term);
        })
      )
      .subscribe((data) => {
        this.dataSource.data = data;
        this.isLoading = false;
      });

    this.studentService.getStudents().subscribe((data) => {
      this.dataSource.data = data;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  openModal() {
    this.showModal = true;
    this.isLoading = false;
  }

  closeModal() {
    this.showModal = false;
    // this.newStudent = { id: 0, name: '', email: '', address: '' };
  }

  openUpdateModal(student: StudentPayload) {
    this.selectedStudent = { ...student };
    this.showUpdateModal = true;
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
    this.selectedStudent = null;
  }

  deleteConfiramationModal(studentId: number) {
    this.studentToDeleteId = studentId;
    this.deleteModal = true;
  }

  closeDeleteModal() {
    this.deleteModal = false;
    this.studentToDeleteId = null;
  }

  saveStudent() {
    console.log('hello');
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const studentPayload: any = {
      id: this.profileForm.value.id,
      name: this.profileForm.value.name,
      email: this.profileForm.value.email,
    };
    this.studentService.addStudent(studentPayload).subscribe({
      next: (response: StudentPayload) => {
        const updatedData = [...this.dataSource.data, studentPayload];
        this.dataSource.data = updatedData as any;
        this.toastr.success('Student added successfully');
        this.isLoading = false;
        this.closeModal();
      },
      error: (err) => {
        console.error('Error adding student:', err);
        this.isLoading = false;
      },
    });
  }

  updateStudent() {
    console.log("selectedStudent", this.selectedStudent);
    
    this.studentService
      .updateStudent(this.selectedStudent.id, this.selectedStudent)
      .subscribe({
        next: (updatedStudent: StudentPayload) => {
          const updatedData = this.dataSource.data.map((s) =>
            s.id === this.selectedStudent.id ? { ...this.selectedStudent } : s
          );
          this.dataSource.data = updatedData;
          this.toastr.success('Student updated successfully');
          this.closeUpdateModal();
        },
        error: (err) => {
          console.error('Update failed:', err);
        },
      });
  }

  deleteStudent() {
    this.deleteLoading = true;
    if (this.studentToDeleteId !== null) {
      this.studentService.deleteStudent(this.studentToDeleteId).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(
            (s) => s.id !== this.studentToDeleteId
          );
          this.deleteLoading = false;
          this.toastr.success('Student deleted successfully');
          this.closeDeleteModal();
        },
        error: (err) => {
          console.error('Error deleting student:', err);
          this.deleteLoading = false;
        },
      });
    }
  }
}
