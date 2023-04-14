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