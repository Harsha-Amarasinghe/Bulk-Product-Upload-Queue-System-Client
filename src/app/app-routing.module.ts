import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductUploadComponent } from './components/product-upload/product-upload.component';

const routes: Routes = [
  {path:'dashboard', component:ProductUploadComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
