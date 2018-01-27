import {Constants} from "utils/constants"

/**
 * Class of penalty matrix cell.
 */
export class PenaltyRow {
  label: string;
  nuclMap : { [key:string]:number; } = {};

  constructor(label:string, valueA: number, valueG: number, valueC: number, valueT: number, valueBreak:number) {
    this.label = label;
    this.nuclMap[Constants.A_NUCL] = valueA;
    this.nuclMap[Constants.C_NUCL] = valueC;
    this.nuclMap[Constants.G_NUCL] = valueG;
    this.nuclMap[Constants.T_NUCL] = valueT;
    this.nuclMap[Constants.BREAK_NUCL] = valueBreak;
  }
}
