'use babel';

/*
 * Generates the basic code of a PORO.
 */
export default class PoroTemplate {
  constructor(options) {
    this.interactorName = options.name
    this.interactorCode = this.cleanUpCode(options.code)
  }

  /*
   * Ensure havign only 1 indentation (2 spaces)
   * Remove empty line at the end
   *
   * TODO : Move this method in a file in order to share it with other templates
   *        and avoir code duplication
   */
  cleanUpCode(code) {
    let cleanedCode = code

    // When there are additionnal indentation spaces
    let additionnalIndentation = /(\s+)?\s{2}(def)/.exec(cleanedCode)[1]
    if (additionnalIndentation !== undefined) {
      let regex = new RegExp('^[ \t]{' + additionnalIndentation.length + '}', 'gm')
      cleanedCode = cleanedCode.replace(regex, '')
    }

    if (cleanedCode.charCodeAt(cleanedCode.length - 1) == 10)
      cleanedCode = cleanedCode.substring(0, cleanedCode.length - 1)

    return cleanedCode
  }

  defaultInteractorPath() {
    return 'app/services/'
  }

  getPath() {
    let servicePath = atom.config.get('ror-refactor.servicePath') || this.defaultInteractorPath()
    return servicePath + this.filenameFromClass() + '.rb'
  }

  /*
   * TODO : Move this method in a file in order to share it with other templates
   *        and avoir code duplication
   */
  filenameFromClass() {
    return this.interactorName.replace(/::/g, "/")
                              .replace(/([A-Z])/g, "_$1")
                              .replace(/^_/,'')
                              .replace(/\/_/g,'/')
                              .toLowerCase()
  }

  generate() {
    let interactor = 'class ' + this.interactorName + '\n';

    let additionnalModule = atom.config.get('ror-refactor.serviceAdditionnalModule')
    if (additionnalModule)
      interactor += '  include ' + additionnalModule + '\n'

    interactor += '\n'
    interactor += '  def call\n'
    interactor += '    # Here is your code\n'
    interactor += '  end\n'
    interactor += '\n'
    interactor += this.interactorCode + '\n'
    interactor += 'end\n'
    return interactor;
  }

  cursorBufferPosition() {
    return [7, 0];
  }
}
