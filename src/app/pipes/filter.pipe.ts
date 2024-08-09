import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  // transform(value: unknown, ...args: unknown[]): unknown {
  //   return null;
  // }
  // transform(items: any[], filter: Object): any {
  //       if (!items || !filter) {
  //           return items;
  //       }
  //       // filter items array, items which match and return true will be
  //       // kept, false will be filtered out
  //       return items.filter(item => item.title.indexOf(filter.title) !== -1);
  //   }

  transform(items: any[], searchText: string, fieldName: string): any[] {

    // return empty array if array is falsy
    if (!items) { return []; }

    // return the original array if search text is empty
    if (!searchText) { return items; }

    // convert the searchText to lower case
    searchText = searchText.toLowerCase();

    // retrun the filtered array
    return items.filter(item => {
      if (item && item[fieldName]) {
        return item[fieldName].toLowerCase().includes(searchText);
      }
      return false;
    });
   }

}
