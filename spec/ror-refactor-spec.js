'use babel';

import RorRefactor from '../lib/ror-refactor';
let fs = require('fs');

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('RorRefactor', () => {
  let editor, editorView, fixtureFileName;

  beforeEach(() => {
    jasmine.attachToDOM(atom.views.getView(atom.workspace));

    atom.packages.activatePackage('language-ruby');
    atom.packages.activatePackage('ror-refactor');
  });

  describe('when the ror-refactor:toggle event is triggered', () => {
    beforeEach(() => {
      waitsForPromise(() => {
        return atom.workspace.open(__dirname + '/fixtures/extract_method_1.rb');
      });

      runs(() => {
        editor = atom.workspace.getActiveTextEditor();
        editorView = atom.views.getView(editor);
      });
    });

    it('hides and shows the modal panel', () => {
      // Move cursor at the begining of the first line to be refactored
      editor.setCursorBufferPosition([3, 0]);
      // Select the entire line
      editor.selectLinesContainingCursors();
      // Select the next lines to refactored
      editor.selectDown(4);

      atom.commands.dispatch(editorView, 'ror-refactor:extract-method');

      /*
       * Testing extracted code
       */
      let expectedResult = fs.readFileSync(__dirname + '/fixtures/extract_method_1_expected.rb', 'utf8');
      expect(editor.getText()).toEqual(expectedResult);

      /*
       * Testing Cursors positions
       */
      let cursors = editor.getCursorBufferPositions();
      expect(cursors.length).toBe(2);

      // Sort cursors by row position
      cursors = cursors.sort(function(a, b) { return a.row > b.row; });

      // Check new method cursor position
      expect(cursors[0]).toEqual({ row: 2, column: 6 });
      // Check cutted code cursor position
      expect(cursors[1]).toEqual({ row: 11, column: 4 });
    });
  });

  describe('with comments on top of the method', () => {
    beforeEach(() => {
      waitsForPromise(() => {
        return atom.workspace.open(__dirname + '/fixtures/extract_method_2.rb');
      });

      runs(() => {
        editor = atom.workspace.getActiveTextEditor();
        editorView = atom.views.getView(editor);
      });
    });

    it('should create the new method on top of the comments', () => {
      // Move cursor at the begining of the first line to be refactored
      editor.setCursorBufferPosition([6, 0]);
      // Select the entire line
      editor.selectLinesContainingCursors();
      // Select the next lines to refactored
      editor.selectDown(4);

      atom.commands.dispatch(editorView, 'ror-refactor:extract-method');

      /*
       * Testing extracted code
       */
      let expectedResult = fs.readFileSync(__dirname + '/fixtures/extract_method_2_expected.rb', 'utf8');
      expect(editor.getText()).toEqual(expectedResult);

      /*
       * Testing Cursors positions
       */
      let cursors = editor.getCursorBufferPositions();
      expect(cursors.length).toBe(2);

      // Sort cursors by row position
      cursors = cursors.sort(function(a, b) { return a.row > b.row; });

      // Check new method cursor position
      expect(cursors[0]).toEqual({ row: 2, column: 6 });
      // Check cutted code cursor position
      expect(cursors[1]).toEqual({ row: 14, column: 4 });
    });
  });

  describe('with code on top of the method', () => {
    beforeEach(() => {
      waitsForPromise(() => {
        return atom.workspace.open(__dirname + '/fixtures/extract_method_3.rb');
      });

      runs(() => {
        editor = atom.workspace.getActiveTextEditor();
        editorView = atom.views.getView(editor);
      });
    });

    it('should create the new method between the code and the current method', () => {
      // Move cursor at the begining of the first line to be refactored
      editor.setCursorBufferPosition([4, 0]);
      // Select the entire line
      editor.selectLinesContainingCursors();
      // Select the next lines to refactored
      editor.selectDown(4);

      atom.commands.dispatch(editorView, 'ror-refactor:extract-method');

      /*
       * Testing extracted code
       */
      let expectedResult = fs.readFileSync(__dirname + '/fixtures/extract_method_3_expected.rb', 'utf8');
      expect(editor.getText()).toEqual(expectedResult);

      /*
       * Testing Cursors positions
       */
      let cursors = editor.getCursorBufferPositions();
      expect(cursors.length).toBe(2);

      // Sort cursors by row position
      cursors = cursors.sort(function(a, b) { return a.row > b.row; });

      // Check new method cursor position
      expect(cursors[0]).toEqual({ row: 4, column: 6 });
      // Check cutted code cursor position
      expect(cursors[1]).toEqual({ row: 13, column: 4 });
    });
  });
});
