'use babel';

import { CompositeDisposable } from 'atom';
import ExtractCode from './tools/extract-code';

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    let extractCode = new ExtractCode();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ror-refactor:extract-code': () => extractCode.refactor()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
  },
};
