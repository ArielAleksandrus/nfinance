import { Card } from './card';

export class Expense {
	date: string;
	value: number;
	place: string;
	place_description: string;
	total_installments: number|null;
	cur_installment: number|null;
	card: Card|null;

	constructor(date: string, value: number, place: string, place_description: string,
							total_installments: number = 1, cur_installment: number = 1, 
							card: Card|null = null) {
		this.date = date;
		this.value = value;
		this.place = place;
		this.place_description = place_description;
		this.total_installments = total_installments;
		this.cur_installment = cur_installment;
		this.card = card;
	}
}
export class ExpenseCategory {
	expense: Expense;
	matches: string|null;
	begins_with: string|null;
	ends_with: string|null;
	contains: string|null;

	tag_as: string[];

	constructor(expense: Expense, tag_as: string[], matches: string|null = null,
							begins_with: string|null = null, ends_with: string|null = null, contains: string|null = null) {
		this.expense = expense;
		this.tag_as = tag_as;
		this.matches = matches;
		this.begins_with = begins_with;
		this.ends_with = ends_with;
		this.contains = contains;
	}
}