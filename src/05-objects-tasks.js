/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */

/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return {
    width,
    height,
    getArea: () => width * height,
  };
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}

/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
class ElementSelector {
  element(value) {
    if (this.elem) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    if (this.idValue || this.classArr || this.attrArr || this.pseudoClassArr || this.pseudoElem) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.elem = value;
    return this;
  }

  id(value) {
    if (this.idValue) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    if (this.classArr || this.attrArr || this.pseudoClassArr || this.pseudoElem) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.idValue = value;
    return this;
  }

  class(value) {
    if (this.attrArr || this.pseudoClassArr || this.pseudoElem) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    if (!this.classArr) {
      this.classArr = [];
    }
    this.classArr.push(value);
    return this;
  }

  attr(value) {
    if (this.pseudoClassArr || this.pseudoElem) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    if (!this.attrArr) {
      this.attrArr = [];
    }
    this.attrArr.push(value);
    return this;
  }

  pseudoClass(value) {
    if (this.pseudoElem) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    if (!this.pseudoClassArr) {
      this.pseudoClassArr = [];
    }
    this.pseudoClassArr.push(value);
    return this;
  }

  pseudoElement(value) {
    if (this.pseudoElem) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.pseudoElem = value;
    return this;
  }

  stringify() {
    const elem = this.elem ? this.elem : '';
    const id = this.idValue ? `#${this.idValue}` : '';
    const classes = this.classArr ? `.${this.classArr.join('.')}` : '';
    const attr = this.attrArr ? `[${this.attrArr.join('][')}]` : '';
    const pseudoClasses = this.pseudoClassArr
      ? `:${this.pseudoClassArr.join(':')}`
      : '';
    const pseudoElem = this.pseudoElem ? `::${this.pseudoElem}` : '';
    const text = `${elem + id + classes + attr + pseudoClasses + pseudoElem}${
      this.combinator ? this.combinator : ''
    }${this.selector2 ? this.selector2.stringify() : ''}`;
    return text;
  }

  combine(combinator, selector2) {
    this.combinator = ` ${combinator} `;
    this.selector2 = selector2;
    return this;
  }
}

const cssSelectorBuilder = {
  element(value) {
    const target = new ElementSelector();
    target.element(value);
    return target;
  },

  id(value) {
    const target = new ElementSelector();
    target.id(value);
    return target;
  },

  class(value) {
    const target = new ElementSelector();
    target.class(value);
    return target;
  },

  attr(value) {
    const target = new ElementSelector();
    target.attr(value);
    return target;
  },

  pseudoClass(value) {
    const target = new ElementSelector();
    target.pseudoClass(value);
    return target;
  },

  pseudoElement(value) {
    const target = new ElementSelector();
    target.pseudoElement(value);
    return target;
  },

  combine(selector1, combinator, selector2) {
    selector1.combine(combinator, selector2);
    return selector1;
  },
};

module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
