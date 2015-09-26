'use strict';

var test = require('tap').test,
  parse = require('../../../lib/parsers/javascript'),
  inferName = require('../../../lib/infer/name');

function toComment(fn, filename) {
  return parse([], {
    file: filename,
    source: fn instanceof Function ? '(' + fn.toString() + ')' : fn
  })[0];
}

function evaluate(fn, callback) {
  return inferName(toComment(fn, callback));
}

test('inferName', function (t) {
  t.equal(evaluate(function () {
    // ExpressionStatement (comment attached here)
    //   AssignmentExpression
    //     MemberExpression
    //     Identifier
    /** Test */
    exports.name = test;
  }).name, 'name', 'expression statement');

  t.equal(evaluate(function () {
    // ExpressionStatement
    //   AssignmentExpression
    //     MemberExpression (comment attached here)
    //     FunctionExpression
    /** Test */
    exports.name = function () {};
  }).name, 'name', 'expression statement, function');

  t.equal(evaluate(function () {
    exports = {
      // Property (comment attached here)
      //   Identifier
      //   FunctionExpression
      /** Test */
      name: test
    };
  }).name, 'name', 'property');

  t.equal(evaluate(function () {
    exports = {
      // Property
      //   Identifier (comment attached here)
      //   FunctionExpression
      /** Test */
      name: function () {}
    };
  }).name, 'name', 'property, function');

  t.equal(evaluate(function () {
    /** Test */
    function name() {}
    return name;
  }).name, 'name', 'function declaration');

  t.equal(evaluate(function () {
    /** Test */
    var name = function () {};
    return name;
  }).name, 'name', 'anonymous function expression');

  t.equal(evaluate(function () {
    /** Test */
    var name = function name2() {};
    return name;
  }).name, 'name', 'named function expression');

  t.equal(evaluate(function () {
    /** @name explicitName */
    function implicitName() {}
    return implicitName;
  }).name, 'explicitName', 'explicit name');

  t.equal(evaluate(function () {
    /** @class ExplicitClass */
    function ImplicitClass() {}
    return ImplicitClass;
  }).name, 'ExplicitClass', 'explicit class');

  t.equal(evaluate(function () {
    /** @class */
    function ImplicitClass() {}
    return ImplicitClass;
  }).name, 'ImplicitClass', 'anonymous class');

  t.equal(evaluate(function () {
    /** @event explicitEvent */
    function implicitName() {}
    return implicitName;
  }).name, 'explicitEvent', 'explicitEvent');

  t.equal(evaluate(function () {
    /** @typedef {Object} ExplicitTypedef */
    function implicitName() {}
    return implicitName;
  }).name, 'ExplicitTypedef', 'ExplicitTypedef');

  t.equal(evaluate(function () {
    /** @callback explicitCallback */
    function implicitName() {}
    return implicitName;
  }).name, 'explicitCallback', 'explicitCallback');

  t.end();
});
