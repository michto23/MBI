import {Component, Pipe, PipeTransform} from '@angular/core';
import { Cell } from '../model/cell';
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {map, startWith} from "rxjs/operators";
import {MatAutocompleteSelectedEvent, MatDatepickerInputEvent} from "@angular/material";

const FIRST_STOP_ID = 33;
const LAST_STOP_ID = 6;
const START_ICON = 'http://icons.iconarchive.com/icons/custom-icon-design/flatastic-9/32/Start-icon.png';
const FINISH_ICON = 'http://icons.iconarchive.com/icons/icons8/ios7/32/Sports-Finish-Flag-icon.png';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  showPredictions: boolean;
  cells: Array<Cell>;

  constructor () {
    this.cells = [
      new Cell("A",1,2,3,4),
      new Cell("G",1,2,3,4),
      new Cell("C",1,2,3,4),
      new Cell("T",1,2,3,4),
    ]
  }

  // startStopAutocomplete: FormControl = new FormControl();
  // endStopAutocomplete: FormControl = new FormControl();

  isWeekend(date) {
    return (date.getDay() === 6) || (date.getDay() === 0);
  };

  toNumber(str : string) : number {
    console.log(Number(str));
    return Number(str);
  }

}
