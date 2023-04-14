import { Expense } from '../models/expense';
import { Card } from '../models/card';

const dateRegex = /^\d{2}\/\d{2}$/;
const valueRegex = /^\d+\,\d{2}$/;

export class Itaucard {
	pdfEl: HTMLElement;
	pages: any = [];

	constructor(pdfEl: HTMLElement) {
		this.pdfEl = pdfEl;
		this.pages = this.pdfEl.getElementsByClassName("page");
		this.expenses();
	}

	expenses(): Expense[] {
		let res: Expense[] = [];

		for(let i = 2; i < 3/*this.pages.length*/; i++) {
			this.fetchPage(this.pages[i], i);
		}

		return res;
	}

	fetchPage(page: any, index: number) {
		let pageText = page.getElementsByClassName("textLayer")[0];
		if(!pageText) {
			throw new Error(`Can't read page ${index}`);
		}
		let nodes = pageText.children;
		let automata = new ItaucardAUTOMATA(nodes, page.clientWidth);
		let expenses = automata.expenses();
		let cards = automata.cards();
		console.log(expenses);
		console.log(cards);
	}
}

class ItaucardAUTOMATA {
	nodes: any[];
	width: number;

	cardsInfo: {card: Card, side: 'l'|'r', index: number}[] = [];

	constructor(nodes: [], pageWidth: number) {
		this.nodes = nodes;
		this.width = pageWidth;
	}

	cards(): {card: Card, side: 'l'|'r', index: number}[] {
		let res: any[] = [];

		for(let i = 0; i < this.nodes.length - 1; i++) {
			let holder, digits, pos;
			let node = this.nodes[i];
			let text = node.innerText;
			if(text.indexOf(" (final ") > 5) { // current node is card info
				let arr = text.split(" (final ");
				digits = arr[1].split(")")[0];
				
				if(arr[0].indexOf("mentos no cart") > 3) { // is card tail
					let totalEl = this.nodes[i+2];
					let total = Number(totalEl.innerText.replaceAll(".","").replace(",","."));
					let found = null;
					for(let el of res) {
						if(el.card.digits == digits) {
							found = el;
							break;
						}
					}
					if(found) {
						found.total = total;
					} else {
						let card = new Card("", digits, total);
						res.push({card: card, side: this.getSide(node), index: i});
					}
				} else { // is card header
					holder = arr[0];

					let card = new Card(holder, digits);
					res.push({card: card, side: this.getSide(node), index: i});
				}
			}
		}
		this.cardsInfo = res;
		return res;
	}

	expenses(): {expense: Expense, side: 'l'|'r', index: number}[] {
		let res: any = [];
		for(let i = 0; i < this.nodes.length - 5; i++) {
			let date, value, total_inst = 1, cur_inst = 1, place, place_description = '', pos;
			let node = this.nodes[i];
			if(dateRegex.test(node.innerText)) { // current node is date
				date = node.innerText;
				if(this.nodes[i+1].innerText.replaceAll(' ','').length == 0) { // next node is empty
					place = '';
					let j = 2;
					while(j < i && !valueRegex.test(this.nodes[i+j].innerText)) {
						place += " " + this.nodes[i+j].innerText;
						j++;
					}
					if(valueRegex.test(this.nodes[i+j].innerText)) { // place is valid
						if(place.lastIndexOf("/") > 5) { // there are installments
							let idx = place.lastIndexOf("/");
							cur_inst = Number(place.substr(idx - 2, 2));
							total_inst = Number(place.substr(idx+1, 2));
							place = place.substr(0, idx - 2);
						}
						value = Number(this.nodes[i+j].innerText.replace(",","."));
						pos = this.getSide(node);
						let exp = new Expense(date, value, this.formatName(place), '', total_inst, cur_inst);
						res.push({expense: exp, side: pos, index: i});
					} else { // it was not an expense. abort
						console.error("It was not an expense: ", node);
					}
				}
			}
		}
		return res;
	}

	getSide(node: any): 'l'|'r' {
		if(Number(node.getAttribute("style").split("left: ")[1].split("px")[0]) < (this.width / 2)) {
			return 'l';
		} else {
			return 'r';
		}
	}
	formatName(str: string): string {
		let arr = str.split(" ");
		let arr2 = [];
		for(let el of arr) {
			if(el.length > 0) {
				arr2.push(el);
			}
		}
		return arr2.join(" ");
	}
}