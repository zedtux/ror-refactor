'use babel';

import InteractorTemplate from '../templates/interactor'
import NewInteractorView from '../views/new-interactor-view'

/*
 * Code extraction refactoring tool.
 *
 */
export default class ExtractCode {

  constructor(state) {
    this.resetVariables()

    // Prepare Sercice refactoring view
    this.newInteractorView = new NewInteractorView(state.newInteractorViewState)
  }

  resetVariables() {
    this.editor = null
    this.extractedCode = null
    this.extractedCodePosition = null
    this.rowCountBetweenExtractedCodeAndDef = 0
    this.cursorColumnPositionBeforeCut = null
    this.newInteractorName = null
  }

  deactivate() {
    this.resetVariables()
  }

  serialize() {
    return {
      newInteractorViewState: this.newInteractorView.serialize()
    };
  }

  updateActiveEditor() {
    this.editor = this.editor = atom.workspace.getActiveTextEditor()
  }

  refactor() {
    this.updateActiveEditor()

    switch(this.extractType()) {
      case 'method':
      case 'line':
        this.extractMethodOrLine()
        break;
      case 'service':
        this.showInteractorNameModal()
        break;
      default:
        this.showUnknownRefactoringError()
    }
  }

  /*
   * Determine the type of refactoring to be executed based on the content of
   * the fetched code (see fetchCodeToBeRefactored).
   *
   * When the selected code is a part of a line of code, like for instance
   * the selected code is "Model.method1.method2.method3", then a "Line"
   * refactoring will be executed.
   *
   * When the selected code is composed of multiple lines of code, then a
   * "Method" refactoring will be executed.
   *
   * Finally, when the selected code is composed of multiple methods (multiple
   * "def" and "end"), then a "Service" refactoring will be executed.
   */
  extractType() {
    this.editor.copySelectedText()
    let selectedCode = atom.clipboard.read()

    if (selectedCode.search(/def/) == -1) {
      if (selectedCode[0] == ' ') {
        return 'method'
      } else {
        return 'line'
      }
    } else {
      return 'service'
    }
  }

  extractMethodOrLine() {
    let i, ref, rowNumber, methodDefIndentation, methodDefFound = false,
        grammar = this.editor.getGrammar(),
        cursor = this.editor.getLastCursor()

    this.fetchCodeToBeRefactored(cursor)

    for (rowNumber = i = ref = cursor.getBufferRow(); ref <= 0 ? i <= 0 : i >= 0; rowNumber = ref <= 0 ? ++i : --i) {
      this.rowCountBetweenExtractedCodeAndDef++

      // Ignore comments in and out of the current method
      if (this.editor.isBufferRowCommented(rowNumber)) {
        continue
      } else {
        let row = this.editor.lineTextForBufferRow(rowNumber),
            tokens = grammar.tokenizeLine(row).tokens

        // Search for the first empty line before the 'def' of the current method
        if (methodDefFound) {
          let createSpaces = false
          if (tokens[1]) { createSpaces = true }
          this.refactorAsNewMethod(cursor, rowNumber, methodDefIndentation, createSpaces)
          break
        }

        // Detect the 'def' of the current method
        if (tokens[1] && tokens[1].value == 'def') {
          methodDefFound = true
          methodDefIndentation = tokens[0].value
        }
      }
    }

    this.rowCountBetweenExtractedCodeAndDef = 0
  }

  showInteractorNameModal() {
    // When hitting Enter on the modal, call the extractService function
    // which will handle the modal closure and name fetching from user input
    atom.commands.add(this.newInteractorView.getRootElement(), {
      'core:confirm': () => this.extractService()
    });

    // Show the modal
    this.newInteractorView.show()
  }

  extractService() {
    let interactorName = this.newInteractorView.getInteractorName(),
        cursor = this.editor.getLastCursor()

    if (interactorName == '')
      return

    this.newInteractorView.resetAndHide()

    this.fetchCodeToBeRefactored(cursor)

    this.newInteractorName = interactorName
    this.createInteractor()
  }

