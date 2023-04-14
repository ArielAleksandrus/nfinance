import { Expense } from '../models/expense';
import { Card } from '../models/card';

import { Utils } from '../helpers/utils';

const dateRegex = /^\d{2}\/\d{2}$/;
const valueRegex = /^\d+\,\d{2}$/;

type RawExpense = {expense: Expense, side: 'l'|'r', index: number};
type RawCard = {card: Card, side: 'l'|'r', index: number, page: number};

export class Itaucard {
	private _pdfEl: HTMLElement;
	private _pages: any = [];
	private _rawExpenses: RawExpense[] = [];
	private _rawCards: RawCard[] = [];
	private _curCard: any = null;
	private _curCardIdx: number = 0;

	cards: Card[] = [];

	constructor(pdfEl: HTMLElement) {
		this._pdfEl = pdfEl;
		this._pages = this._pdfEl.getElementsByClassName("page");
		this.expenses();
	}

	expenses(): Expense[] {
		let res: Expense[] = [];

		for(let i = 1; i < this._pages.length; i++) {
			this.fetchPage(this._pages[i], i);
		}
		console.log(this._rawExpenses);
		console.log(this._rawCards);

		return res;
	}

	fetchPage(page: any, index: number) {
		let pageText = page.getElementsByClassName("textLayer")[0];
		if(!pageText) {
			console.log(page);
			throw new Error(`Can't read page ${index}`);
		}
		let nodes = pageText.children;
		let automata = new ItaucardAUTOMATA(nodes, page.clientWidth, index);

		// add to _rawCards first by left side, then by right side
		for(let rawCard of automata.cards()) {
			if(rawCard.side == 'l') {
				if(rawCard.card.holder.length > 0) {
					this._rawCards.push(rawCard);
				} else {
					let found = this._findInCards(rawCard.card.digits);
					if(found) {
						found.card.total = rawCard.card.total;
					} else {
						console.error("Invalid card: ", rawCard);
					}
				}
			}
		}
		for(let rawCard of automata.cards()) {
			if(rawCard.side == 'r') {
				if(rawCard.card.holder.length > 0) {
					this._rawCards.push(rawCard);
				} else {
					let found = this._findInCards(rawCard.card.digits);
					if(found) {
						found.card.total = rawCard.card.total;
					} else {
						console.error("Invalid card: ", rawCard);
					}
				}
			}
		}

		if(this._curCard == null) {
			this._curCardIdx = 0;
			this._curCard = this._rawCards[this._curCardIdx];
		}

		let expenses = automata.expenses();
		this.parsePage('l', index, expenses);
		this.parsePage('r', index, expenses);
	}

	parsePage(side: 'l'|'r', page_n: number, expenses: RawExpense[]) {
		let sideMatches: RawExpense[] = [];

		let nextCard: any = this._rawCards[this._curCardIdx + 1];
		for(let i = 0; i < expenses.length; i++) {
			let rawExp = expenses[i];

			// change card
			if(nextCard && nextCard.page == page_n && nextCard.side == side && rawExp.index > nextCard.index) {
				console.log("changed", page_n, side, rawExp);
				this._curCardIdx += 1;
				this._curCard = nextCard;
				nextCard = this._rawCards[this._curCardIdx + 1];
			}
			if(expenses[i].side == side) {
				expenses[i].expense.card = this._rawCards[this._curCardIdx].card;
				sideMatches.push(expenses[i]);
			}
		}

		this._rawExpenses = this._rawExpenses.concat(sideMatches);
	}

	private _findInCards(digits: string): RawCard|null {
		let found = null;
		for(let aux of this._rawCards) {
			if(aux.card.digits == digits) {
				return aux;
			}
		}
		return null;
	}
}

class ItaucardAUTOMATA {
	nodes: any[];
	width: number;
	page_n: number;

	cardsInfo: {card: Card, side: 'l'|'r', index: number}[] = [];

	constructor(nodes: [], pageWidth: number, page_n: number) {
		this.nodes = nodes;
		this.width = pageWidth;
		this.page_n = page_n;
	}

	cards(): RawCard[] {
		let res: any[] = [];

		for(let i = 0; i < this.nodes.length - 1; i++) {
			let holder, digits, pos;
			let node = this.nodes[i];
			let text = node.innerText;
			if(text.indexOf("ximas faturas") > 0) { // current node is future purchases
				let card = new Card("Lançamentos futuros", "xxxx", 0);
				res.push({card: card, side: this.getSide(node), index: i, page: this.page_n});
			} else if(text.indexOf(" (final ") > 5) { // current node is card info
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
						res.push({card: card, side: this.getSide(node), index: -1, page: this.page_n});
					}
				} else { // is card header
					holder = arr[0];

					let card = new Card(holder, digits);
					res.push({card: card, side: this.getSide(node), index: i, page: this.page_n});
				}
			}
		}
		this.cardsInfo = res;
		return res;
	}

	expenses(): RawExpense[] {
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
					} else { // it was not an expense. do nothing

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