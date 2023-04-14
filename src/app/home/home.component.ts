import { Component, ViewChild } from '@angular/core';
import { PdfViewerComponent } from 'ng2-pdf-viewer';

import { Itaucard } from '../parsers/itaucard';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass']
})
export class HomeComponent {
  
  path: string = "/assets/sample/sample1.pdf";
  constructor() {

  }

  ngOnInit() {
    setTimeout(() => {
      this.parse();
    }, 5000); // wait until pdf is mounted
  }

  parse() {
    let el = document.getElementById("pdf");
    if(!!el)
      new Itaucard(el);
    else
      throw new Error("No pdf rendered");
  }
}
