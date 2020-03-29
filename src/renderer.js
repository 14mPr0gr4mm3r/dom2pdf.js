export default (function (global) {
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

        var range = global.document.createRange()
        range.selectNode(textnode)
        
        return range.getBoundingClientRect()
    }

    var Renderer = function Renderer(mainElement, options) {
        options = options || {}
        this.props = options.props || {}
        this.opts = options.opts || {}
        this.baseElement = mainElement
        console.log(this.baseElement)
    };

    // Renderer.prototype = Object.create(Promise.prototype);

    Renderer.prototype.props = {}
    Renderer.prototype.opts = {}
    Renderer.prototype.promise = null;

    Renderer.prototype.render = function render() {
        this._renderNode(this.baseElement, 0, 0, true);
    }

    Renderer.prototype._renderNode = function _renderNode(node, baseX, baseY, isBaseElement) {
        baseX = typeof baseX !== "undefined" ? baseX : 0
        baseY = typeof baseY !== "undefined" ? baseY : 0
        isBaseElement = typeof isBaseElement !== "undefined" ? isBaseElement : false

        var self = this

        this.promise = new Promise(function (resolve, reject) {
            if (isTextNode(node)) {
                console.log(node.nodeValue)
                console.log(node.offsetLeft)
                console.log(node.offsetTop)

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

                    childNodes = Array.from(childNodes)

                    if (!childNodes.length) {
                        reject('No components/pages to render')
                    }

                    childNodes = childNodes.map(function (childNode) {
                        return self._renderNode(childNode, baseX, baseY)
                    })
                    Promise.all(childNodes)
                        .then(function () { resolve(self) })
                        .catch(function (e) { reject(e) });
                }
            }
        })

        // Is needed?
        return this.promise
    }

    Renderer.prototype._paintNodeBox = function _paintNodeBox(node, baseX, baseY) {
        baseX = baseX || 0
        baseY = baseY || 0

        var styles = global.getComputedStyle(node)
        console.log(styles)
    }

    Renderer.prototype.then = function then(onFulfilled, onRejected) {
        return this.promise.then(onFulfilled, onRejected)
    }

    Renderer.prototype.catch = function (onRejected) {
        return this.promise.catch(onRejected)
    }

    if (typeof define === "function" && define) {
        define([], function () {
            return Renderer
        })
    } else if (typeof module !== "undefined" && module) {
        module.exports = Renderer;
    } else if (typeof global !== "undefined" && global) {
        global._D2PRenderer = Renderer;
    }

    return Renderer
})(typeof window !== "undefined" && window)