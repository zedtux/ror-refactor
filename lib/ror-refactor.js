'use babel';

import { CompositeDisposable } from 'atom';
import ExtractMethod from './tools/extract-method';

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    let extractMethod = new ExtractMethod();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ror-refactor:extract-method': () => extractMethod.refactor()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
  },
};
