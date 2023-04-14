import { Card } from './card';

export class Expense {
	date: string;
	value: number;
	place: string;
	place_description: string;
	total_installments: number|null;
	cur_installment: number|null;
	card: Card|null;

	// user interaction
	categorized: boolean;

	constructor(date: string, value: number, place: string, place_description: string,
							total_installments: number = 1, cur_installment: number = 1, 
							card: Card|null = null, categorized: boolean = false) {
		this.date = date;
		this.value = value;
		this.place = place;
		this.place_description = place_description;
		this.total_installments = total_installments;
		this.cur_installment = cur_installment;
		this.card = card;
		this.categorized = categorized;
	}
}
export class ExpenseCategory {
	expense: Expense;

	filter_type: 'matches'|'begins_with'|'ends_with'|'contains';
	term: string|null;

	tag_as: string[];

	constructor(expense: Expense, tag_as: string[], filter_type: 'matches'|'begins_with'|'ends_with'|'contains', term: string) {
		this.expense = expense;
		this.tag_as = tag_as;
		this.filter_type = filter_type;
		this.term = term;
	}
}