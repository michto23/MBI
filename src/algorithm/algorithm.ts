/**
 * Represents a single cell in the matrix used to compute the sequences alignment.
 */
class MatrixNode {
  private value_: number;
  private previousCells_: [number, number, number][];

  /**
   * The constructor.
   * @constructor
   */
  constructor() {
    this.value_ = NaN;
    this.previousCells_ = new Array();
  }

  /**
   * Returns the value from the cell.
   * @returns {number} Value from the cell.
   */
  public getValue() {
    return this.value_;
  }

  /**
   * Sets the value of the cell.
   * @param {number} value Desired value of the cell.
   */
  public setValue(value: number) {
    this.value_ = value;
  }

  /**
   * Adds a previous cell to the list.
   * @param {[number , number , number]} cell Previous cell's coordinates.
   */
  public addPreviousCell(cell: [number, number, number]) {
    this.previousCells_.push(cell);
  }

  /**
   * Returns an array of the previous cells.
   * @returns {[number , number , number][]} List of the previous cells' coordinates.
   */
  public getPreviousCells() {
    return this.previousCells_;
  }
}

/**
 * Represents the sequence alignment controller.
 */
export class SequenceAligner {
  private seqA_: string;
  private seqB_: string;
  private seqC_: string;
  private fMatrix_: MatrixNode[][][];
  private penaltyMatrix_: number[][];
  private nuclIdMap_: { [key: string]: number; };
  private currentIdx: [number, number, number];
  private lastStepInfo_: string;

