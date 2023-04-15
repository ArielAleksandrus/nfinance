export class Card {
	uuid: string;
	holder: string;
	digits: string;
	total: number;
	parent: Card|null;

	// user interaction
	active: boolean;

	constructor(holder: string, digits: string, total: number = 0, parent: Card|null = null, active: boolean = true) {
		this.uuid = URL.createObjectURL(new Blob([])).slice(-36);
		this.holder = holder;
		this.digits = digits;
		this.total = total;
		this.parent = parent;
		this.active = active;
	}
}