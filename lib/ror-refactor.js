'use babel';

import { CompositeDisposable } from 'atom';

export default {

  subscriptions: null,
  extractedMethod: null,
  extractedMethodPosition: null,
  rowCountBetweenExtractedCodeAndDef: 0,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ror-refactor:extract-method': () => this.extractMethod()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
  },

  extractMethod() {
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
          let finalPosition = rowNumber;
          if (tokens[1]) { finalPosition++; }
          this.extractMethodExecute(editor, cursor, finalPosition, methodDefIndentation);
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
  },

  extractMethodExecute(editor, cursor, rowNumber, indentation) {
    this.extractMethodWriteMethodAt(editor, rowNumber, indentation);
    this.extractMethodCreateCursorOnNewMethod(editor);
    this.extractMethodMoveCursorForRename(cursor);
  },

  extractMethodFetchBody(editor) {
    editor.cutSelectedText();
    atom.clipboard.read();
    this.extractedMethod = atom.clipboard.read();
  },

  extractMethodWriteMethodAt(editor, position, indentation) {
    let extractedMethodIndentationSpaces = Array(indentation.length + 1).join(' ');
    let extractedMethodInnerIndentation = extractedMethodIndentationSpaces + Array(3).join(' ');
    editor.insertText(extractedMethodInnerIndentation + '\n');

    editor.setCursorBufferPosition([position, indentation.length]);

    let refactoredMethod = "\n";
    refactoredMethod += extractedMethodIndentationSpaces;
    refactoredMethod += "def \n" + this.extractedMethod.replace(/\n$/, '');
    refactoredMethod += "\n";
    refactoredMethod += extractedMethodIndentationSpaces;
    refactoredMethod += "end\n";

    if (position > 1)
      refactoredMethod += "\n";
      refactoredMethod += extractedMethodIndentationSpaces;

    editor.insertText(refactoredMethod);
    this.extractedMethodPosition = position + 1;
  },

  extractMethodCreateCursorOnNewMethod(editor) {
    let newMethodCursor = editor.addCursorAtBufferPosition([this.extractedMethodPosition, 0]);
    newMethodCursor.moveToEndOfLine();
  },

  extractMethodMoveCursorForRename(cursor) {
    cursor.setBufferPosition([cursor.getBufferRow() + this.rowCountBetweenExtractedCodeAndDef - 1, 0]);
    cursor.moveToEndOfLine();
  }
};
