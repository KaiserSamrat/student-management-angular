import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../environments/environment.development';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; // optional, for icons if needed
import { MatFormFieldModule } from '@angular/material/form-field'; // optional, if you're using form fields
import { MatInputModule } from '@angular/material/input';
import { StudentService } from '../services/student.service';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

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
  address: string
}

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css'],
})
export class StudentComponent implements OnInit {
  // displayedColumns: string[] = ['id', 'name', 'email', 'address', 'action'];
  // dataSource!: MatTableDataSource<any>;

  // @ViewChild(MatSort) sort!: MatSort;
  searchControl = new FormControl('');
  searchTerm: string = '';
  allStudents: Student[] = [];
  students: any[] = [];
  showModal = false;
  deleteModal = false;
  isLoading = false
  deleteLoading=false
  studentToDeleteId: number | null = null;

  newStudent = {
    id: 0,
    name: '',
    email: '',
    address: '',
  };

  constructor( private studentService: StudentService, private toastr: ToastrService) {}

  openModal() {
    this.showModal = true;
     this.isLoading = false
  }

  closeModal() {
    this.showModal = false;
    this.newStudent = { id: 0, name: '', email: '', address: '' };
  }

  showUpdateModal = false;
  selectedStudent: Student |any = null;

  openUpdateModal(student: StudentPayload) {
    this.selectedStudent = { ...student };
    this.showUpdateModal = true;
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
    this.selectedStudent = null;
  }
  closeDeleteModal() {
    this.deleteModal = false;
    this.studentToDeleteId = null;
  }
  deleteConfiramationModal(studentId: number) {
    this.studentToDeleteId = studentId;
    this.deleteModal = true;
  }
   ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(1000), 
      distinctUntilChanged(), 
      switchMap((term:any) => {
        this.isLoading = true;
        return this.studentService.searchUsers(term);
      })
    ).subscribe((data) => {
      this.students = data
      this.isLoading = false;
    });

    this.studentService.getStudents().subscribe((data) => {
      this.students = data
    });
  }

 saveStudent() {
    this.isLoading = true;
    this.studentService.addStudent(this.newStudent).subscribe({
      next: (response: StudentPayload) => {
        this.students.push({ ...this.newStudent, id: response.id });
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
    this.studentService.updateStudent(this?.selectedStudent?.id, this.selectedStudent).subscribe({
      next: (updatedStudent: StudentPayload) => {
        const index = this.students.findIndex(s => s.id === this?.selectedStudent?.id);
        if (index !== -1) {
          this.students[index] = { ...this.selectedStudent };
        }
        this.toastr.success('Student updated successfully');
        this.closeUpdateModal();
      },
      error: (err) => {
        console.error('Update failed:', err);
      },
    });
  }


  filterStudents() {
    const term = this.searchTerm.toLowerCase();
    this.students = this.allStudents.filter((student) =>
      student.name.toLowerCase().includes(term)
    );
  }
   deleteStudent() {
    this.deleteLoading = true;
    if (this.studentToDeleteId !== null) {
      this.studentService.deleteStudent(this.studentToDeleteId).subscribe({
        next: () => {
          this.students = this.students.filter(s => s.id !== this.studentToDeleteId);
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
