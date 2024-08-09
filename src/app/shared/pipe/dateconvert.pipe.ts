import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'dateconvert'
})
export class DateconvertPipe implements PipeTransform {

  transform(value: string, args?: any): string {
    const data = moment(value, 'YYYY-MM-DDTHH:mm:ssZ').format("DD MMM YYYY")
    return data;
  }

}
