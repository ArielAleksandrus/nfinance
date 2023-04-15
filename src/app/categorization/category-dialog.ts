import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Expense, ExpenseCategory, FilterType } from '../models/expense';

import { Utils } from '../helpers/utils';

@Component({
  selector: 'category-dialog',
  templateUrl: 'category-dialog.html',
})
export class CategoryDialog {
  filtersList: any[] = ['matches', 'begins_with', 'ends_with', 'contains'];
  filtersLabel: any[] = ['todos dessa loja', 'começa com', 'termina com', 'contém a palavra'];
  term: string = '';
  filter: FilterType = 'matches';
  tag_as: string[] = ['','',''];

  termEl: any;
  tagAsEl1: any;
  //tagAsEl2: any;
  //tagAsEl3: any;

  constructor(public dialogRef: MatDialogRef<CategoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {expense: Expense, category: ExpenseCategory}) {
  }

  ngOnInit() {
    this.termEl = document.getElementById('termEl');
    this.tagAsEl1 = document.getElementById('tagAsEl1');
    //this.tagAsEl2 = document.getElementById('tagAsEl2');
    //this.tagAsEl3 = document.getElementById('tagAsEl3');

    if(this.data.category) { // we are editing a category
      this.termEl.value = this.data.category.term;
      this.tagAsEl1.value = this.data.category.tag_as[0];
      this.filter = this.data.category.filter_type;
    } else if(this.data.expense) { // we are creating a category
      this.termEl.value = this.data.expense.place;
    }
  }

  onSend() {
    this.term = this.termEl.value;
    this.tag_as[0] = this.tagAsEl1.value;
    //this.tag_as[1] = this.tagAsEl2.value;
    //this.tag_as[2] = this.tagAsEl3.value;
    this.dialogRef.close({
      term: this.term,
      filter: this.filter,
      tag_as: this.tag_as
    });
  }
  onRemove() {
    this.dialogRef.close({
      remove: true
    });
  }
}