export class GeneralInfo {
	holder: string;
	card_name: string;
	total: number;
	due_at: string;

	constructor(holder: string, card_name: string, total: number, due_at: string) {
		this.holder = holder;
		this.card_name = card_name;
		this.total = total;
		this.due_at = due_at;
	}
}