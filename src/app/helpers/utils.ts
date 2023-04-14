export const Utils = {
	findById: (arr: Array<any>, term: any, field: string = 'id'): any => {
		for(let el of arr) {
			if(el[field] == term) {
				return el;
			}
		}
		return null;
	}
}