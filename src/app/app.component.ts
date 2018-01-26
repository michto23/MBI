import {Component, Pipe, PipeTransform} from '@angular/core';
import { ProbabilityRow } from '../model/rowProbability';
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {map, startWith} from "rxjs/operators";
import {Constants} from "utils/constants"
import {MatAutocompleteSelectedEvent, MatDatepickerInputEvent} from "@angular/material";
import {ResultCell} from "../model/resultCell";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  A_NUCL_STR = Constants.A_NUCL;
  G_NUCL_STR = Constants.G_NUCL;
  C_NUCL_STR = Constants.C_NUCL;
  T_NUCL_STR = Constants.T_NUCL;
  BREAK_NUCL_STR = Constants.BREAK_NUCL;

  sequence1: string;
  sequence2: string;
  sequence3: string;
  probabilityRows: Array<ProbabilityRow>;
  sequenceStrArray: Array<string> = [];
  currentSequence3Index: number;
  currentResultMatrix: Array<Array<ResultCell>> = [[]];

  showNextStepBtn = false;


  constructor () {
    this.probabilityRows = [
      new ProbabilityRow(this.A_NUCL_STR,1,1,1,1,1),
      new ProbabilityRow(this.G_NUCL_STR,1,1,1,1,1),
      new ProbabilityRow(this.C_NUCL_STR,1,1,1,1,1),
      new ProbabilityRow(this.T_NUCL_STR,1,1,1,1,1),
      new ProbabilityRow(this.BREAK_NUCL_STR,1,1,1,1,1),
    ];
    this.sequence1 = "AGCT";
    this.sequence2 = "AAAT";
    this.sequence3 = "CGAT";
    this.currentSequence3Index = 0;
  }

  probabilityChanged(event, rowNucl, colNucl) {
    let foundRow = this.probabilityRows.filter(row =>
      row.label === colNucl);

    if (foundRow != null && foundRow.length > 0)
      foundRow[0].nuclMap[rowNucl] = event.target.value;
  }

  runAlgorithm () {
    this.sequenceStrArray = AppComponent.prepareSequenceStrArray(this.sequence3);
    this.showNextStepBtn = false;



    console.log(this.probabilityRows);
    console.log(this.sequence1);
    console.log(this.sequence2);
    console.log(this.sequence3);
  }

  runStepAlgorithm () {
    this.showNextStepBtn = true;
  }

  nextStep () {

  }

  currentSequence3IndexToRight() {
    if (this.currentSequence3Index != this.sequenceStrArray.length - 1)
      this.currentSequence3Index += 1;
  }

  currentSequence3IndexToLeft() {
    if (this.currentSequence3Index != 0)
      this.currentSequence3Index -= 1;
  }

  prepareResultMatrix() : Array<Array<ResultCell>> {
    let sequence1StrArray = AppComponent.prepareSequenceStrArray(this.sequence1);
    let sequence2StrArray = AppComponent.prepareSequenceStrArray(this.sequence2);
    let resultMatrix: Array<Array<ResultCell>> = [];

    for (let i = 0; i < sequence1StrArray.length; )
    sequence1StrArray.forEach(rowY => {
      let row = Array() as ResultCell[];
      sequence2StrArray.forEach(rowX => {
        let cell = new ResultCell(rowX, rowY, null);
        row.push(cell);
      });
      resultMatrix.push(row);
    })

    return null;
  }

  static prepareSequenceStrArray (sequence: string) : string[] {
    let strResult = [];
    strResult.push(" ");
    strResult.concat(sequence.trim().split(""));
    return strResult;
  }

}
