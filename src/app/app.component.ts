import {Component, ElementRef, Pipe, PipeTransform, ViewChild} from '@angular/core';
import { PenaltyRow } from '../model/penaltyRow';
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {map, startWith} from "rxjs/operators";
import {Constants} from "utils/constants"
import {MatAutocompleteSelectedEvent, MatDatepickerInputEvent} from "@angular/material";
import {ResultCell} from "../model/resultCell";
import {SequenceAligner} from "../algorithm/algorithm";
import {ResultPath} from "../model/resultPath";
import {Message} from "primeng/api";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild('logTextarea') private logTextareaContainer: ElementRef;

  //Nucleotides
  A_NUCL_STR = Constants.A_NUCL;
  G_NUCL_STR = Constants.G_NUCL;
  C_NUCL_STR = Constants.C_NUCL;
  T_NUCL_STR = Constants.T_NUCL;
  BREAK_NUCL_STR = Constants.BREAK_NUCL;

  //Input data
  sequence1: string;
  sequence2: string;
  sequence3: string;
  penaltyRows: Array<PenaltyRow> = [];
  sequenceStrArray: Array<string> = [];

  //Result data
  sequenceAligner : SequenceAligner;
  currentResultMatrix: Array<Array<ResultCell>> = [];
  allResultMatrixes: Array<Array<Array<ResultCell>>> = [];
  resultPaths: Array<ResultPath> = [];
  logs : string;
  resultLog : string;

  //Control data
  showNextStepBtn = false;
  currentSequence3Index: number;
  resultPathIndex: number;
  stepCounter: number;
  notifications : Message[] = [];

  constructor () {
    this.penaltyRows = [
      new PenaltyRow(this.A_NUCL_STR,null, null, null, null, null),
      new PenaltyRow(this.G_NUCL_STR,null, null, null, null, null),
      new PenaltyRow(this.C_NUCL_STR,null, null, null, null, null),
      new PenaltyRow(this.T_NUCL_STR,null, null, null, null, null),
      new PenaltyRow(this.BREAK_NUCL_STR,null, null, null, null, null),
    ];
    this.sequence1 = "";
    this.sequence2 = "";
    this.sequence3 = "";
    this.currentSequence3Index = 0;
    this.resultPathIndex = 0;
    this.stepCounter = 1;
  }

  /**
   * Set example input data - sequences and penalty matrix
   */
  setExampleData () {
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
  }

  /**
   * Show notification (error) section with message
   * @param {string} msg Message to show
   */
  private showError(msg: string) {
    this.notifications = [];
    this.notifications.push({severity:'error', summary:'Błąd', detail:msg});
  }

  /**
   * If penalty matrix cell is changed, change also cell which is associated ((1,2) -> (2,1))
   * @param event Event of changed input value
   * @param rowNucl Row param
   * @param colNucl Col param
   */
  penaltyChanged(event, rowNucl, colNucl) {
    let foundRow = this.penaltyRows.filter(row =>
      row.label === colNucl);

    if (foundRow != null && foundRow.length > 0)
      foundRow[0].nuclMap[rowNucl] = event.target.value;
  }

  /**
   * Prepare data for running an algorithm
   * @returns {boolean} Is validation of input data true
   */
  prepareRunningAlgorithm() : boolean {
    if (!this.validateInputData())
      return false;

    this.resetResults();
    this.sequenceAligner = new SequenceAligner(this.sequence1, this.sequence2, this.sequence3);
    this.setAlignerPenalties(this.sequenceAligner);
    this.allResultMatrixes = this.prepareResultMatrixes();
    this.setAlignerPenalties(this.sequenceAligner);
    this.currentResultMatrix = this.allResultMatrixes[0];
    this.logs = this.stepCounter + ". " + this.sequenceAligner.getLastStepInfo() + "\n";
    this.currentSequence3Index = 0;
    this.sequenceStrArray = this.prepareSequenceStrArray(this.sequence3);
    return true;
  }

  /**
   * Run regular type of algorithm.
   * Setting timeout for show first simulation step of init matrix - (0,0) = 0
   */
  runAlgorithm () {
    if (this.prepareRunningAlgorithm()) {
      this.showNextStepBtn = false;

      setTimeout(()=>{
        this.sequenceAligner.doAllSteps();
        this.processAllCells(this.getMatrixValue);
        this.setSolutions();
      },1000);
    }
  }

  /**
   * Setting found solutions as Array of ResultPath.
   * Init first result as current.
   */
  private setSolutions () {
    let solutions = this.sequenceAligner.getSolutions();
    for (let r = 0; r < solutions.length; r += 2) {
      this.resultPaths.push(new ResultPath(solutions[r], solutions[r + 1], r));
    }
    this.changePathResult();
  }

  /**
   * Run step type algorithm - enable showNextStepBtn for use.
   */
  runStepAlgorithm () {
    if (this.prepareRunningAlgorithm()) {
      this.showNextStepBtn = true;
    }
  }

  /**
   * Reset all result data
   */
  private resetResults () {
    this.allResultMatrixes = [];
    this.currentResultMatrix = [];
    this.logs = "";
    this.resultLog = "";
    this.resultPaths = [];
    this.resultPathIndex = 1;
    this.resultPathIndex = 0;
    this.showNextStepBtn = false;
  }

  /**
   * Run next step of simulation.
   * If exception - end of step simulation.
   */
  nextStep () {
    ++this.stepCounter;
    try {
      this.sequenceAligner.doOneStep();
      this.logs += this.stepCounter + ". " + this.sequenceAligner.getLastStepInfo() + "\n";

      //If matrix completed, go to next matrix
      if (this.stepCounter%((this.currentResultMatrix.length - 1)*(this.currentResultMatrix[0].length - 1)) == 1)
        this.currentSequence3IndexToRight();
    }
    catch(e) {
      this.showNextStepBtn = false;
      this.logs += "Algorytm krokowy został zakończony" + "\n";
      this.setSolutions();
    }

    //Automatically scrolling down
    setTimeout(()=>{
      try {
        this.logTextareaContainer.nativeElement.scrollTop = this.logTextareaContainer.nativeElement.scrollHeight;
      } catch(err) { }
    }, 0);

    this.processAllCells(this.getMatrixValue);
  }

  /**
   * Process all result cells with callback function.
   * @param {(i: number, j: number, k: number, scope) => any} callback Callback function
   */
  private processAllCells(callback: (i: number, j:number, k:number, scope) => any) : void {
    for (let i = 0; i < this.allResultMatrixes.length; ++i) {
      for (let j = 0; j < (this.allResultMatrixes[i].length - 1); ++j) {
        for (let k = 0; k < (this.allResultMatrixes[i][j].length - 1); ++k) {
          callback(i,j,k, this);
        }
      }
    }
  }

  /**
   * Get value of matrix cell from processed SequenceAligner
   * @param {number} i Index associated with sequence3
   * @param {number} j Index associated with sequence1
   * @param {number} k Index associated with sequence2
   * @param scope this
   */
  private getMatrixValue(i: number, j:number, k:number, scope) : void {
    scope.allResultMatrixes[i][j + 1][k + 1].value = scope.sequenceAligner.getMatrixValue(j,k,i);
  }

  /**
   * Reset selected var, used to setting background color of cell.
   * @param {number} i Index associated with sequence3
   * @param {number} j Index associated with sequence1
   * @param {number} k Index associated with sequence2
   * @param scope this
   */
  private resetSelected(i: number, j:number, k:number, scope) : void {
    scope.allResultMatrixes[i][j + 1][k + 1].selected = false;
  }

  /**
   * Change currentSequence3Index to right (+1)
   */
  currentSequence3IndexToRight() {
    if (this.currentSequence3Index != this.sequenceStrArray.length - 1)
      this.currentSequence3Index += 1;
    this.currentResultMatrix = this.allResultMatrixes[this.currentSequence3Index];
  }

  /**
   * Change currentSequence3Index to left (-1)
   */
  currentSequence3IndexToLeft() {
    if (this.currentSequence3Index != 0)
      this.currentSequence3Index -= 1;
    this.currentResultMatrix = this.allResultMatrixes[this.currentSequence3Index];
  }

  /**
   * Change resultPathIndex to right (+1)
   */
  resultPathIndexToRight() {
    if (this.resultPathIndex != this.resultPaths.length - 1)
      this.resultPathIndex += 1;
    this.changePathResult();
  }

  /**
   * Change resultPathIndex to left (-1)
   */
  resultPathIndexToLeft() {
    if (this.resultPathIndex != 0)
      this.resultPathIndex -= 1;
    this.changePathResult();
  }

  /**
   * Set resultLog by resultPathIndex.
   * Set selected boolean for result cells
   */
  private changePathResult() {
    this.processAllCells(this.resetSelected);
    this.resultLog = this.resultPaths[this.resultPathIndex].log;

    let currentResult = this.resultPaths[this.resultPathIndex];
    for (let i = 0; i < currentResult.matrixesPositions.length; ++i) {
      let pos = currentResult.matrixesPositions[i];
      this.allResultMatrixes[pos[2]][pos[0] + 1][pos[1] + 1].selected = true;
    }
  }

  /**
   * Setting aligner penalties
   * @param {SequenceAligner} aligner SequenceAligner object.
   */
  private setAlignerPenalties(aligner: SequenceAligner) {
    this.penaltyRows.forEach(item => {
      let nucls = [this.A_NUCL_STR, this.G_NUCL_STR, this.C_NUCL_STR, this.T_NUCL_STR, this.BREAK_NUCL_STR];
      nucls.forEach(nucl => {
        aligner.setPenaltyPair(item.label, nucl, item.nuclMap[nucl]);
      });
    })
  }

  /**
   * Prepare data for result 3D matrix.
   * @returns {Array<Array<Array<ResultCell>>>} 3D data of ResultCell objects
   */
  private prepareResultMatrixes() : Array<Array<Array<ResultCell>>> {
    let sequence1StrArray = this.prepareSequenceStrArray(this.sequence1);
    let sequence2StrArray = this.prepareSequenceStrArray(this.sequence2);
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

    //Init first cell of first matrix -> 0
    resultMatrixes[0][1][1].value = 0;
    return resultMatrixes;
  }

  /**
   * Validate input data
   * @returns {boolean} If validation positive - true, else false
   */
  validateInputData() : boolean {

    //At least one sequence empty
    if (this.sequence1.trim() == "" || this.sequence2.trim() == "" || this.sequence3.trim() == "") {
      this.showError("Pojedyncza sekwencja musi się składać z przynajmniej jednego nukleotydu.");
      return false;
    }

    let nucls = [this.A_NUCL_STR, this.G_NUCL_STR, this.C_NUCL_STR, this.T_NUCL_STR, this.BREAK_NUCL_STR];

    //At least one penalty cell empty
    for (let i = 0; i < this.penaltyRows.length; ++i) {
      nucls.forEach(nucl => {
        if (this.penaltyRows[i].nuclMap[nucl] == null || this.penaltyRows[i].nuclMap[nucl].toString() == "") {
          this.showError("Macierz kar i nagród musi być wypełniona.");
          return false;
        }
      });
    }

    return true;
  }

  /**
   * Sequnce string to array with 1 empty string on the begining ("ATT" -> [" ", "A", "T", "T"])
   * @param {string} sequence Sequence of ACTG
   * @returns {string[]} One chars array of ACTG
   */
  private prepareSequenceStrArray (sequence: string) : string[] {
    let strResult = [];
    strResult.push(" ");
    return strResult.concat(sequence.trim().split(""));
  }

}
