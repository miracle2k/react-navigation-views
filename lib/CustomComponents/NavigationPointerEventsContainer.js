/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * Facebook, Inc. ("Facebook") owns all right, title and interest, including
 * all intellectual property and other proprietary rights, in and to the React
 * Native CustomComponents software (the "Software").  Subject to your
 * compliance with these terms, you are hereby granted a non-exclusive,
 * worldwide, royalty-free copyright license to (1) use and copy the Software;
 * and (2) reproduce and distribute the Software as part of your own software
 * ("Your Software").  Facebook reserves all rights not expressly granted to
 * you in this license agreement.
 *
 * THE SOFTWARE AND DOCUMENTATION, IF ANY, ARE PROVIDED "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES (INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE) ARE DISCLAIMED.
 * IN NO EVENT SHALL FACEBOOK OR ITS AFFILIATES, OFFICERS, DIRECTORS OR
 * EMPLOYEES BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THE SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * 
 */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const React = require('react');
const NavigationAnimatedValueSubscription = require('../NavigationAnimatedValueSubscription');

const invariant = require('fbjs/lib/invariant');

const MIN_POSITION_OFFSET = 0.01;

/**
 * Create a higher-order component that automatically computes the
 * `pointerEvents` property for a component whenever navigation position
 * changes.
 */
function create(Component) {

  class Container extends React.Component {

    constructor(props, context) {
      super(props, context);
      this._pointerEvents = this._computePointerEvents();
    }

    componentWillMount() {
      this._onPositionChange = this._onPositionChange.bind(this);
      this._onComponentRef = this._onComponentRef.bind(this);
    }

    componentDidMount() {
      this._bindPosition(this.props);
    }

    componentWillUnmount() {
      this._positionListener && this._positionListener.remove();
    }

    componentWillReceiveProps(nextProps) {
      this._bindPosition(nextProps);
    }

    render() {
      this._pointerEvents = this._computePointerEvents();
      return React.createElement(Component, _extends({}, this.props, {
        pointerEvents: this._pointerEvents,
        onComponentRef: this._onComponentRef
      }));
    }

    _onComponentRef(component) {
      this._component = component;
      if (component) {
        invariant(typeof component.setNativeProps === 'function', 'component must implement method `setNativeProps`');
      }
    }

    _bindPosition(props) {
      this._positionListener && this._positionListener.remove();
      this._positionListener = new NavigationAnimatedValueSubscription(props.position, this._onPositionChange);
    }

    _onPositionChange() {
      if (this._component) {
        const pointerEvents = this._computePointerEvents();
        if (this._pointerEvents !== pointerEvents) {
          this._pointerEvents = pointerEvents;
          this._component.setNativeProps({ pointerEvents });
        }
      }
    }

    _computePointerEvents() {
      const {
        navigationState,
        position,
        scene
      } = this.props;

      if (scene.isStale || navigationState.index !== scene.index) {
        // The scene isn't focused.
        return scene.index > navigationState.index ? 'box-only' : 'none';
      }

      const offset = position.__getAnimatedValue() - navigationState.index;
      if (Math.abs(offset) > MIN_POSITION_OFFSET) {
        // The positon is still away from scene's index.
        // Scene's children should not receive touches until the position
        // is close enough to scene's index.
        return 'box-only';
      }

      return 'auto';
    }
  }
  return Container;
}

module.exports = {
  create
};