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
    var editor = atom.workspace.getActiveTextEditor();
    var cursor = editor.getLastCursor();
    var grammar = editor.getGrammar();

    this.extractMethodFetchBody(editor);

    var i, ref, rowNumber, methodDefIndentation;
    var methodDefFound = false;
    for (rowNumber = i = ref = cursor.getBufferRow(); ref <= 0 ? i <= 0 : i >= 0; rowNumber = ref <= 0 ? ++i : --i) {
      this.rowCountBetweenExtractedCodeAndDef++;
      // Ignore comments in and out of the current method
      if (editor.isBufferRowCommented(rowNumber)) {
        continue;
      } else {
        var row = editor.lineTextForBufferRow(rowNumber);
        var tokens = grammar.tokenizeLine(row).tokens;

        // Detect the 'def' of the current method
        if (tokens[1] && tokens[1].value == 'def') {
          methodDefFound = true;
          methodDefIndentation = tokens[0].value;
        }

        // Search for the first empty line before the 'def' of the current method
        if (methodDefFound && tokens[0] && tokens[0].value == '') {
          this.extractMethodExecute(editor, cursor, rowNumber, methodDefIndentation);
          break;
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
    var extractedMethodIndentationSpaces = Array(indentation.length + 1).join(' ');
    var extractedMethodInnerIndentation = extractedMethodIndentationSpaces + Array(3).join(' ');
    editor.insertText(extractedMethodInnerIndentation + '\n');

    editor.setCursorBufferPosition([position, indentation.length]);
    editor.insertText("\n" + extractedMethodIndentationSpaces + "def \n" + this.extractedMethod.replace(/\n$/, '') + "\n" + extractedMethodIndentationSpaces + "end\n");
    this.extractedMethodPosition = position + 1;
  },

  extractMethodCreateCursorOnNewMethod(editor) {
    var newMethodCursor = editor.addCursorAtBufferPosition([this.extractedMethodPosition, 0]);
    newMethodCursor.moveToEndOfLine();
  },

  extractMethodMoveCursorForRename(cursor) {
    cursor.setBufferPosition([cursor.getBufferRow() + this.rowCountBetweenExtractedCodeAndDef - 1, 0]);
    cursor.moveToEndOfLine();
  }
};
