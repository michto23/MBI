/* tslint:disable:no-unused-variable */

import {TestBed, async} from '@angular/core/testing';
import {SequenceAligner} from '../algorithm/algorithm';

function setTestPenaltyMatrix(a: SequenceAligner) {
  a.setPenaltyPair("A", "A", 2);
  a.setPenaltyPair("A", "C", -1);
  a.setPenaltyPair("A", "-", -2);
  a.setPenaltyPair("C", "C", 2);
  a.setPenaltyPair("C", "-", -2);
  a.setPenaltyPair("-", "-", 0);
}

describe('Algorithm tests', () => {
  it('should create an empty matrix with one zero', () => {
    let a = new SequenceAligner("A", "A", "A");
    setTestPenaltyMatrix(a);

    expect(a.getMatrixValue(0, 0, 0,)).toBe(0);
    expect(a.getMatrixValue(0, 0, 1,)).toBeNull();
    expect(a.getMatrixValue(0, 1, 0,)).toBeNull();
    expect(a.getMatrixValue(0, 1, 1,)).toBeNull();
    expect(a.getMatrixValue(1, 0, 0,)).toBeNull();
    expect(a.getMatrixValue(1, 0, 1,)).toBeNull();
    expect(a.getMatrixValue(1, 1, 0,)).toBeNull();
    expect(a.getMatrixValue(1, 1, 1,)).toBeNull();
  });

  it('should throw an exception when next step is not possible', () => {
    let a = new SequenceAligner("A", "A", "A");
    setTestPenaltyMatrix(a);

    try {
      while (true)
        a.doOneStep();
    }
    catch (e) {
      expect(e).toBe("finish");
    }
  });

  it('should generate correct values in the matrix when going step by step', () => {
    let a = new SequenceAligner("AA", "AAC", "CAA");
    setTestPenaltyMatrix(a);

    expect(a.getMatrixValue(0, 0, 0)).toBe(0);
    a.doOneStep();
    expect(a.getMatrixValue(1, 0, 0)).toBe(-4);
    a.doOneStep();
    expect(a.getMatrixValue(2, 0, 0)).toBe(-8);
    a.doOneStep();
    expect(a.getMatrixValue(0, 1, 0)).toBe(-4);
    a.doOneStep();
    expect(a.getMatrixValue(1, 1, 0)).toBe(-2);
    a.doOneStep();
    expect(a.getMatrixValue(2, 1, 0)).toBe(-6);
    a.doOneStep();
    expect(a.getMatrixValue(0, 2, 0)).toBe(-8);
    a.doOneStep();
    expect(a.getMatrixValue(1, 2, 0)).toBe(-6);
    a.doOneStep();
    expect(a.getMatrixValue(2, 2, 0)).toBe(-4);
    a.doOneStep();
    expect(a.getMatrixValue(0, 3, 0)).toBe(-12);
    a.doOneStep();
    expect(a.getMatrixValue(1, 3, 0)).toBe(-10);
    a.doOneStep();
    expect(a.getMatrixValue(2, 3, 0)).toBe(-8);
    a.doOneStep();
    expect(a.getMatrixValue(0, 0, 1)).toBe(-4);
    a.doOneStep();
    expect(a.getMatrixValue(1, 0, 1)).toBe(-5);
    a.doOneStep();
    expect(a.getMatrixValue(2, 0, 1)).toBe(-9);
    a.doOneStep();
    expect(a.getMatrixValue(0, 1, 1)).toBe(-5);
    a.doOneStep();
    expect(a.getMatrixValue(1, 1, 1)).toBe(0);
    a.doOneStep();
    expect(a.getMatrixValue(2, 1, 1)).toBe(-4);
    a.doOneStep();
    expect(a.getMatrixValue(0, 2, 1)).toBe(-9);
    a.doOneStep();
    expect(a.getMatrixValue(1, 2, 1)).toBe(-4);
    a.doOneStep();
    expect(a.getMatrixValue(2, 2, 1)).toBe(-2);
    a.doOneStep();
    expect(a.getMatrixValue(0, 3, 1)).toBe(-10);
    a.doOneStep();
    expect(a.getMatrixValue(1, 3, 1)).toBe(-8);
    a.doOneStep();
    expect(a.getMatrixValue(2, 3, 1)).toBe(-6);
    a.doOneStep();
    expect(a.getMatrixValue(0, 0, 2)).toBe(-8);
    a.doOneStep();
    expect(a.getMatrixValue(1, 0, 2)).toBe(-6);
    a.doOneStep();
    expect(a.getMatrixValue(2, 0, 2)).toBe(-7);
    a.doOneStep();
    expect(a.getMatrixValue(0, 1, 2)).toBe(-6);
    a.doOneStep();
    expect(a.getMatrixValue(1, 1, 2)).toBe(2);
    a.doOneStep();
    expect(a.getMatrixValue(2, 1, 2)).toBe(1);
    a.doOneStep();
    expect(a.getMatrixValue(0, 2, 2)).toBe(-7);
    a.doOneStep();
    expect(a.getMatrixValue(1, 2, 2)).toBe(1);
    a.doOneStep();
    expect(a.getMatrixValue(2, 2, 2)).toBe(6);
    a.doOneStep();
    expect(a.getMatrixValue(0, 3, 2)).toBe(-11);
    a.doOneStep();
    expect(a.getMatrixValue(1, 3, 2)).toBe(-3);
    a.doOneStep();
    expect(a.getMatrixValue(2, 3, 2)).toBe(2);
    a.doOneStep();
    expect(a.getMatrixValue(0, 0, 3)).toBe(-12);
    a.doOneStep();
    expect(a.getMatrixValue(1, 0, 3)).toBe(-10);
    a.doOneStep();
    expect(a.getMatrixValue(2, 0, 3)).toBe(-8);
    a.doOneStep();
    expect(a.getMatrixValue(0, 1, 3)).toBe(-10);
    a.doOneStep();
    expect(a.getMatrixValue(1, 1, 3)).toBe(-2);
    a.doOneStep();
    expect(a.getMatrixValue(2, 1, 3)).toBe(0);
    a.doOneStep();
    expect(a.getMatrixValue(0, 2, 3)).toBe(-8);
    a.doOneStep();
    expect(a.getMatrixValue(1, 2, 3)).toBe(0);
    a.doOneStep();
    expect(a.getMatrixValue(2, 2, 3)).toBe(8);
    a.doOneStep();
    expect(a.getMatrixValue(0, 3, 3)).toBe(-12);
    a.doOneStep();
    expect(a.getMatrixValue(1, 3, 3)).toBe(-4);
    try {
      a.doOneStep();
    }
    catch (e) {

    }
    expect(a.getMatrixValue(2, 3, 3)).toBe(4);
  });

  it('should generate values in the matrix after going all steps at once', () => {
    let a = new SequenceAligner("AA", "AAC", "CAA");
    setTestPenaltyMatrix(a);

    a.doAllSteps();
    expect(a.getMatrixValue(0, 0, 0)).toBe(0);
    expect(a.getMatrixValue(1, 0, 0)).toBe(-4);
    expect(a.getMatrixValue(2, 0, 0)).toBe(-8);
    expect(a.getMatrixValue(0, 1, 0)).toBe(-4);
    expect(a.getMatrixValue(1, 1, 0)).toBe(-2);
    expect(a.getMatrixValue(2, 1, 0)).toBe(-6);
    expect(a.getMatrixValue(0, 2, 0)).toBe(-8);
    expect(a.getMatrixValue(1, 2, 0)).toBe(-6);
    expect(a.getMatrixValue(2, 2, 0)).toBe(-4);
    expect(a.getMatrixValue(0, 3, 0)).toBe(-12);
    expect(a.getMatrixValue(1, 3, 0)).toBe(-10);
    expect(a.getMatrixValue(2, 3, 0)).toBe(-8);
    expect(a.getMatrixValue(0, 0, 1)).toBe(-4);
    expect(a.getMatrixValue(1, 0, 1)).toBe(-5);
    expect(a.getMatrixValue(2, 0, 1)).toBe(-9);
    expect(a.getMatrixValue(0, 1, 1)).toBe(-5);
    expect(a.getMatrixValue(1, 1, 1)).toBe(0);
    expect(a.getMatrixValue(2, 1, 1)).toBe(-4);
    expect(a.getMatrixValue(0, 2, 1)).toBe(-9);
    expect(a.getMatrixValue(1, 2, 1)).toBe(-4);
    expect(a.getMatrixValue(2, 2, 1)).toBe(-2);
    expect(a.getMatrixValue(0, 3, 1)).toBe(-10);
    expect(a.getMatrixValue(1, 3, 1)).toBe(-8);
    expect(a.getMatrixValue(2, 3, 1)).toBe(-6);
    expect(a.getMatrixValue(0, 0, 2)).toBe(-8);
    expect(a.getMatrixValue(1, 0, 2)).toBe(-6);
    expect(a.getMatrixValue(2, 0, 2)).toBe(-7);
    expect(a.getMatrixValue(0, 1, 2)).toBe(-6);
    expect(a.getMatrixValue(1, 1, 2)).toBe(2);
    expect(a.getMatrixValue(2, 1, 2)).toBe(1);
    expect(a.getMatrixValue(0, 2, 2)).toBe(-7);
    expect(a.getMatrixValue(1, 2, 2)).toBe(1);
    expect(a.getMatrixValue(2, 2, 2)).toBe(6);
    expect(a.getMatrixValue(0, 3, 2)).toBe(-11);
    expect(a.getMatrixValue(1, 3, 2)).toBe(-3);
    expect(a.getMatrixValue(2, 3, 2)).toBe(2);
    expect(a.getMatrixValue(0, 0, 3)).toBe(-12);
    expect(a.getMatrixValue(1, 0, 3)).toBe(-10);
    expect(a.getMatrixValue(2, 0, 3)).toBe(-8);
    expect(a.getMatrixValue(0, 1, 3)).toBe(-10);
    expect(a.getMatrixValue(1, 1, 3)).toBe(-2);
    expect(a.getMatrixValue(2, 1, 3)).toBe(0);
    expect(a.getMatrixValue(0, 2, 3)).toBe(-8);
    expect(a.getMatrixValue(1, 2, 3)).toBe(0);
    expect(a.getMatrixValue(2, 2, 3)).toBe(8);
    expect(a.getMatrixValue(0, 3, 3)).toBe(-12);
    expect(a.getMatrixValue(1, 3, 3)).toBe(-4);
  });

  it('should generate a correct solution when going step by step', () => {
    let a = new SequenceAligner("AA", "AAC", "CAA");
    setTestPenaltyMatrix(a);

    try {
      while (true)
        a.doOneStep();
    }
    catch (e) {
    }

    const solution = a.getSolutions();
    expect(solution[0]).toEqual(["-AA-", "-AAC", "CAA-"]);
    expect(solution[1]).toEqual([[0, 0, 0], [0, 0, 1], [1, 1, 2], [2, 2, 3], [2, 3, 3]]);
  });

  it('should generate a correct solution when going all steps at once', () => {
    let a = new SequenceAligner("AA", "AAC", "CAA");
    setTestPenaltyMatrix(a);

    a.doAllSteps();

    const solution = a.getSolutions();
    expect(solution[0]).toEqual(["-AA-", "-AAC", "CAA-"]);
    expect(solution[1]).toEqual([[0, 0, 0], [0, 0, 1], [1, 1, 2], [2, 2, 3], [2, 3, 3]]);
  });
});
