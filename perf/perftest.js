const {
  performance
} = require('perf_hooks');
const alg = require('./algorithm.js');

/**
 * The number of averaged measurements.
 * @type {number}
 */
const N = 10;

/**
 * Generates a random DNA sequence of a given length.
 * @param len Length of the sequence.
 */
function DNA(len) {
  var out = "";
  for (var i = 0; i < len; ++i) {
    const s = Math.floor(Math.random() * 4);
    switch (s) {
      case 0:
        out += "A";
        break;
      case 1:
        out += "C";
        break;
      case 2:
        out += "G";
        break;
      case 3:
        out += "T";
        break;
    }
  }

  return out;
}

/**
 * Runs a performance test for a given length of the input sequences.
 * @param len Length of the input sequences.
 */
function perf(len) {
  var time = 0.0;

  for (var i = 0; i < N; ++i) {
    const aligner = new alg.SequenceAligner(DNA(len), DNA(len), DNA(len));
    // A random penalty matrix
    aligner.setPenaltyPair("A", "A", 8);
    aligner.setPenaltyPair("A", "G", -1);
    aligner.setPenaltyPair("A", "C", -2);
    aligner.setPenaltyPair("A", "T", -3);
    aligner.setPenaltyPair("A", "-", -5);
    aligner.setPenaltyPair("G", "A", -1);
    aligner.setPenaltyPair("G", "G", 7);
    aligner.setPenaltyPair("G", "C", -4);
    aligner.setPenaltyPair("G", "T", -2);
    aligner.setPenaltyPair("G", "-", -5);
    aligner.setPenaltyPair("C", "A", -2);
    aligner.setPenaltyPair("C", "G", -4);
    aligner.setPenaltyPair("C", "C", 6);
    aligner.setPenaltyPair("C", "T", -1);
    aligner.setPenaltyPair("C", "-", -5);
    aligner.setPenaltyPair("T", "A", -3);
    aligner.setPenaltyPair("T", "G", -2);
    aligner.setPenaltyPair("T", "C", -1);
    aligner.setPenaltyPair("T", "T", 8);
    aligner.setPenaltyPair("T", "-", -5);
    aligner.setPenaltyPair("-", "A", -5);
    aligner.setPenaltyPair("-", "G", -5);
    aligner.setPenaltyPair("-", "C", -5);
    aligner.setPenaltyPair("-", "T", -5);
    aligner.setPenaltyPair("-", "-", 0);

    var t0 = performance.now();
    aligner.doAllSteps();
    var t1 = performance.now();
    time += (t1 - t0);
  }

  time /= N;

  console.log("t(n = " + len + ") = " + Math.round(time * 10) / 10 + " ms");
}

// Perform the tests
perf(10);
perf(20);
perf(30);
perf(40);
perf(50);
perf(100);
