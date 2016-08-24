'use babel'

import { CompositeDisposable } from 'atom'
import ExtractCode from './tools/extract-code'

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.extractCode = new ExtractCode(state);

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ror-refactor:extract-code': () => this.extractCode.refactor()
    }));
  },

  deactivate() {
    this.subscriptions.dispose()
    this.extractCode.deactivate()
    this.extractCode = null
  },

  serialize() {
    return this.extractCode.serialize()
  }
};
