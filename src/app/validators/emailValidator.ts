import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, catchError, map, of } from 'rxjs';
import { StudentService } from '../services/student.service'; 

export function emailExistsValidator(studentService: StudentService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return studentService.searchEmail(control.value).pipe(
      map((users) => {
        const exists = users.some(user => user.email === control.value);
        return exists ? { emailExists: true } : null;
      }),
      catchError(() => of(null))
    );
  };
}
