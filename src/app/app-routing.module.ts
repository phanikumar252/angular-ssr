import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplyJobsResumeComponent } from './apply-jobs/apply-jobs-resume.component';
import { CareersComponent } from './careers/careers.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { VerifyEmailAccountComponent } from './common-component/modals/verify-email-account/verify-email-account.component';
import { MaterialModule } from './shared/material/material.module';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  {
    path: 'jobs/:clientId',
    component: CareersComponent,
    children: [

      { path: 'apply-jobs/:id/:title', component: ApplyJobsResumeComponent },

    ]
  },
  { path: "home", component: HomeComponent }
];

@NgModule({

  imports: [RouterModule.forRoot(routes, {
    initialNavigation: 'enabled'
  }),
    MatFormFieldModule,
    MaterialModule
  ],
  exports: [RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class AppRoutingModule { }
