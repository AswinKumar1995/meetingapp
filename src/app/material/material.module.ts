import { NgModule } from '@angular/core';
import {MatButtonModule, MatToolbarModule,MatTableModule,MatInputModule, MatSortModule, MatPaginatorModule, MatIconModule, MatTooltipModule, MatCardModule, MatSlideToggleModule, MatListModule, MatMenuModule, MatBadgeModule, MatSpinner, MatProgressSpinnerModule, MatCheckbox, MatCheckboxModule, MatDialogModule, MatTreeModule, MatTabsModule, MatAccordion, MatExpansionModule, MatSidenavModule, MatGridListModule, MatSelectModule} from '@angular/material'
import {MatFormFieldModule} from '@angular/material/form-field';

//this is used to import all material angular components to be used in the project
const MaterialComponents = [
  MatProgressSpinnerModule,
  MatSidenavModule,
  MatExpansionModule,
  MatTabsModule,
  MatTreeModule,
  MatDialogModule,
  MatCheckboxModule,
  MatButtonModule,
  MatToolbarModule,
  MatTableModule,
  MatFormFieldModule,
  MatInputModule,
  MatSortModule,
  MatPaginatorModule,
  MatSelectModule,
  MatInputModule,
  MatIconModule,
  MatTooltipModule,
  MatSlideToggleModule,
  MatCardModule,
  MatListModule,
  MatMenuModule,
  MatBadgeModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  MatGridListModule
]


@NgModule({
  declarations: [],
  imports: [
    MaterialComponents
  ],
  exports:[
    MaterialComponents
  ]
})
export class MaterialModule { }
