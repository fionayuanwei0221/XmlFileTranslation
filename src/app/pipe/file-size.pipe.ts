import { Pipe, PipeTransform } from '@angular/core';

const FILE_SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

@Pipe({
  name: 'fileSize'
})
export class FileSizePipe implements PipeTransform {

  transform(value: number): string {
    if (value === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const i = Math.floor(Math.log(value) / Math.log(k));
    return parseFloat((value / Math.pow(k, i)).toFixed(2)) + ' ' + FILE_SIZE_UNITS[i];
  }
}
