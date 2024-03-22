import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComparisonComponent } from './features/comparison/comparison.component';
import { TranslationComponent } from './features/translation/translation.component';

const routes: Routes = [
  { path: '', component: TranslationComponent }, // Index route
  { path: 'comparison', component: ComparisonComponent } // Define the route for the comparison page
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
