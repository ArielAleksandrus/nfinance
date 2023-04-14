import { Component, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


import { Itaucard } from '../parsers/itaucard';

import { Card } from '../models/card';
import { Expense, ExpenseCategory } from '../models/expense';

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
      console.log(data);
    });
  }

  saveChanges() {
    if(!this.key) {
      alert("Este documento não foi localizado");
      return;
    }
    sessionStorage.setItem(this.key, JSON.stringify(this.itau));
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
  filter: any = 'matches';
  tag_as: string = '';
  constructor(public dialogRef: MatDialogRef<CategoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {expense: Expense}) {}

  onSend() {
    let termEl: any = document.getElementById('termEl');
    this.term = termEl.value;
    let tagAsEl: any = document.getElementById('tagAsEl');
    this.tag_as = tagAsEl.value;
    this.dialogRef.close({
      term: this.term,
      filter: this.filter,
      tag_as: this.tag_as
    });
  }
}