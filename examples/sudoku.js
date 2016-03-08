// The sudoku solver is implemented using a finite domain constraint solver
// coffee! is just WebPack build-time magic, can be configured away
// Bundle using:
//   webpack examples/sudoku.js dist/examples/sudoku.js
var sudoku = require('coffee!./sudoku.coffee');

// Implement JsJob entrypoint.
// Should be kept small and call into other functions for the real work
window.jsJobRun = function(input, options, callback) {
  if (!input.board) {
    return callback(new Error("Missing .board property in input data"));
  }

  var solutions = sudoku.solveBoard(input.board);
  if (solutions.length == 0) {
    return callback(new Error("No solutions found"));
  }
  if (solutions.length > 1) {
    return callback(new Error(solutions.length + " solutions found. A proper Sudoku only has one."));
  }

  var result = solutions[0];
  return callback(null, result);
};
