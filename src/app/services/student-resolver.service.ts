// src/app/services/student-resolver.service.ts
import { Injectable } from '@angular/core';
import {
  Resolve,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { StudentService } from './student.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
// export class StudentResolverService implements Resolve<any> {
//   constructor(private studentService: StudentService) {}

//   resolve(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): Observable<any> {
//     const id = route.paramMap.get('id');
//     if (!id) {
//       return of(null); 
//     }
//     return this.studentService.getStudentById(+id).pipe(
//       catchError((err) => {
//         console.error('Resolver error', err);
//         return of(null);
//       })
//     );
//   }
// }
export class StudentResolverService implements Resolve<any>{
  constructor(private studentService: StudentService){

  }
  resolve(route:ActivatedRouteSnapshot, state:RouterStateSnapshot):Observable<any>{
    const id = route.paramMap.get("id")
     if (!id) {
      return of(null); 
    }
    return this.studentService.getStudentById(+id).pipe(
      catchError((err)=>{
        console.log("error", err);
        return of(null);
        
      })

    )
  }
}
