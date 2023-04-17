import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChartOptions } from 'chart.js';

import { Parser } from '../parsers/parser';

import { Card } from '../models/card';
import { Expense, ExpenseCategory, FilterType } from '../models/expense';
import { PieChart } from '../models/charts/pie-chart';

import { Utils } from '../helpers/utils';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.sass']
})
export class StatsComponent {
  key: string|null = null;

  parser: Parser|null = null;
  categories: ExpenseCategory[] = [];

  categorizedExpenses: Expense[] = [];

  cardStats: {
    card: Card,
    categorized: {
      name: string,
      category: ExpenseCategory,
      expenses: Expense[],
      total: number
    }[]
  }[] = [];
  catStats: {
    cat: ExpenseCategory,
    expenses: Expense[],
    total: number
  }[] = [];

  pieChartsCard: {card: Card, chart: PieChart}[] = [];
  pieChartOptions: ChartOptions<'pie'> = {
    responsive: false
  };
  pieChartPlugins = [];
  pieChartLegend = true;

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
      this.parser = obj as Parser;
    } else {
      alert("Este documento não foi localizado");
    }

    let res2 = localStorage.getItem('categories');
    if(res2) {
      let obj = JSON.parse(res2);
      this.categories = obj as ExpenseCategory[];
      for(let i = 0; i < this.categories.length; i++) {
        let cat = this.categories[i]; // not instantiated
        this.categories[i] = new ExpenseCategory(cat.tag_as, cat.filter_type, cat.term || '<none>');
        if(this.parser)
          this.categories[i].applyToAllExpenses(this.parser.expenses);
      }
    }

    if(!this.parser) {
      return;
    }

    this.filterCategorized();
    this.getCardStats();
    this.getCatStats();
    this._genPieChartCard();
    console.log(this.cardStats);
    console.log(this.pieChartsCard);
  }

  filterCategorized() {
    if(!this.parser)
      return;

    this.categorizedExpenses = [];
    for(let exp of this.parser.expenses) {
      if(exp.categories && exp.categories.length > 0)
        this.categorizedExpenses.push(exp);
    }
  }
  getCardStats() {
    if(!this.parser)
      return;

    this.cardStats = [];
    for(let exp of this.categorizedExpenses) {
      if(exp.card == null) {
        console.error("Despesa inválida pois não possui um cartão atrelado", exp.card);
        return;
      }
      let card = Utils.findById(this.parser.cards, exp.card.uuid, 'uuid');
      let foundCard = Utils.findById(this.cardStats, card, 'card');
      if(!foundCard) {
        this.cardStats.push({
          card: card,
          categorized: [{
            name: exp.categories[0].tag_as[0],
            category: exp.categories[0],
            expenses: [exp],
            total: exp.value
          }]
        });
      } else {
        let foundCat = Utils.findById(foundCard.categorized, exp.categories[0], 'category');
        if(foundCat) {
          foundCat.expenses.push(exp);
          foundCat.total += exp.value;
        } else {
          foundCard.categorized.push({
            name: exp.categories[0].tag_as[0],
            category: exp.categories[0],
            expenses: [exp],
            total: exp.value
          });
        }
      }
    }
  }
  getCatStats() {
    this.catStats = [];
    for(let exp of this.categorizedExpenses) {
      let found = Utils.findById(this.catStats, exp.categories[0], 'cat');
      if(!found) {
        this.catStats.push({
          cat: exp.categories[0],
          expenses: [exp],
          total: exp.value
        });
      } else {
        found.expenses.push(exp);
        found.total += exp.value;
      }
    }
  }

  private _genPieChartCard() {
    this.pieChartsCard = [];
    for(let stat of this.cardStats) {
      let chart = PieChart.fromArray(stat.categorized, 'name', 'total', 2);
      let totalCategorized = 0;
      for(let aux of stat.categorized) {
        totalCategorized += aux.total;
      }
      chart.addValue('Sem Categoria', stat.card.total - totalCategorized);
      this.pieChartsCard.push({card: stat.card, chart: chart});
    }
  }
}
