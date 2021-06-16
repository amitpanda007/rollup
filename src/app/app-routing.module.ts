import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RollUpComponent } from './rollup/rollup.component';

const routes: Routes = [
  { path: '', component: RollUpComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
