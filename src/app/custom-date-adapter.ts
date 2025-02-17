import { Injectable } from '@angular/core';
import { NativeDateAdapter, MatDateFormats, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override useUtcForDisplay = true;

  override parse(value: any): Date | null {
    if (typeof value === 'string') {
      const str = value.split('/');
      if (str.length === 3) {
        return new Date(Number(str[2]), Number(str[1]) - 1, Number(str[0]));
      }
    }
    return super.parse(value);
  }

  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${this._to2digit(day)}/${this._to2digit(month)}/${year}`;
    } else if (displayFormat === 'MMMM') {
      return this.getMonthNames('long')[date.getMonth()];
    }
    return super.format(date, displayFormat);
  }

  private _to2digit(n: number) {
    return ('00' + n).slice(-2);
  }
}

export const CUSTOM_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};