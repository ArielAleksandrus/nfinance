export type PIE_DATASET = {
	data: number[],
	label?: string,
	borderColor?: string,
	backgroundColor?: string
};
export class PieChart {
	values: number[];
	labels: string[];
	maxDecimals: number|null;

	// set by our class
	datasets: PIE_DATASET[];

	private _buildDatasets() {
		for(let i = 0; i < this.labels.length; i++) {
			let ds: PIE_DATASET = {
				label: this.labels[i],
				data: [this.values[i]]
			};
			if(this.labels[i] == "Sem Categoria") {
				ds.borderColor = "#EAEAEA";
				ds.backgroundColor = "#F0F2F4"
			}
			this.datasets.push();
		}
		//this.datasets = [{data: this.values}];
	}

	constructor(values: number[], labels: string[], maxDecimals: number|null = null) {
		this.labels = labels;
		this.maxDecimals = maxDecimals;

		if(maxDecimals != null) {
			this.values = [];
			for(let item of values) {
				this.values.push(Number(item.toFixed(maxDecimals)));
			}
		} else {
			this.values = values;
		}
		this.datasets = [];
		this._buildDatasets();
	}

	addValue(label: string, value: number) {
		let lblIdx = this.labels.indexOf(label);
		if(lblIdx > -1) {
			this.values[lblIdx] += value;
			if(this.maxDecimals)
				this.values[lblIdx] = Number(this.values[lblIdx].toFixed(this.maxDecimals));
		} else {
			this.labels.push(label);
			if(this.maxDecimals)
				this.values.push(Number(value.toFixed(this.maxDecimals)));
			else
				this.values.push(value);
		}
		this.datasets = [{data: this.values}];
	}

	static fromObject(obj: any, maxDecimals: number|null = null): PieChart {
		let data: number[] = [];
		let labels: string[] = [];
		for(let key in obj) {
			labels.push(key);
			data.push(obj[key]);
		}
		return new PieChart(data, labels, maxDecimals);
	}
	static fromArray(arr: any[], labelKey: string = 'label', valueKey: string = 'value', maxDecimals: number|null = null) {
		let aux: any = {};
		for(let obj of arr) {
			if(aux[obj[labelKey]]) {
				aux[obj[labelKey]] += obj[valueKey];
			} else {
				aux[obj[labelKey]] = obj[valueKey];
			}
		}
		return PieChart.fromObject(aux, maxDecimals);
	}
}