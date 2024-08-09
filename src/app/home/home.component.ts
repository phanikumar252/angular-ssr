import { Component, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private meta: Meta,
    private titleService: Title
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('New Title');

    this.meta.updateTag({ name: 'description', content: 'This is the description of the page' }, 'name="description"');
    this.meta.updateTag({ property: 'og:title', content: 'New Open Graph Title' }, 'property="og:title"');
  }

}
