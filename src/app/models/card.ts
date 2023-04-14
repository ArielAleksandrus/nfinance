export class Card {
	holder: string;
	digits: string;
	total: number;
	parent: Card|null;

	constructor(holder: string, digits: string, total: number = 0, parent: Card|null = null) {
		this.holder = holder;
		this.digits = digits;
		this.total = total;
		this.parent = parent;
	}
}