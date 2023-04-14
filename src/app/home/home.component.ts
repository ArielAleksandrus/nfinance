import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { PdfViewerComponent } from 'ng2-pdf-viewer';

import { Itaucard } from '../parsers/itaucard';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent {
  path: string = "/assets/sample/sample1.pdf";
  status: string|null = "Iniciando...";
  elId: string = '';
  curPage: number = 1;
  totalPages: number = 0;

  itau: Itaucard|null = null;

  constructor(private router: Router,
    private route: ActivatedRoute) {

  }

  ngOnInit() {

  }

  initting(id: string) {
    setTimeout(() => {
      this.elId = id;
      let el: any = document.getElementById(this.elId);

      this.loading(id, 1);
    }, 2000);
  }
  loading(id: string, page_n: number = 1) {
    let el: any = document.getElementById(this.elId);
    if(this.totalPages == 0)
      this.totalPages = el.getElementsByClassName("page").length;
    this.status = `Carregando página ${page_n} de ${this.totalPages}...`;

    let container = el.getElementsByClassName("ng2-pdf-viewer-container")[0];
    container.scrollTop = 1.3*page_n*container.clientHeight;
    setTimeout(() => {
      if(page_n >= this.totalPages) {
        this.status = null;
        this.onPDFLoaded();
      } else {
        this.loading(id, page_n + 1);
      }
    }, 750);
  }

  onPDFLoaded() {
    this.parse();
  }

  parse() {
    let el = document.getElementById("pdf");
    if(!!el){
      this.itau = new Itaucard(el);
    } else {
      throw new Error("No pdf rendered");
    }

    if(this.itau && this.itau.general_info) {
      let cardName = this.itau.general_info.card_name;
      let key = cardName.split(".")[3] + " " + this.itau.general_info.due_at;
      sessionStorage.setItem(key, JSON.stringify(this.itau));
      this.router.navigate(['categorizar', key]);
    }
  }
}