  fetchCodeToBeRefactored(cursor) {
    this.editor.cutSelectedText()
    this.cursorColumnPositionBeforeCut = cursor.getBufferPosition().column
    atom.clipboard.read()
    this.extractedCode = atom.clipboard.read()
  }

  /*
   * Exports the selected line of Ruby code in a new method created on to of the
   * method where the code has been selected.
   *
   * param editor Atom editor instance.
   * param cursor Atom cursor instance.
   * param rowNumber Integer of the position in the file where to add the new
   *                 method.
   * param indentation Indentation spaces string from the method where the code
   *                   has been cutted.
   * param createSpaces Boolean which determine if the function has to add
   *                    spaces in order to add the new method.
   *                    (Also see the test "with code on top of the method").
   */
  refactorAsNewMethod(cursor, rowNumber, indentation, createSpaces) {
    this.writeMethodAt(rowNumber, indentation, createSpaces)
    this.createCursorOnNewMethod()
    this.moveCursorForRename(cursor, createSpaces)
  }

  writeMethodAt(position, indentation, createSpaces) {
    let extractedMethodIndentationSpaces = Array(indentation.length + 1).join(' ')
    let extractedMethodInnerIndentation = extractedMethodIndentationSpaces + Array(3).join(' ')

    // Manage the case where the developer has selected a piece of code from
    // a line instead of multiple line of code
    if (this.extractedCode[0] == ' ') {
      this.editor.insertText(extractedMethodInnerIndentation + '\n')
    }

    let finalPosition = position
    if (createSpaces)
      finalPosition++

    this.editor.setCursorBufferPosition([finalPosition, indentation.length])

    let refactoredMethod = "\n"
    refactoredMethod += extractedMethodIndentationSpaces
    refactoredMethod += "def \n"

    // Manage the case where the developer has selected a piece of code from
    // a line instead of multiple line of code
    if (this.extractedCode[0] != ' ') {
      refactoredMethod += extractedMethodInnerIndentation
    }
    refactoredMethod += this.extractedCode.replace(/\n$/, '')
    refactoredMethod += "\n"
    refactoredMethod += extractedMethodIndentationSpaces
    refactoredMethod += "end\n"

    if (createSpaces)
      refactoredMethod += "\n"
      refactoredMethod += extractedMethodIndentationSpaces

    this.editor.insertText(refactoredMethod)
    this.extractedCodePosition = finalPosition + 1
  }

  createCursorOnNewMethod() {
    let newMethodCursor = this.editor.addCursorAtBufferPosition([this.extractedCodePosition, 0])
    newMethodCursor.moveToEndOfLine()
  }

  moveCursorForRename(cursor, createSpaces) {
    let newPosition = this.rowCountBetweenExtractedCodeAndDef - 1
    if (createSpaces)
      newPosition--

    cursor.setBufferPosition([cursor.getBufferRow() + newPosition, this.cursorColumnPositionBeforeCut])
    if (this.cursorColumnPositionBeforeCut == 0)
      cursor.moveToEndOfLine()
  }

  showUnknownRefactoringError() {
    atom.notifications.addError('ror-refactor ERROR: Unable to define how to ' +
                                ' refactor the selected code.')
  }

  isSinglePane() {
    return atom.workspace.getPanes().length == 1
  }

  openNewPaneIfNeeded() {
    let openOptions = {}
    if (this.isSinglePane())
      openOptions = { split: 'right' }
    else
      atom.workspace.activateNextPane()

    return openOptions
  }

  createInteractor() {
    let openOptions = this.openNewPaneIfNeeded()

    // Build the basic Interactor code in the new pane
    this.interactorTemplate = new InteractorTemplate({
      name: this.newInteractorName,
      code: this.extractedCode
    })

    promise = atom.workspace.open(this.interactorTemplate.getPath(), openOptions)

    promise.then((editor) => {
      editor.setText(this.interactorTemplate.generate())
      editor.setGrammar(atom.grammars.grammarForScopeName('source.ruby'))
    })
  }
}
