"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Link = void 0;

var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutPropertiesLoose"));

require("core-js/modules/es6.function.bind");

var _mobxReact = require("mobx-react");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _isEqual = _interopRequireDefault(require("lodash/isEqual"));

class Link extends _react.default.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.check = props.router.getRouteCheck(props.to);
  }

  onClick(event) {
    event.preventDefault();
    const {
      onClick,
      to,
      router,
      params
    } = this.props;

    if (to) {
      router.goTo({
        route: to,
        params
      });
    }

    if (onClick) {
      onClick(to || null, event);
    }
  }

  render() {
    const _this$props = this.props,
          {
      to,
      active,
      params,
      router,
      className
    } = _this$props,
          otherProps = (0, _objectWithoutPropertiesLoose2.default)(_this$props, ["to", "active", "params", "onClick", "router", "className"]);
    const matchFullPath = router.route === to;
    let cssClasses = className || '';

    if (typeof active === 'boolean' && active === true || matchFullPath && (0, _isEqual.default)(params, router.params) || !matchFullPath && this.check.test(router.route)) {
      cssClasses += ' active';
    }

    return _react.default.createElement("a", (0, _extends2.default)({
      href: to,
      onClick: this.onClick
    }, otherProps, {
      className: cssClasses
    }), this.props.children);
  }

}

exports.Link = Link;

var _default = (0, _mobxReact.inject)('router')((0, _mobxReact.observer)(Link));

exports.default = _default;
Link.propTypes = {
  to: _propTypes.default.string,
  onClick: _propTypes.default.func,
  params: _propTypes.default.object,
  children: _propTypes.default.node,
  active: _propTypes.default.bool,
  router: _propTypes.default.shape({
    route: _propTypes.default.string.isRequired,
    getRouteCheck: _propTypes.default.func.isRequired
  }).isRequired,
  className: _propTypes.default.string
};
Link.defaultProps = {
  params: {}
};