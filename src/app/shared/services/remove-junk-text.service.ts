import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RemoveJunkTextService {

  constructor() { }
  txt = document.createElement("textarea");

  // ll:
  returnText(html: string) {
    html = html.replace(/[^a-zA-Z0-9~`!@#$%^&*()_+-={}|:;<>,.?\/ \n[\]']/g, '');
    this.txt.innerHTML = html;
    return this.txt.value;
  }
  // &acirc;&euro;&trade;
  // &acirc;&euro;&cent;

  removeJunk(str: string) {
    // str = str.replace(/[^a-zA-Z0-9~`!@#$%^&*()_+-={}|:;<>,.?\/ \n[\]']/g,'').replace(/&acirc;/g,' ').replace(/&euro;/g,' ').replace(/&cent;/g,' ').replace(/&trade;/g,' ');
    str = str.replace(/[^a-zA-Z0-9~`!@#$%^&()_+-={}|:;<>,.\/ \n[\]']/g, '').replace(/&acirc;/g, ' ').replace(/&euro;/g, ' ').replace(/&cent;/g, ' ').replace(/&trade;/g, ' ');
    str = str.replace(/\*{4,}/g, "");
    str = str.replace(/<pre/g, '<span');
    str = str.replace(/<\/pre/g, '</span');
    return str;
    // return str;
    // .replace(/â/g,' ').replace(/€/g,' ').replace(/™/g,' ')
  }
  removeJunks(str: string) {
    str = str.replace(/[^a-zA-Z0-9~`!@#$%^&*()_+-={}|:;<>,.?\/ \n[\]']/g, '').replace('&acirc;', ' ').replace('&euro;', ' ').replace('&cent;', ' ')
    // str = str.replace(new RegExp(/\s/g),"");
    str = str.replace(new RegExp(/[àáâãäå]/g), "a");
    str = str.replace(new RegExp(/æ/g), "ae");
    str = str.replace(new RegExp(/ç/g), "c");
    str = str.replace(new RegExp(/[èéêë]/g), "e");
    str = str.replace(new RegExp(/[ìíîï]/g), "i");
    str = str.replace(new RegExp(/ñ/g), "n");
    str = str.replace(new RegExp(/[òóôõö]/g), "o");
    str = str.replace(new RegExp(/œ/g), "oe");
    str = str.replace(new RegExp(/[ùúûü]/g), "u");
    str = str.replace(new RegExp(/[ýÿ]/g), "y");
    str = str.replace(new RegExp(/\W/g), "");
    return str;
  }
  addBreaks(str: string) {
    str = str.replace(/•/g, '<br class="manual">•').replace(/➢/g, '<br class="manual">➢').replace(/❖/g, '<br class="manual">❖');
    str = str.replace(/<br><br class=\"manual\">/g, '<br class="manual">');
    str = str.replace(/<br class=\"manual\"><br class=\"manual\">/g, '<br class="manual">');
    str = str.replace(/<br><br class=\"manual\">/g, '<br class="manual">');
    str = str.replace(/(\r\n|\n|\r)/gm, '<br class="manual">');
    return str;
  }
  addPrintBreaks(str: string) {
    str = str.replace(/<br><br class=\"manual\">/g, '<br class="toAddBreak">');
    str = str.replace(/●/g, '');
    str = str.replace(/➢/g, '');
    str = str.replace(/\*/g, '');
    str = str.replace(/<br><br class=\"toAddBreak\">/g, '<br class="toAddBreak">');
    str = str.replace(/<br class=\"toAddBreak\"><br class=\"toAddBreak\">/g, '<br class="toAddBreak">');
    str = str.replace(/<br><br class=\"toAddBreak\">/g, '<br class="toAddBreak">');
    str = str.replace(/<br>/g, '<br class="toAddBreak">');
    str = str.replace(/(\r\n|\n|\r)/gm, '<br class="toAddBreak">● ');
    // console.log(str, 'strrrrr')
    return "● " + str;
  }
}
