import { Card } from './card';
import { Utils } from '../helpers/utils';

export type FilterType = 'matches'|'begins_with'|'ends_with'|'contains';

export class Expense {
	uuid: string;
	date: string;
	value: number;
	place: string;
	place_description: string;
	total_installments: number|null;
	cur_installment: number|null;
	card: Card|null;
	categories: ExpenseCategory[];

	constructor(date: string, value: number, place: string, place_description: string,
							total_installments: number = 1, cur_installment: number = 1, 
							card: Card|null = null, categories: ExpenseCategory[] = []) {
		this.uuid = URL.createObjectURL(new Blob([])).slice(-36);
		this.date = date;
		this.value = value;
		this.place = place;
		this.place_description = place_description;
		this.total_installments = total_installments;
		this.cur_installment = cur_installment;
		this.card = card;
		this.categories = categories;
	}
}
export class ExpenseCategory {
	uuid: string;

	filter_type: FilterType;
	term: string|null;

	tag_as: string[];

	constructor(tag_as: string[], filter_type: FilterType, term: string) {
		this.uuid = URL.createObjectURL(new Blob([])).slice(-36);
		this.tag_as = tag_as;
		this.filter_type = filter_type;
		this.term = term;
	}

	applyToAllExpenses(expenses: Expense[], removal: boolean = false) {
		if(this.term == null)
			return;

		for(let exp of expenses) {
			let matched = false;
			switch(this.filter_type) {
			case "matches": {
				matched = exp.place == this.term;
				break;
			}
			case "begins_with": {
				matched = exp.place.indexOf(this.term) == 0;
				break;
			}
			case "ends_with": {
				let arr = exp.place.split(this.term);
				matched = arr[arr.length - 1] == '';
				break;
			}
			case "contains": {
				matched = exp.place.indexOf(this.term) > -1;
				break;
			}
			}
			let found = Utils.findById(exp.categories, this.uuid, 'uuid');
			if(matched) {
				if(removal && found) {
					exp.categories.splice(exp.categories.indexOf(found), 1);
				}
				if(!removal && !found) {
					exp.categories.push(this);
				}
			}
		}
	}
}