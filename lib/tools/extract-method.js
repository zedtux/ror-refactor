'use babel';

export default class ExtractMethod {

  constructor() {
    this.extractedMethod = null;
    this.extractedMethodPosition = null;
    this.rowCountBetweenExtractedCodeAndDef = 0;
  }

  refactor() {
    let editor = atom.workspace.getActiveTextEditor();
    let cursor = editor.getLastCursor();
    let grammar = editor.getGrammar();

    this.extractMethodFetchBody(editor);

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
          this.extractMethodExecute(editor, cursor, rowNumber, methodDefIndentation, createSpaces);
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
   * extractMethodExecute export the selected line of Ruby code in a new method
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
  extractMethodExecute(editor, cursor, rowNumber, indentation, createSpaces) {
    this.extractMethodWriteMethodAt(editor, rowNumber, indentation, createSpaces);
    this.extractMethodCreateCursorOnNewMethod(editor);
    this.extractMethodMoveCursorForRename(cursor, createSpaces);
  }

  extractMethodFetchBody(editor) {
    editor.cutSelectedText();
    atom.clipboard.read();
    this.extractedMethod = atom.clipboard.read();
  }

  extractMethodWriteMethodAt(editor, position, indentation, createSpaces) {
    let extractedMethodIndentationSpaces = Array(indentation.length + 1).join(' ');
    let extractedMethodInnerIndentation = extractedMethodIndentationSpaces + Array(3).join(' ');
    editor.insertText(extractedMethodInnerIndentation + '\n');

    let finalPosition = position;
    if (createSpaces)
      finalPosition++;

    editor.setCursorBufferPosition([finalPosition, indentation.length]);

    let refactoredMethod = "\n";
    refactoredMethod += extractedMethodIndentationSpaces;
    refactoredMethod += "def \n" + this.extractedMethod.replace(/\n$/, '');
    refactoredMethod += "\n";
    refactoredMethod += extractedMethodIndentationSpaces;
    refactoredMethod += "end\n";

    if (createSpaces)
      refactoredMethod += "\n";
      refactoredMethod += extractedMethodIndentationSpaces;

    editor.insertText(refactoredMethod);
    this.extractedMethodPosition = finalPosition + 1;
  }

  extractMethodCreateCursorOnNewMethod(editor) {
    let newMethodCursor = editor.addCursorAtBufferPosition([this.extractedMethodPosition, 0]);
    newMethodCursor.moveToEndOfLine();
  }

  extractMethodMoveCursorForRename(cursor, createSpaces) {
    let newPosition = this.rowCountBetweenExtractedCodeAndDef - 1;
    if (createSpaces)
      newPosition--;

    cursor.setBufferPosition([cursor.getBufferRow() + newPosition, 0]);
    cursor.moveToEndOfLine();
  }
}
