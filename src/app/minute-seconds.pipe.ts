import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
  name: 'minuteSeconds'
})
export class MinuteSecondsPipe implements PipeTransform {
  times = {
    year: 31557600,
    month: 2629746,
    dni: 86400,
    godz: 3600,
    min: 60,
    sek: 1
  }

  transform(seconds){
    seconds = Number(seconds);
    let h = Math.floor(seconds / 3600);
    let m = Math.floor(seconds % 3600 / 60);
    let s = Math.floor(seconds % 3600 % 60);
    return ('0' + h).slice(-2) + ":" + ('0' + m).slice(-2) + ":" + ('0' + s).slice(-2);
  }
}
