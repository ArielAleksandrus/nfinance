import { Expense } from '../models/expense';
import { Card } from '../models/card';
import { GeneralInfo } from '../models/general-info';

export abstract class Parser {
	cards: Card[] = [];
	expenses: Expense[] = [];
	general_info: GeneralInfo|null = null;

	constructor() {

	}

	getGeneralInfo(): GeneralInfo|null { return this.general_info };
	getExpenses(): Expense[] { return this.expenses };
	getCards(): Card[] { return this.cards };
}