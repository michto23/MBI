import {Component, Pipe, PipeTransform} from '@angular/core';
import { PenaltyRow } from '../model/penaltyRow';
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {map, startWith} from "rxjs/operators";
import {Constants} from "utils/constants"
import {MatAutocompleteSelectedEvent, MatDatepickerInputEvent} from "@angular/material";
import {ResultCell} from "../model/resultCell";
import {SequenceAligner} from "../algorithm/algorithm";
import {ResultPath} from "../model/resultPath";

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
  penaltyRows: Array<PenaltyRow> = [];
  sequenceStrArray: Array<string> = [];
  currentResultMatrix: Array<Array<ResultCell>> = [];
  allResultMatrixes: Array<Array<Array<ResultCell>>> = [];
  resultPaths: Array<ResultPath> = [];

  showNextStepBtn = false;
  currentSequence3Index: number;
  resultPathIndex: number;

  sequenceAligner : SequenceAligner;
  logs : string;
  resultLog : string;

  constructor () {
    this.penaltyRows = [
      new PenaltyRow(this.A_NUCL_STR,10,-1,-3,-4,-5),
      new PenaltyRow(this.G_NUCL_STR,-1,7,-5,-3,-5),
      new PenaltyRow(this.C_NUCL_STR,-3,-5,9,0,-5),
      new PenaltyRow(this.T_NUCL_STR,-4,-3,0,8,-5),
      new PenaltyRow(this.BREAK_NUCL_STR,-5,-5,-5,-5,0),
    ];
    this.sequence1 = "TATACC";
    this.sequence2 = "TA";
    this.sequence3 = "TACC";
    this.currentSequence3Index = 0;
    this.resultPathIndex = 0;
  }

  penaltyChanged(event, rowNucl, colNucl) {
    let foundRow = this.penaltyRows.filter(row =>
      row.label === colNucl);

    if (foundRow != null && foundRow.length > 0)
      foundRow[0].nuclMap[rowNucl] = event.target.value;
  }

  runAlgorithm () {
    this.showNextStepBtn = false;
    this.sequenceAligner = new SequenceAligner(this.sequence1, this.sequence2, this.sequence3);
    this.setAlignerPenalties(this.sequenceAligner);

    this.allResultMatrixes = this.prepareResultMatrixes();
    this.currentResultMatrix = this.allResultMatrixes[0];
    this.logs = this.sequenceAligner.getLastStepInfo() + "\n";

    setTimeout(()=>{
      this.sequenceAligner.doAllSteps();
      this.processAllCells(this.getMatrixValue);
      this.currentSequence3Index = 0;
      this.sequenceStrArray = AppComponent.prepareSequenceStrArray(this.sequence3);

      let solutions = this.sequenceAligner.getSolutions();
      for (let r = 0; r < solutions.length; r += 2) {
        this.resultPaths.push(new ResultPath(solutions[r], solutions[r + 1], r));
      }
      this.changePathResult();
    },1500);
  }

  runStepAlgorithm () {
    this.showNextStepBtn = true;
  }

  nextStep () {

  }

  processAllCells(callback: (i: number, j:number, k:number, scope) => any) : void {
    /*
    i = sequence3
    j = sequence1
    k = sequence2
     */
    for (let i = 0; i < this.allResultMatrixes.length; ++i) {
      for (let j = 0; j < (this.allResultMatrixes[i].length - 1); ++j) {
        for (let k = 0; k < (this.allResultMatrixes[i][j].length - 1); ++k) {
          callback(i,j,k, this);
        }
      }
    }
  }

  getMatrixValue(i: number, j:number, k:number, scope) : void {
    scope.allResultMatrixes[i][j + 1][k + 1].value = scope.sequenceAligner.getMatrixValue(j,k,i);
  }

  resetSelected(i: number, j:number, k:number, scope) : void {
    scope.allResultMatrixes[i][j + 1][k + 1].selected = false;
  }



  currentSequence3IndexToRight() {
    if (this.currentSequence3Index != this.sequenceStrArray.length - 1)
      this.currentSequence3Index += 1;
    this.currentResultMatrix = this.allResultMatrixes[this.currentSequence3Index];
  }

  currentSequence3IndexToLeft() {
    if (this.currentSequence3Index != 0)
      this.currentSequence3Index -= 1;
    this.currentResultMatrix = this.allResultMatrixes[this.currentSequence3Index];
  }

  resultPathIndexToRight() {
    if (this.resultPathIndex != this.resultPaths.length - 1)
      this.resultPathIndex += 1;
    this.changePathResult();
  }

  resultPathIndexToLeft() {
    if (this.resultPathIndex != 0)
      this.resultPathIndex -= 1;
    this.changePathResult();
  }

  changePathResult() {
    this.processAllCells(this.resetSelected);
    this.resultLog = this.resultPaths[this.resultPathIndex].log;

    let currentResult = this.resultPaths[this.resultPathIndex];
    for (let i = 0; i < currentResult.matrixesPositions.length; ++i) {
      let pos = currentResult.matrixesPositions[i];
      this.allResultMatrixes[pos[2]][pos[0] + 1][pos[1] + 1].selected = true;
    }
  }

  setAlignerPenalties(aligner: SequenceAligner) {
    this.penaltyRows.forEach(item => {
      let nucls = [this.A_NUCL_STR, this.G_NUCL_STR, this.C_NUCL_STR, this.T_NUCL_STR, this.BREAK_NUCL_STR];
      nucls.forEach(nucl => {
        aligner.setPenaltyPair(item.label, nucl, item.nuclMap[nucl]);
      });
    })
  }

  prepareResultMatrixes() : Array<Array<Array<ResultCell>>> {
    let sequence1StrArray = AppComponent.prepareSequenceStrArray(this.sequence1);
    let sequence2StrArray = AppComponent.prepareSequenceStrArray(this.sequence2);
    let resultMatrixes: Array<Array<Array<ResultCell>>> = [];

    for (let i = 0; i < (this.sequence3.length + 1); ++i) {
      let matrix: Array<Array<ResultCell>> = [];
      for (let i = 0; i < sequence1StrArray.length; ++i) {
        let row = Array() as ResultCell[];
        for (let j = 0; j < sequence2StrArray.length; ++j) {
          let cell = new ResultCell(sequence2StrArray[j], sequence1StrArray[i], null);
          row.push(cell);
        }
        row.push(new ResultCell(null, null, null));
        if (i == 0)
          matrix.push(row);
        matrix.push(row);
      }
      resultMatrixes.push(matrix);
    }

    //init first cell of first matrix -> 0
    resultMatrixes[0][1][1].value = 0;
    return resultMatrixes;
  }

  static prepareSequenceStrArray (sequence: string) : string[] {
    let strResult = [];
    strResult.push(" ");
    return strResult.concat(sequence.trim().split(""));
  }

}
