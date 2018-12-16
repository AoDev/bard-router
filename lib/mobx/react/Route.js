"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Route = void 0;

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _mobxReact = require("mobx-react");

class Route extends _react.default.Component {
  constructor(props) {
    super(props);
    this.check = props.router.getRouteCheck(props.path);
  }

  render() {
    const _this$props = this.props,
          {
      router,
      Component,
      not
    } = _this$props,
          otherProps = (0, _objectWithoutPropertiesLoose2.default)(_this$props, ["router", "path", "Component", "not"]);
    const shouldRender = not ? !this.check.test(router.route) : this.check.test(router.route);
    return shouldRender ? _react.default.createElement(Component, otherProps) : null;
  }

}

exports.Route = Route;

var _default = (0, _mobxReact.inject)('router')((0, _mobxReact.observer)(Route));

exports.default = _default;
Route.propTypes = {
  Component: _propTypes.default.func.isRequired,
  not: _propTypes.default.bool.isRequired,
  router: _propTypes.default.shape({
    goTo: _propTypes.default.func.isRequired,
    getRouteCheck: _propTypes.default.func.isRequired
  }),
  path: _propTypes.default.string.isRequired
};
Route.defaultProps = {
  not: false
};