  /**
   * The constructor
   * @constructor
   * @param {string} seqA Sequence A
   * @param {string} seqB Sequence B
   * @param {string} seqC Sequence C
   */
  constructor(seqA: string, seqB: string, seqC: string) {
    // Store the sequences
    this.seqA_ = seqA;
    this.seqB_ = seqB;
    this.seqC_ = seqC;

    // Initialize the nucleotide id map
    this.nuclIdMap_ = {};
    this.nuclIdMap_["A"] = 0;
    this.nuclIdMap_["G"] = 1;
    this.nuclIdMap_["C"] = 2;
    this.nuclIdMap_["T"] = 3;
    this.nuclIdMap_["-"] = 4;

    // Initialize the penalty matrix
    this.penaltyMatrix_ = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]];

    // Initialize the F matrix
    this.initFMatrix(this.seqA_.length + 1, this.seqB_.length + 1, this.seqC_.length + 1);
    this.setMatrixValue(0, 0, 0, 0);
    this.lastStepInfo_ = "Komórka (0,0,0) została zainicjalizowana wartością 0.\n";

    // Initialize the current cell pointer
    this.currentIdx = [0, 0, 0];
    this.moveToNextCell();
  }

  /**
   * Initializes the F matrix with empty nodes.
   * @param {number} dimA Size of the 1st dimension.
   * @param {number} dimB Size of the 2nd dimension.
   * @param {number} dimC Size of the 3rd dimension.
   */
  private initFMatrix(dimA: number, dimB: number, dimC: number) {
    this.fMatrix_ = new Array();
    for (let a = 0; a < dimA; ++a) {
      let chunk2 = new Array();
      for (let b = 0; b < dimB; ++b) {
        let chunk1 = new Array();
        for (let c = 0; c < dimC; ++c)
          chunk1.push(new MatrixNode());
        chunk2.push(chunk1);
      }
      this.fMatrix_.push(chunk2);
    }
  }

  /**
   * Returns the value of the F matrix at the given coordinates.
   * @param {number} a The 1st coordinate, corresponding to the sequence A.
   * @param {number} b The 2nd coordinate, corresponding to the sequence B.
   * @param {number} c The 3rd coordinate, corresponding to the sequence C.
   * @returns {number} The requested value.
   */
  public getMatrixValue(a: number, b: number, c: number) {
    return this.fMatrix_[a][b][c].getValue();
  }

  /**
   * Sets the value of the F matrix at the given coordinates.
   * @param {number} a The 1st coordinate, corresponding to the sequence A.
   * @param {number} b The 2nd coordinate, corresponding to the sequence B.
   * @param {number} c The 3rd coordinate, corresponding to the sequence C.
   * @param {number} value The desired value.
   */
  private setMatrixValue(a: number, b: number, c: number, value: number) {
    this.fMatrix_[a][b][c].setValue(value);
  }

  /**
   * Sets the penalty value between a pair of nucleotides.
   * @param {string} nucl1 The first nucleotide ("A"/"G"/"C"/"T"/"-").
   * @param {string} nucl2 The second nucleotide ("A"/"G"/"C"/"T"/"-").
   * @param {number} value The value of the penalty.
   */
  public setPenaltyPair(nucl1: string, nucl2: string, value: number) {
    this.penaltyMatrix_[this.nuclIdMap_[nucl1]][this.nuclIdMap_[nucl2]] = value;
    if (nucl1 != nucl2)
      this.penaltyMatrix_[this.nuclIdMap_[nucl2]][this.nuclIdMap_[nucl1]] = value;
  }

  /**
   * Returns the penalty value between 2 nucleotides.
   * @param {string} nucl1 The first nucleotide ("A"/"G"/"C"/"T"/"-").
   * @param {string} nucl2 The second nucleotide ("A"/"G"/"C"/"T"/"-").
   * @returns {number} The value of the penalty.
   */
  private getPenaltyPair(nucl1: string, nucl2: string) {
    return this.penaltyMatrix_[this.nuclIdMap_[nucl1]][this.nuclIdMap_[nucl2]];
  }

  /**
   * Returns a penalty value for 3 nucleotides as a sum of penalties between all the possible pairs.
   * @param {string} nucl1 The first nucleotide ("A"/"G"/"C"/"T"/"-").
   * @param {string} nucl2 The second nucleotide ("A"/"G"/"C"/"T"/"-").
   * @param {string} nucl3 The third nucleotide ("A"/"G"/"C"/"T"/"-").
   * @returns {number} The value of the penalty.
   */
  private getPenaltyTrio(nucl1: string, nucl2: string, nucl3: string) {
    return this.getPenaltyPair(nucl1, nucl2) + this.getPenaltyPair(nucl1, nucl3) + this.getPenaltyPair(nucl2, nucl3);
  }

  /**
   * Moves the cell pointer to the next available cell. Throws an exception if it's not possible.
   */
  private moveToNextCell() {
    if (this.currentIdx[0] + 1 <= this.seqA_.length) {
      ++this.currentIdx[0];
    }
    else if (this.currentIdx[1] + 1 <= this.seqB_.length) {
      this.currentIdx[0] = 0;
      ++this.currentIdx[1];
    }
    else if (this.currentIdx[2] + 1 <= this.seqC_.length) {
      this.currentIdx[0] = 0;
      this.currentIdx[1] = 0;
      ++this.currentIdx[2];
    }
    else {
      throw "finish";
    }
  }

  /**
   * Adds a previous cell to a cell in the F matrix.
   * @param a
   * @param b
   * @param c
   * @param cell
   */
  private addMatrixPreviousCell(a, b, c, cell) {
    this.fMatrix_[a][b][c].addPreviousCell(cell);
  }

  /**
   * Return a list of coordinates of the previous cells of a cell in the F matrix.
   * @param a
   * @param b
   * @param c
   * @returns {[number , number , number][]}
   */
  private getMatrixPreviousCells(a, b, c) {
    return this.fMatrix_[a][b][c].getPreviousCells();
  }

  /**
   * Calculates the new value from a given reachable cell.
   * @param {number} a
   * @param {number} b
   * @param {number} c
   * @param {string} p1
   * @param {string} p2
   * @param {string} p3
   * @returns {(number | number[])[]}
   */
  private calcReachableValue(a: number, b: number, c: number, p1: string, p2: string, p3: string) {
    const v = this.getMatrixValue(a, b, c);
    const p = this.getPenaltyTrio(p1, p2, p3);
    let ps = p.toString()
    if (ps[0] === "-")
      ps = "(" + ps + ")";
    const n = v + p;
    this.lastStepInfo_ += "F(" + a + "," + b + "," + c + ") + e(" + p1 + "," + p2 + "," + p3 + ") = " + v + " + " + ps + " = " + n + "\n";
    return [n, [a, b, c]];
  }

  /**
   * Calculates the value of the cell the current cell pointer points at.
   */
  private calcCurrentCell() {
    const a = this.currentIdx[0];
    const b = this.currentIdx[1];
    const c = this.currentIdx[2];

    this.lastStepInfo_ = "";

    // Calculate values from the reachable cells
    let vals = new Array();
    if (a > 0 && b > 0 && c > 0)
      vals.push(this.calcReachableValue(a - 1, b - 1, c - 1, this.seqA_[a - 1], this.seqB_[b - 1], this.seqC_[c - 1]));
    if (a > 0 && b > 0)
      vals.push(this.calcReachableValue(a - 1, b - 1, c, this.seqA_[a - 1], this.seqB_[b - 1], "-"));
    if (a > 0 && c > 0)
      vals.push(this.calcReachableValue(a - 1, b, c - 1, this.seqA_[a - 1], "-", this.seqC_[c - 1]));
    if (a > 0)
      vals.push(this.calcReachableValue(a - 1, b, c, this.seqA_[a - 1], "-", "-"));
    if (b > 0 && c > 0)
      vals.push(this.calcReachableValue(a, b - 1, c - 1, "-", this.seqB_[b - 1], this.seqC_[c - 1]));
    if (b > 0)
      vals.push(this.calcReachableValue(a, b - 1, c, "-", this.seqB_[b - 1], "-"));
    if (c > 0)
      vals.push(this.calcReachableValue(a, b, c - 1, "-", "-", this.seqC_[c - 1]));

    // Sort the values in descending order
    vals.sort(function (a, b) {
      if (a[0] === b[0])
        return 0;
      else
        return (a[0] > b[0]) ? -1 : 1;
    });

    // Store all the cells with the max value as previous cells
    for (const v in vals) {
      if (vals[v][0] === vals[0][0])
        this.addMatrixPreviousCell(a, b, c, vals[v][1]);
    }

    // Set value of the current cell
    this.setMatrixValue(a, b, c, vals[0][0]);

    // Update the step info
    this.lastStepInfo_ = "Wypełniono komórkę (" + a + "," + b + "," + c + ") wartością " + vals[0][0] + ", tj. maksymalną z osiągalnych:\n" + this.lastStepInfo_;
  }

  /**
   * Returns a list of solutions made of global alignments and the paths in the F matrix that lead to them.
   * @returns {(string[] | [number , number , number][])[] | any[]} Solutions list, eg. [["ACT","-CT","A--"], [(0,0,0),(1,0,1),(2,1,1),(3,2,1)]]
   */
  public getSolutions() {
    const startCell: [number, number, number] = [this.seqA_.length, this.seqB_.length, this.seqC_.length];
    return this.traverseSolutions(startCell, ["", "", ""], [startCell]);
  }

  /**
   * Traverses through the cells using the previous cells pointers, returns a value when the (0,0,0) cell is reached.
   * @param {[number , number , number]} cell
   * @param {string[]} seqs
   * @param {[number , number , number][]} cells
   * @returns {any}
   */
  private traverseSolutions(cell: [number, number, number], seqs: string[], cells: [number, number, number][]) {
    const reachableCells = this.getMatrixPreviousCells(cell[0], cell[1], cell[2]);

    if (reachableCells.length == 0) {
      // This is the final cell
      return [seqs, cells];
    }

    let results = new Array();
    for (let c = 0; c < reachableCells.length; ++c) {
      const sA = ((reachableCells[c][0] - cell[0]) == 0) ? "-" : this.seqA_[reachableCells[c][0]];
      const sB = ((reachableCells[c][1] - cell[1]) == 0) ? "-" : this.seqB_[reachableCells[c][1]];
      const sC = ((reachableCells[c][2] - cell[2]) == 0) ? "-" : this.seqC_[reachableCells[c][2]];
      const seqsResult = [sA + seqs[0], sB + seqs[1], sC + seqs[2]];
      let cellsResult = [reachableCells[c]].concat(cells);
      const partialResults = this.traverseSolutions(reachableCells[c], seqsResult, cellsResult);

      results = results.concat(partialResults);
    }

    return results;
  }

  /**
   * Performs one step of the simulation. Throws an exception if it's not possible.
   */
  public doOneStep() {
    this.calcCurrentCell();
    this.moveToNextCell();
  }

  /**
   * Goes through all the remaining steps of the simulation.
   */
  public doAllSteps() {
    try {
      while (true) {
        this.doOneStep();
      }
    }
    catch(e) {
    }
  }

  /**
   * Returns a text info about the last executed step.
   * @returns {string} Step info
   */
  public getLastStepInfo() {
    return this.lastStepInfo_;
  }
}

