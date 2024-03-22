import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslationComponent } from './features/translation/translation.component';
import { FileSizePipe } from './pipe/file-size.pipe';
import { HttpClientModule } from '@angular/common/http';
import { ComparisonComponent } from './features/comparison/comparison.component';

@NgModule({
  declarations: [
    AppComponent,
    TranslationComponent,
    FileSizePipe,
    ComparisonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
