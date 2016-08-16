'use babel';

import RorRefactor from '../lib/ror-refactor';
let fs = require('fs');

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('RorRefactor', () => {
  describe('ExtractLine', () => {
    let editor, editorView, fixtureBasePath, fixtureFileName;

    beforeEach(() => {
      jasmine.attachToDOM(atom.views.getView(atom.workspace));

      atom.packages.activatePackage('language-ruby');
      atom.packages.activatePackage('ror-refactor');

      fixtureBasePath = __dirname + '/fixtures/extract-line';
    });

    describe('with a space on top of the method', () => {
      beforeEach(() => {
        waitsForPromise(() => {
          return atom.workspace.open(fixtureBasePath + '/extract_line_1.rb');
        });

        runs(() => {
          editor = atom.workspace.getActiveTextEditor();
          editorView = atom.views.getView(editor);
        });
      });

      it('should create the new method on top of the current one', () => {
        // Move cursor at the begining of the first line to be refactored
        editor.setCursorBufferPosition([3, 43]);
        editor.selectRight(45);

        atom.commands.dispatch(editorView, 'ror-refactor:extract-method');

        /*
         * Testing extracted code
         */
        let expectedResult = fs.readFileSync(fixtureBasePath + '/extract_line_1_expected.rb', 'utf8');
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
        expect(cursors[1]).toEqual({ row: 7, column: 43 });
      });
    });
  });
});
