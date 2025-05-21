import { Routes } from '@angular/router';

import { StudentAddComponent } from './student/student-add/student-add.component';
import { StudentComponent } from './student/student.component';
import { StudentResolverService } from './services/student-resolver.service';

export const routes: Routes = [
  { path: '', component: StudentComponent },
  { path: 'addStudent', component: StudentAddComponent },
  {
  path: 'edit-student/:id',
  component: StudentAddComponent,
  resolve: {
      studentData: StudentResolverService,
    },
}
];