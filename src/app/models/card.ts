export class Card {
	holder: string;
	digits: string;
	total: number;
	parent: Card|null;

	// user interaction
	active: boolean;

	constructor(holder: string, digits: string, total: number = 0, parent: Card|null = null, active: boolean = true) {
		this.holder = holder;
		this.digits = digits;
		this.total = total;
		this.parent = parent;
		this.active = active;
	}
}