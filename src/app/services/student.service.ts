// src/app/services/student.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { StudentPayload } from '../student/student.component';
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
@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private baseUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.baseUrl);
  }

  addStudent(student: StudentPayload): Observable<any> {
    return this.http.post(this.baseUrl, student);
  }

  updateStudent(id: number, student: StudentPayload): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, student);
  }

  deleteStudent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  getStudentById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
  searchUsers(query: string): Observable<Student[]> {
  return this.http.get<any[]>(`${this.baseUrl}?name_like=${query}`);
}
  searchEmail(query: string): Observable<Student[]> {
  return this.http.get<any[]>(`${this.baseUrl}?email_like=${query}`);
}
}
