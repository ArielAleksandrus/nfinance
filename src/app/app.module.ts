import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CategorizationComponent } from './categorization/categorization.component';
import { CategoryDialog } from './categorization/category-dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { StatsComponent } from './stats/stats.component';
import { NgChartsModule } from 'ng2-charts';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CategorizationComponent,
    CategoryDialog,
    StatsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PdfViewerModule,
    FormsModule,

    BrowserAnimationsModule,
    MatCardModule,
    MatExpansionModule,
    MatTableModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    NgChartsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
