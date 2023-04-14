import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(private router: Router,
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
    
    console.log(this.itau);
  }

  activeChanged(card: Card) {
    this.saveChanges();
    this._cardChanges();
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
