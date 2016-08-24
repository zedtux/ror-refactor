'use babel';

export default class NewInteractorView {
  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div')
    this.element.classList.add('interactor-name-input')

    // Create input element
    this.interactorNameInput = document.createElement('atom-text-editor')
    this.interactorNameInput.setAttribute('mini', true)
    this.interactorNameInput.setAttribute('placeholder-text', 'Enter the name of the interactor (I.e: CreateUser)')
    this.element.appendChild(this.interactorNameInput)
    this.interactorNameInputModel = this.interactorNameInput.getModel()

    atom.commands.add(this.element, {
      'core:cancel': () => this.resetAndHide()
    });
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove()
    this.element = null
    this.interactorNameInputModel = null
    this.interactorNameInput.remove()
    this.interactorNameInput = null
    this.panel.destroy()
    this.panel = null
  }

  show() {
    this.panel = atom.workspace.addModalPanel({ item: this })
    this.panel.show()
    this.interactorNameInput.focus()
  }

  resetAndHide() {
    this.interactorNameInputModel.setText('')
    this.panel.hide()
  }

  getRootElement() {
    return this.element
  }

  getInteractorName() {
    return this.interactorNameInputModel.getText()
  }
}
