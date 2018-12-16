"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var mobx = _interopRequireWildcard(require("mobx"));

var _Router = _interopRequireDefault(require("../Router"));

const {
  observable,
  action,
  decorate
} = mobx;

var _default = decorate(_Router.default, {
  route: observable,
  params: observable.ref,
  goTo: action.bound,
  set: action.bound
});

exports.default = _default;