// Test
/*
function clearLog() {
    let log = document.getElementById("log");
    while (log.firstChild) {
        log.removeChild(log.firstChild);
    }
}

function showSolutions() {
    aligner.drawMatrix(document.getElementById("matrixF"));

    clearLog();

    let log = document.getElementById("log");

    const results = aligner.getSolutions();
    for (let r = 0; r < results.length; r += 2) {
        log.appendChild(document.createTextNode("Dopasowanie globalne nr " + (r / 2 + 1).toString() + ":\n"));
        log.appendChild(document.createTextNode("Sekwencja 1: " + results[r][0] + "\n"));
        log.appendChild(document.createTextNode("Sekwencja 2: " + results[r][1] + "\n"));
        log.appendChild(document.createTextNode("Sekwencja 3: " + results[r][2] + "\n"));
        log.appendChild(document.createTextNode("Ścieżka rozwiązania: (" + results[r + 1].join(")→(") + ")\n\n"));
    }
}

function showStepInfo() {
    let log = document.getElementById("log");
    log.appendChild(document.createTextNode(aligner.getLastStepInfo() + "\n"));
    log.scrollTop = log.scrollHeight;
}

function nextStep() {
    try {
        aligner.doOneStep();
        aligner.drawMatrix(document.getElementById("matrixF"));
        showStepInfo();
    }
    catch (e) {
        showSolutions();
    }
}

function allSteps() {
    try {
        aligner.doAllSteps();
    }
    catch (e) {
        showSolutions();
    }
}

const seq1 = "TATACC";
const seq2 = "TA";
const seq3 = "TACC";

// const seq1 = "AGTTAT";
// const seq2 = "GTCGTT";
// const seq3 = "ATTCGTAT";

let aligner = new SequenceAligner(seq1, seq2, seq3);
aligner.setPenaltyPair("A", "A", 10);
aligner.setPenaltyPair("A", "G", -1);
aligner.setPenaltyPair("A", "C", -3);
aligner.setPenaltyPair("A", "T", -4);
aligner.setPenaltyPair("A", "-", -5);
aligner.setPenaltyPair("G", "A", -1);
aligner.setPenaltyPair("G", "G", 7);
aligner.setPenaltyPair("G", "C", -5);
aligner.setPenaltyPair("G", "T", -3);
aligner.setPenaltyPair("G", "-", -5);
aligner.setPenaltyPair("C", "A", -3);
aligner.setPenaltyPair("C", "G", -5);
aligner.setPenaltyPair("C", "C", 9);
aligner.setPenaltyPair("C", "T", 0);
aligner.setPenaltyPair("C", "-", -5);
aligner.setPenaltyPair("T", "A", -4);
aligner.setPenaltyPair("T", "G", -3);
aligner.setPenaltyPair("T", "C", 0);
aligner.setPenaltyPair("T", "T", 8);
aligner.setPenaltyPair("T", "-", -5);
aligner.setPenaltyPair("-", "A", -5);
aligner.setPenaltyPair("-", "G", -5);
aligner.setPenaltyPair("-", "C", -5);
aligner.setPenaltyPair("-", "T", -5);
aligner.setPenaltyPair("-", "-", 0);

function onLoad() {
    document.getElementById("s1").innerHTML = "Sekwencja 1: <b>" + seq1 + "</b>";
    document.getElementById("s2").innerHTML = "Sekwencja 2: <b>" + seq2 + "</b>";
    document.getElementById("s3").innerHTML = "Sekwencja 3: <b>" + seq3 + "</b>";

    showStepInfo();
    aligner.drawMatrix(document.getElementById("matrixF"));
}
*/
