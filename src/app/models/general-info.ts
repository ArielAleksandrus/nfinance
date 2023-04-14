export class GeneralInfo {
	holder: string;
	card_name: string;
	total: number;

	constructor(holder: string, card_name: string, total: number) {
		this.holder = holder;
		this.card_name = card_name;
		this.total = total;
	}
}