import Renderer from './renderer.js'
import jsPDF from 'jspdf'

var dom2pdf = (function(global) {

  var props = {};
  var opts = {};

  /**
   * @param {HTMLElement} baseElement The element based in the PDF will be built
   * @param {jsPDF} options.jsPDF An instance of jsPDF
   * @param {String} options.pageClass The class that will be used to select the elements that will be used as the content of the pages
   * @constructor
   */
  var Dom2Pdf = function Dom2Pdf(baseElement, options) {
    options = options || {};
    options.jsPDF = options.jsPDF || {};
    options.pageClass = options.pageClass || '.page';
    this.opts = Object.assign(this.opts, options);
    if (!this.hasJsPdfLoaded(global)) throw new Error('jsPDF was not loaded');
    this.props.pdf = new(jsPDF || global.jsPDF)(this.opts.jsPDF);
    this.renderer = new Renderer(baseElement || global.document.body, { props: this.props, opts: this.opts });
  }

  Dom2Pdf.prototype.props = props;
  Dom2Pdf.prototype.opts = opts;
  Dom2Pdf.prototype.promise = null;

  Dom2Pdf.prototype.hasJsPdfLoaded = function hasJsPdfLoaded(scope) {
    if ((typeof scope !== "undefined" && scope) || (typeof jsPDF !== "undefined" && jsPDF)) {
      return (!!scope.jsPDF || !!jsPDF);
    }
    return false;
  }

  Dom2Pdf.prototype.render = function render() {
    // this._renderNode(this.baseElement);
    this.renderer.render()
  }

  Dom2Pdf.prototype.save = function save(filename) {
    return this.renderer.then(function(self) {
      self.props.pdf.save()
    }, function(e) { console.error(e) })
  }

  if (typeof define === "function" && define) {
    define(['jsPDF'], function() {
      return Dom2Pdf;
    })
  } else if (typeof module !== "undefined" && module) {
    module.exports = Dom2Pdf;
  } else if (typeof global !== "undefined" && global) {
    global.dom2pdf = Dom2Pdf;
  }

  return Dom2Pdf;
})(typeof window !== "undefined" && window);