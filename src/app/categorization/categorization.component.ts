import { Component, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


import { Itaucard } from '../parsers/itaucard';

import { Card } from '../models/card';
import { Expense, ExpenseCategory, FilterType } from '../models/expense';

import { Utils } from '../helpers/utils';

@Component({
  selector: 'app-categorization',
  templateUrl: './categorization.component.html',
  styleUrls: ['./categorization.component.sass']
})

export class CategorizationComponent {
  key: string|null = null;

  itau: Itaucard|null = null;
  auxExpenses: Expense[] = [];


  cardColumns: string[] = ['holder', 'digits', 'total', 'active'];
  expenseColumns: string[] = ['date', 'place', 'value', 'installment', 'digits'];
  categoriesColumns: string[] = ['filter_type', 'term', 'tag_as'];
  nCardsSelected: number = 0;

  categories: ExpenseCategory[] = [];

  constructor(public dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute) {

    route.params.subscribe(res => {
        this.key = res["key"];
        this.initialize();
      },
      err => {

      },
      () => {}
    );
  }

  initialize() {
    let res = sessionStorage.getItem(this.key || '<none>');
    if(res) {
      let obj = JSON.parse(res);
      this.itau = obj as Itaucard;
      this._cardChanges();
    } else {
      alert("Este documento não foi localizado");
    }

    let res2 = localStorage.getItem('categories');
    if(res2) {
      let obj = JSON.parse(res2);
      this.categories = obj as ExpenseCategory[];
      console.log(this.categories);
      for(let cat of this.categories) {
        cat = new ExpenseCategory(cat.tag_as, cat.filter_type, cat.term || '<none>');
        if(this.itau)
          cat.applyToAllExpenses(this.itau.expenses);
        cat.applyToAllExpenses(this.auxExpenses);
      }
    }
  }

  activeChanged(card: Card) {
    this.saveChanges();
    this._cardChanges();
  }

  clickExpense(exp: Expense) {
    this.openExpenseDialog(exp);
  }

  openExpenseDialog(exp: Expense) {
    this.dialog.open(CategoryDialog, {
      width: '350px',
      enterAnimationDuration: '150ms',
      exitAnimationDuration: '150ms',
      data: {expense: exp}
    }).afterClosed().subscribe(data => {
      this._categoryCreated(data);
    });
  }

  saveChanges() {
    if(!this.key) {
      alert("Este documento não foi localizado");
      return;
    }
    sessionStorage.setItem(this.key, JSON.stringify(this.itau));
  }

  private _categoryCreated(data: {term: string, filter: FilterType, tag_as: string[], expense: Expense}) {
    for(let i = 0; i < data.tag_as.length; i++) {
      if(data.tag_as[i].length == 0) {
        data.tag_as.splice(i,1);
        i--;
      }
    }
    let cat = new ExpenseCategory(data.tag_as, data.filter, data.term);

    if(this.itau)
      cat.applyToAllExpenses(this.itau.expenses);

    cat.applyToAllExpenses(this.auxExpenses);

    this.categories.push(cat);
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  private _cardChanges() {
    if(!this.itau) {
      alert("Este documento não foi tratado. Verifique se há suporte para este banco");
      return;
    }
    this.nCardsSelected = 0;
    this.auxExpenses = [];
    for(let card of this.itau.cards) {
      if(card.active) {
        this.nCardsSelected += 1;
      }
    }
    for(let exp of this.itau.expenses) {
      if(!exp.card) {
        console.error("Expense has no card", exp);
        return;
      }
      let card = Utils.findById(this.itau.cards, exp.card.digits, 'digits');
      if(card.active)
        this.auxExpenses.push(exp);
    }
  }
}

@Component({
  selector: 'category-dialog',
  templateUrl: 'category-dialog.html',
})
export class CategoryDialog {
  filtersList: any[] = ['matches', 'begins_with', 'ends_with', 'contains'];
  filtersLabel: any[] = ['todos dessa loja', 'começa com esta palavra', 'termina com esta palavra', 'contém esta palavra'];
  term: string = '';
  filter: FilterType = 'matches';
  tag_as: string[] = ['','',''];
  constructor(public dialogRef: MatDialogRef<CategoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {expense: Expense}) {}

  onSend() {
    let termEl: any = document.getElementById('termEl');
    this.term = termEl.value;
    let tagAsEl1: any = document.getElementById('tagAsEl1');
    this.tag_as[0] = tagAsEl1.value;
    /*let tagAsEl2: any = document.getElementById('tagAsEl2');
    this.tag_as[1] = tagAsEl2.value;
    let tagAsEl3: any = document.getElementById('tagAsEl3');
    this.tag_as[2] = tagAsEl3.value;*/
    this.dialogRef.close({
      term: this.term,
      filter: this.filter,
      tag_as: this.tag_as,
      expense: this.data.expense
    });
  }
}