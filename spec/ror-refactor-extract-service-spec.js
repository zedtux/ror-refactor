'use babel'

import RorRefactor from '../lib/ror-refactor'
let fs = require('fs')

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('RorRefactor', () => {
  describe('ExtractService', () => {
    let editor, editorView, workspaceElement, activationPromise,
        fixtureBasePath, fixtureFileName

    beforeEach(() => {
      workspaceElement = atom.views.getView(atom.workspace)

      atom.packages.activatePackage('language-ruby')
      activationPromise = atom.packages.activatePackage('ror-refactor')

      fixtureBasePath = __dirname + '/fixtures/extract-service'
    });

    describe('with the Interactor gem', () => {
      beforeEach(() => {
        waitsForPromise(() => {
          return atom.workspace.open(fixtureBasePath + '/extract_service_1.rb')
        });

        runs(() => {
          editor = atom.workspace.getActiveTextEditor()
          editorView = atom.views.getView(editor)
        });
      });

      it('should create the new class with the selected code', () => {
        jasmine.attachToDOM(workspaceElement)

        expect(workspaceElement.querySelector('.interactor-name-input')).not.toExist()

        expect(atom.workspace.getPanes().length).toBe(1)

        // Move cursor at the begining of the first line to be refactored
        editor.setCursorBufferPosition([11, 0])
        // Select the entire line
        editor.selectLinesContainingCursors()
        // Select the next lines to refactored
        editor.selectDown(19)

        atom.commands.dispatch(editorView, 'ror-refactor:extract-code')

        waitsForPromise(() => {
          return activationPromise
        })

        runs(() => {
          let interactorNameModal = workspaceElement.querySelector('.interactor-name-input'),
              interactorNameModel = interactorNameModal.firstChild.getModel()

          expect(interactorNameModal).toBeVisible()
          expect(interactorNameModal).toHaveFocus()
          expect(interactorNameModel.isMini()).toBe(true)

          // Filling the interactor name
          interactorNameModel.setText('TestClassName')

          // Hitting the 'Enter' key
          let key = atom.keymaps.constructor.buildKeydownEvent('enter', { target: interactorNameModal })
          atom.keymaps.handleKeyboardEvent(key)

          expect(atom.workspace.getPanes().length).toBe(2)

          /*
           * Testing extracted code
           */
          let expectedResult = fs.readFileSync(fixtureBasePath + '/extract_service_1_expected.rb', 'utf8');
          expect(editor.getText()).toEqual(expectedResult);

          // TODO: Test the second pane code
        });
      });
    });
  });
});
