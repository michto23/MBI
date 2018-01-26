class MatrixNode {
    private value_: number;

    constructor() {
        this.value_ = NaN;
    }

    getValue() {
        return this.value_;
    }

    setValue(value: number) {
        this.value_ = value;
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

    public calcCurrentCell() {
        const a = this.currentIdx[0];
        const b = this.currentIdx[1];
        const c = this.currentIdx[2];

        let vals = new Array();
        // Normal steps
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

        vals.sort(function (a, b) {
            if (a[0] === b[0])
                return 0;
            else
                return (a[0] > b[0]) ? -1 : 1;
        });

        this.setMatrixValue(a, b, c, vals[0][0]);
    }

    public doOneStep() {
        this.incrementCell();
        this.calcCurrentCell();
    }

    public doAllSteps() {
        while(true) {
            this.incrementCell();
            this.calcCurrentCell();
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

// Test
/*
function nextStep() {
    try {
        aligner.doOneStep();
        aligner.drawMatrix(document.getElementById("matrixF"));
    }
    catch(e) {
    }
}

function allSteps() {
    try {
        aligner.doAllSteps();
    }
    catch(e) {
        aligner.drawMatrix(document.getElementById("matrixF"));
    }
}

let aligner = new SequenceAligner("AA", "AAC", "CAA");
aligner.setPenaltyPair("A", "A", 2);
aligner.setPenaltyPair("A", "C", -1);
aligner.setPenaltyPair("C", "C", 2);
aligner.setPenaltyPair("A", "-", -2);
aligner.setPenaltyPair("C", "-", -2);
aligner.setPenaltyPair("-", "-", 0);
*/

