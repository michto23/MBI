import {Component, Pipe, PipeTransform} from '@angular/core';
import { ProbabilityRow } from '../model/rowProbability';
import {FormControl} from "@angular/forms";
import {Observable} from "rxjs/Observable";
import {map, startWith} from "rxjs/operators";
import {Constants} from "utils/constants"
import {MatAutocompleteSelectedEvent, MatDatepickerInputEvent} from "@angular/material";


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
  }

  setVariable(event, rowNucl, colNucl) {
    let foundRow = this.probabilityRows.filter(row =>
      row.label === colNucl);

    if (foundRow != null && foundRow.length > 0)
      foundRow[0].nuclMap[rowNucl] = event.target.value;
  }

  runAlgorithm () {
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

}
