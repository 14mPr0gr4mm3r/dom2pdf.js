(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('jspdf')) :
    typeof define === 'function' && define.amd ? define(['jspdf'], factory) :
    (global = global || self, factory(global.jsPDF));
}(this, (function (jsPDF) { 'use strict';

    jsPDF = jsPDF && Object.prototype.hasOwnProperty.call(jsPDF, 'default') ? jsPDF['default'] : jsPDF;

    var Renderer = (function (global) {
        function isTextNode(node) {
            return node.nodeType === Node.TEXT_NODE;
        }

        function isElement(node) {
            return node.nodeType == Node.ELEMENT_NODE;
        }

        function hasChildNodes(node) {
            return node.hasChildNodes() || node.childNodes.length > 0
        }

        function getTextNodeRect(textnode) {
            if(!isTextNode(textnode)) throw new Error('not a text node');

            var range = global.document.createRange();
            range.selectNode(textnode);
            
            return range.getBoundingClientRect()
        }

        var Renderer = function Renderer(mainElement, options) {
            options = options || {};
            this.props = options.props || {};
            this.opts = options.opts || {};
            this.baseElement = mainElement;
            console.log(this.baseElement);
        };

        // Renderer.prototype = Object.create(Promise.prototype);

        Renderer.prototype.props = {};
        Renderer.prototype.opts = {};
        Renderer.prototype.promise = null;

        Renderer.prototype.render = function render() {
            this._renderNode(this.baseElement, 0, 0, true);
        };

        Renderer.prototype._renderNode = function _renderNode(node, baseX, baseY, isBaseElement) {
            baseX = typeof baseX !== "undefined" ? baseX : 0;
            baseY = typeof baseY !== "undefined" ? baseY : 0;
            isBaseElement = typeof isBaseElement !== "undefined" ? isBaseElement : false;

            var self = this;

            this.promise = new Promise(function (resolve, reject) {
                if (isTextNode(node)) {
                    console.log(node.nodeValue);
                    console.log(node.offsetLeft);
                    console.log(node.offsetTop);

                    var content = node.nodeValue.trim();
                    var elem_x = getTextNodeRect(node).left - self.baseElement.offsetLeft;
                    var elem_y = getTextNodeRect(node).top - self.baseElement.offsetTop;
                    self.props.pdf.text(content, baseX + elem_x, baseY + elem_y);
                } else if (isElement(node)) {
                    // TODO: render element and his child nodes
                    self._paintNodeBox(node, baseX, baseY);
                    if (hasChildNodes(node)) {
                        var childNodes = isBaseElement
                            ? node.querySelectorAll(self.opts.pageClass)
                            : node.childNodes;

                        childNodes = Array.from(childNodes);

                        if (!childNodes.length) {
                            reject('No components/pages to render');
                        }

                        childNodes = childNodes.map(function (childNode) {
                            return self._renderNode(childNode, baseX, baseY)
                        });
                        Promise.all(childNodes)
                            .then(function () { resolve(self); })
                            .catch(function (e) { reject(e); });
                    }
                }
            });

            // Is needed?
            return this.promise
        };

        Renderer.prototype._paintNodeBox = function _paintNodeBox(node, baseX, baseY) {

            var styles = global.getComputedStyle(node);
            console.log(styles);
        };

        Renderer.prototype.then = function then(onFulfilled, onRejected) {
            return this.promise.then(onFulfilled, onRejected)
        };

        Renderer.prototype.catch = function (onRejected) {
            return this.promise.catch(onRejected)
        };

        if (typeof define === "function" && define) {
            define([], function () {
                return Renderer
            });
        } else if (typeof module !== "undefined" && module) {
            module.exports = Renderer;
        } else if (typeof global !== "undefined" && global) {
            global._D2PRenderer = Renderer;
        }

        return Renderer
    })(typeof window !== "undefined" && window);

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
      };

      Dom2Pdf.prototype.props = props;
      Dom2Pdf.prototype.opts = opts;
      Dom2Pdf.prototype.promise = null;

      Dom2Pdf.prototype.hasJsPdfLoaded = function hasJsPdfLoaded(scope) {
        if ((typeof scope !== "undefined" && scope) || (typeof jsPDF !== "undefined" && jsPDF)) {
          return (!!scope.jsPDF || !!jsPDF);
        }
        return false;
      };

      Dom2Pdf.prototype.render = function render() {
        // this._renderNode(this.baseElement);
        this.renderer.render();
      };

      Dom2Pdf.prototype.save = function save(filename) {
        return this.renderer.then(function(self) {
          self.props.pdf.save();
        }, function(e) { console.error(e); })
      };

      if (typeof define === "function" && define) {
        define(['jsPDF'], function() {
          return Dom2Pdf;
        });
      } else if (typeof module !== "undefined" && module) {
        module.exports = Dom2Pdf;
      } else if (typeof global !== "undefined" && global) {
        global.dom2pdf = Dom2Pdf;
      }

      return Dom2Pdf;
    })(typeof window !== "undefined" && window);

})));
