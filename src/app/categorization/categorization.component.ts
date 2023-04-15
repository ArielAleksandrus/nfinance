import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CategoryDialog } from './category-dialog';

import { Parser } from '../parsers/parser';

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

  parser: Parser|null = null;
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
      this.parser = obj as Parser;
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
        if(this.parser)
          cat.applyToAllExpenses(this.parser.expenses);
        cat.applyToAllExpenses(this.auxExpenses);
      }
    }
  }

  activeChanged(card: Card) {
    this.saveChanges();
    this._cardChanges();
  }

  clickExpense(obj: Expense) {
    this.dialog.open(CategoryDialog, {
      width: '350px',
      enterAnimationDuration: '150ms',
      exitAnimationDuration: '150ms',
      data: {expense: obj}
    }).afterClosed().subscribe(data => {
      if(data == '') return;
      this._categoryCreated(data);
    });
  }
  clickCategory(obj: ExpenseCategory) {
    this.dialog.open(CategoryDialog, {
      width: '350px',
      enterAnimationDuration: '150ms',
      exitAnimationDuration: '150ms',
      data: {category: obj}
    }).afterClosed().subscribe(data => {
      if(data == '') return;
      this._categoryEdited(obj.uuid, data);
    });
  }

  openExpenseDialog(exp: Expense) {
  }

  saveChanges() {
    if(!this.key) {
      alert("Este documento não foi localizado");
      return;
    }
    sessionStorage.setItem(this.key, JSON.stringify(this.parser));
  }

  private _categoryCreated(data: {term: string, filter: FilterType, tag_as: string[]}) {
    for(let i = 0; i < data.tag_as.length; i++) {
      if(data.tag_as[i].length == 0) {
        data.tag_as.splice(i,1);
        i--;
      }
    }
    let cat = new ExpenseCategory(data.tag_as, data.filter, data.term);

    this._applyCategory(cat);
  }
  private _categoryEdited(uuid: string, data: {term: string, filter: FilterType, tag_as: string[], remove: boolean}) {
    this._removeCategory(uuid);
    if(!data.remove) {
      this._categoryCreated(data);
    }
  }
  private _removeCategory(uuid: string) {
    let cat: ExpenseCategory = Utils.findById(this.categories, uuid, 'uuid');
    console.log(cat);
    if(this.parser) {
      cat.applyToAllExpenses(this.parser.expenses, true);
    }
    cat.applyToAllExpenses(this.auxExpenses, true);
  }

  private _applyCategory(cat: ExpenseCategory) {
    if(this.parser)
      cat.applyToAllExpenses(this.parser.expenses);

    cat.applyToAllExpenses(this.auxExpenses);
    localStorage.setItem('categories', JSON.stringify(this.categories));
  }

  private _cardChanges() {
    if(!this.parser) {
      alert("Este documento não foi tratado. Verifique se há suporte para este banco");
      return;
    }
    this.nCardsSelected = 0;
    this.auxExpenses = [];
    for(let card of this.parser.cards) {
      if(card.active) {
        this.nCardsSelected += 1;
      }
    }
    for(let exp of this.parser.expenses) {
      if(!exp.card) {
        console.error("Expense has no card", exp);
        return;
      }
      let card = Utils.findById(this.parser.cards, exp.card.digits, 'digits');
      if(card.active)
        this.auxExpenses.push(exp);
    }
  }
}