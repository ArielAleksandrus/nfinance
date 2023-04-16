import { Component, ViewChild } from '@angular/core';
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
  refreshCat: boolean = false;

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
      for(let i = 0; i < this.categories.length; i++) {
        let cat = this.categories[i]; // not instantiated
        this.categories[i] = new ExpenseCategory(cat.tag_as, cat.filter_type, cat.term || '<none>');
        if(this.parser)
          this.categories[i].applyToAllExpenses(this.parser.expenses);
        this.categories[i].applyToAllExpenses(this.auxExpenses);
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

  seeStats() {
    this.router.navigate(['estatisticas', this.key]);
  }

  saveChanges() {
    if(!this.key) {
      alert("Este documento não foi localizado");
      return;
    }
    sessionStorage.setItem(this.key, JSON.stringify(this.parser));
  }

  private _categoryCreated(data: {term: string, filter: FilterType, tag_as: string[]}, idx: number|null = null) {
    for(let i = 0; i < data.tag_as.length; i++) {
      if(data.tag_as[i].length == 0) {
        data.tag_as.splice(i,1);
        i--;
      }
    }
    let cat = new ExpenseCategory(data.tag_as, data.filter, data.term);
    if(idx != null) {
      this.categories.splice(idx, 0, cat);
    } else {
      this.categories.push(cat);
    }
    this._applyCategory(cat);
  }
  private _categoryEdited(uuid: string, data: {term: string, filter: FilterType, tag_as: string[], remove: boolean}) {
    let idx = this._removeCategory(uuid, !data.remove);
    if(!data.remove) {
      this._categoryCreated(data, idx);
    }
  }
  private _removeCategory(uuid: string, save: boolean = true): number {
    let cat: ExpenseCategory = Utils.findById(this.categories, uuid, 'uuid');
    let idx = this.categories.indexOf(cat);
    this.categories.splice(idx, 1);
    this._applyCategory(cat, true, save);
    return idx;
  }

  private _applyCategory(cat: ExpenseCategory, removal: boolean = false, save: boolean = true) {
    if(this.parser)
      cat.applyToAllExpenses(this.parser.expenses, removal);

    cat.applyToAllExpenses(this.auxExpenses, removal);

    if(save)
      localStorage.setItem('categories', JSON.stringify(this.categories));

    this.refreshCat = true;
    setTimeout(() => {
      this.refreshCat = false;
    }, 500);
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