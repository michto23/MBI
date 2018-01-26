class MatrixNode {
    private value_: number;
    private previousCells_: [number, number, number][];

    constructor() {
        this.value_ = NaN;
        this.previousCells_ = new Array();
    }

    public getValue() {
        return this.value_;
    }

    public setValue(value: number) {
        this.value_ = value;
    }

    public addPreviousCell(cell:[number, number, number]) {
        this.previousCells_.push(cell);
    }

    public getPreviousCells() {
        return this.previousCells_;
    }
}

class SequenceAligner {
    seqA_: string;
    seqB_: string;
    seqC_: string;
    fMatrix_: MatrixNode[][][];
    penaltyMatrix_: number[][];
    nuclIdMap_: { [key: string]: number; };
    currentIdx: [number, number, number];

    /**
     * The constructor
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

        // Initialize the current cell pointer
        this.currentIdx = [0, 0, 0];
        this.incrementCell();
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
    public setMatrixValue(a: number, b: number, c: number, value: number) {
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
    public getPenaltyPair(nucl1: string, nucl2: string) {
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
        if (nucl1 === undefined)
            nucl1 = "-";
        if (nucl2 === undefined)
            nucl2 = "-";
        if (nucl3 === undefined)
            nucl3 = "-";
        return this.getPenaltyPair(nucl1, nucl2) + this.getPenaltyPair(nucl1, nucl3) + this.getPenaltyPair(nucl2, nucl3);
    }

    public incrementCell() {
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

    private addMatrixPreviousCell(a, b, c, cell) {
        this.fMatrix_[a][b][c].addPreviousCell(cell);
    }

    public getMatrixPreviousCells(a, b, c) {
        return this.fMatrix_[a][b][c].getPreviousCells();
    }

    public calcCurrentCell() {
        const a = this.currentIdx[0];
        const b = this.currentIdx[1];
        const c = this.currentIdx[2];

        let vals = new Array();
        // Calculate values from the reachable cells
        if (a > 0 && b > 0 && c > 0) {
            let v = this.getMatrixValue(a - 1, b - 1, c - 1) + this.getPenaltyTrio(this.seqA_[a - 1], this.seqB_[b - 1], this.seqC_[c - 1]);
            vals.push([v, [a - 1, b - 1, c - 1]]);
        }
        if (a > 0 && b > 0) {
            let v = this.getMatrixValue(a - 1, b - 1, c) + this.getPenaltyTrio(this.seqA_[a - 1], this.seqB_[b - 1], "-");
            vals.push([v, [a - 1, b - 1, c],]);
        }
        if (a > 0 && c > 0) {
            let v = this.getMatrixValue(a - 1, b, c - 1) + this.getPenaltyTrio(this.seqA_[a - 1], "-", this.seqC_[c - 1]);
            vals.push([v, [a - 1, b, c - 1]]);
        }
        if (a > 0) {
            let v = this.getMatrixValue(a - 1, b, c) + this.getPenaltyTrio(this.seqA_[a - 1], "-", "-");
            vals.push([v, [a - 1, b, c]]);
        }
        if (b > 0 && c > 0) {
            let v = this.getMatrixValue(a, b - 1, c - 1) + this.getPenaltyTrio("-", this.seqB_[b - 1], this.seqC_[c - 1]);
            vals.push([v, [a, b - 1, c - 1]]);
        }
        if (b > 0) {
            let v = this.getMatrixValue(a, b - 1, c) + this.getPenaltyTrio("-", this.seqB_[b - 1], "-");
            vals.push([v, [a, b - 1, c]]);
        }
        if (c > 0) {
            let v = this.getMatrixValue(a, b, c - 1) + this.getPenaltyTrio("-", "-", this.seqC_[c - 1]);
            vals.push([v, [a, b, c - 1]]);
        }

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
    }

    public getSolutions() {
        const startCell:[number, number, number] = [this.seqA_.length, this.seqB_.length, this.seqC_.length];
        return this.traverseSolutions(startCell, ["", "", ""], [startCell]);
    }

    private traverseSolutions(cell:[number, number, number], seqs:string[], cells:[number, number, number][]) {
        const reachableCells = this.getMatrixPreviousCells(cell[0], cell[1], cell[2]);

        if(reachableCells.length == 0) {
            // This is the final cell
            return [seqs, cells];
        }

        let results = new Array();
        for(let c = 0; c < reachableCells.length; ++c) {
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

    public doOneStep() {
        this.calcCurrentCell();
        this.incrementCell();
    }

    public doAllSteps() {
        while (true) {
            this.doOneStep();
        }
    }

    // tylko do testów TODO: remove me
    drawLayerAsTable(div: HTMLElement, c: number) {
        let table = document.createElement("table");
        table.setAttribute("border", "1");

        let bIndexRow = table.insertRow(0);
        let cIndexCell = bIndexRow.insertCell(0);
        cIndexCell.innerText = "c = " + c.toString();
        cIndexCell.style.backgroundColor = "#fdad9e";
        let bIndexRowDrawn = false;

        for (let a = 0; a <= this.seqA_.length; ++a) {
            let row = table.insertRow(a + 1);

            let aIndexCell = row.insertCell(0);
            aIndexCell.innerText = "a = " + a.toString();
            aIndexCell.style.backgroundColor = "#d4ffcf";

            for (let b = 0; b <= this.seqB_.length; ++b) {
                if (!bIndexRowDrawn) {
                    let bIndexCell = bIndexRow.insertCell(b + 1);
                    bIndexCell.innerText = "b = " + b.toString();
                    bIndexCell.style.backgroundColor = "#ffffb7";
                }

                let cell = row.insertCell(b + 1);
                cell.style.textAlign = "center";
                let value = this.fMatrix_[a][b][c].getValue();
                if (isNaN(value))
                    cell.innerText = "";
                else
                    cell.innerText = value.toString();
            }
            bIndexRowDrawn = true;
        }
        div.appendChild(table);
    }

    // tylko do testów TODO: remove me
    drawMatrix(div: HTMLElement) {
        while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
        for (let c = this.seqC_.length; c >= 0; --c) {
            this.drawLayerAsTable(div, c);
            div.appendChild(document.createElement("br"));
        }
    }
}

/*
// Test
function nextStep() {
    try {
        aligner.doOneStep();
        aligner.drawMatrix(document.getElementById("matrixF"));
    }
    catch (e) {
    }
}

function allSteps() {
    try {
        aligner.doAllSteps();
    }
    catch (e) {
        aligner.drawMatrix(document.getElementById("matrixF"));

        document.getElementById("log").appendChild(document.createTextNode("Results:\n\n"));

        const results = aligner.getSolutions();
        for(let r = 0; r < results.length; r+=2) {
            document.getElementById("log").appendChild(document.createTextNode("Solution " + (r/2+1).toString() + ":\n"));
            document.getElementById("log").appendChild(document.createTextNode("Seq1: " + results[r][0] + "\n"));
            document.getElementById("log").appendChild(document.createTextNode("Seq2: " + results[r][1] + "\n"));
            document.getElementById("log").appendChild(document.createTextNode("Seq3: " + results[r][2] + "\n"));
            document.getElementById("log").appendChild(document.createTextNode("Cells: (" + results[r+1].join("),(") + ")\n\n"));
        }
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
aligner.setPenaltyPair("G", "G",  7);
aligner.setPenaltyPair("G", "C", -5);
aligner.setPenaltyPair("G", "T", -3);
aligner.setPenaltyPair("G", "-", -5);
aligner.setPenaltyPair("C", "A", -3);
aligner.setPenaltyPair("C", "G", -5);
aligner.setPenaltyPair("C", "C",  9);
aligner.setPenaltyPair("C", "T",  0);
aligner.setPenaltyPair("C", "-", -5);
aligner.setPenaltyPair("T", "A", -4);
aligner.setPenaltyPair("T", "G", -3);
aligner.setPenaltyPair("T", "C",  0);
aligner.setPenaltyPair("T", "T",  8);
aligner.setPenaltyPair("T", "-", -5);
aligner.setPenaltyPair("-", "A", -5);
aligner.setPenaltyPair("-", "G", -5);
aligner.setPenaltyPair("-", "C", -5);
aligner.setPenaltyPair("-", "T", -5);
aligner.setPenaltyPair("-", "-",  0);

function onLoad() {
    document.getElementById("s1").innerText = "Seq1: " + seq1;
    document.getElementById("s2").innerText = "Seq2: " + seq2;
    document.getElementById("s3").innerText = "Seq3: " + seq3;
}
*/