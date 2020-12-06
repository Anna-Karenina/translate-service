function LangException({ lang, project }) {
  this.name = 'blabla';
  this.message = `lang: ${lang} does not used in this ${project} project`;
  this.stack = new Error().stack;
}
LangException.prototype = Object.create(Error.prototype);
LangException.prototype.constructor = LangException;

export { LangException };

// export class LangException extends Error {
//   constructor(error) {
//     super(error);
//     this.name = 'LangException';
//     this.message = `lang: ${error.lang} does not used in this ${error.project} project`;
//   }
// }
