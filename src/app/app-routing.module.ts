import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { CategorizationComponent } from './categorization/categorization.component';

const routes: Routes = [{
  path: 'home', component: HomeComponent
}, {
  path: 'categorizar/:key', component: CategorizationComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
