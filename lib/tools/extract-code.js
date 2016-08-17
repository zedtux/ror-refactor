'use babel';

/*
 * Code extraction refactoring tool.
 *
 * When multiple lines have been selected, a new method is built with this code
 * and cursors are placed so that you can name the method and use it.
 *
 * When a single line of code has been selected, a new method is build with the
 * of code, and cursors are placed so that you can name and use it.
 */
export default class ExtractCode {

  constructor() {
    this.extractedCode = null;
    this.extractedCodePosition = null;
    this.rowCountBetweenExtractedCodeAndDef = 0;
    this.cursorColumnPositionBeforeCut = null;
  }

  refactor() {
    let editor = atom.workspace.getActiveTextEditor();
    let cursor = editor.getLastCursor();
    let grammar = editor.getGrammar();

    this.fetchCodeToBeRefactored(editor, cursor);

    let i, ref, rowNumber, methodDefIndentation;
    let methodDefFound = false;
    for (rowNumber = i = ref = cursor.getBufferRow(); ref <= 0 ? i <= 0 : i >= 0; rowNumber = ref <= 0 ? ++i : --i) {
      this.rowCountBetweenExtractedCodeAndDef++;

      // Ignore comments in and out of the current method
      if (editor.isBufferRowCommented(rowNumber)) {
        continue;
      } else {
        let row = editor.lineTextForBufferRow(rowNumber);
        let tokens = grammar.tokenizeLine(row).tokens;

        // Search for the first empty line before the 'def' of the current method
        if (methodDefFound) {
          let createSpaces = false;
          if (tokens[1]) { createSpaces = true; }
          this.execute(editor, cursor, rowNumber, methodDefIndentation, createSpaces);
          break;
        }

        // Detect the 'def' of the current method
        if (tokens[1] && tokens[1].value == 'def') {
          methodDefFound = true;
          methodDefIndentation = tokens[0].value;
        }
      }
    }
    this.rowCountBetweenExtractedCodeAndDef = 0;
  }

  /*
   * execute export the selected line of Ruby code in a new method
   * created on top of the method where the code has been selected.
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
  execute(editor, cursor, rowNumber, indentation, createSpaces) {
    this.writeMethodAt(editor, rowNumber, indentation, createSpaces);
    this.createCursorOnNewMethod(editor);
    this.moveCursorForRename(cursor, createSpaces);
  }

  fetchCodeToBeRefactored(editor, cursor) {
    editor.cutSelectedText();
    this.cursorColumnPositionBeforeCut = cursor.getBufferPosition().column;
    atom.clipboard.read();
    this.extractedCode = atom.clipboard.read();
  }

  writeMethodAt(editor, position, indentation, createSpaces) {
    let extractedMethodIndentationSpaces = Array(indentation.length + 1).join(' ');
    let extractedMethodInnerIndentation = extractedMethodIndentationSpaces + Array(3).join(' ');

    // Manage the case where the developer has selected a piece of code from
    // a line instead of multiple line of code
    if (this.extractedCode[0] == ' ') {
      editor.insertText(extractedMethodInnerIndentation + '\n');
    }

    let finalPosition = position;
    if (createSpaces)
      finalPosition++;

    editor.setCursorBufferPosition([finalPosition, indentation.length]);

    let refactoredMethod = "\n";
    refactoredMethod += extractedMethodIndentationSpaces;
    refactoredMethod += "def \n";

    // Manage the case where the developer has selected a piece of code from
    // a line instead of multiple line of code
    if (this.extractedCode[0] != ' ') {
      refactoredMethod += extractedMethodInnerIndentation;
    }
    refactoredMethod += this.extractedCode.replace(/\n$/, '');
    refactoredMethod += "\n";
    refactoredMethod += extractedMethodIndentationSpaces;
    refactoredMethod += "end\n";

    if (createSpaces)
      refactoredMethod += "\n";
      refactoredMethod += extractedMethodIndentationSpaces;

    editor.insertText(refactoredMethod);
    this.extractedCodePosition = finalPosition + 1;
  }

  createCursorOnNewMethod(editor) {
    let newMethodCursor = editor.addCursorAtBufferPosition([this.extractedCodePosition, 0]);
    newMethodCursor.moveToEndOfLine();
  }

  moveCursorForRename(cursor, createSpaces) {
    let newPosition = this.rowCountBetweenExtractedCodeAndDef - 1;
    if (createSpaces)
      newPosition--;

    cursor.setBufferPosition([cursor.getBufferRow() + newPosition, this.cursorColumnPositionBeforeCut]);
    if (this.cursorColumnPositionBeforeCut == 0)
      cursor.moveToEndOfLine();
  }
}
