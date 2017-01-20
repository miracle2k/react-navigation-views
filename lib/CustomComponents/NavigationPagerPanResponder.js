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
 * @typechecks
 */
'use strict';

const NavigationAbstractPanResponder = require('../NavigationAbstractPanResponder');
const NavigationCardStackPanResponder = require('./NavigationCardStackPanResponder');
const { Animated, I18nManager } = require('react-native');

function clamp(min, value, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * Primitive gesture directions.
 */
const {
  ANIMATION_DURATION,
  POSITION_THRESHOLD,
  RESPOND_THRESHOLD,
  Directions
} = NavigationCardStackPanResponder;

/**
 * The threshold (in pixels) to finish the gesture action.
 */
const DISTANCE_THRESHOLD = 50;

/**
 * The threshold to trigger the gesture action. This determines the rate of the
 * flick when the action will be triggered
 */
const VELOCITY_THRESHOLD = 1.5;

/**
 * Pan responder that handles gesture for a card in the cards list.
 *
 * +-------------+-------------+-------------+
 * |             |             |             |
 * |             |             |             |
 * |             |             |             |
 * |    Next     |   Focused   |  Previous   |
 * |    Card     |    Card     |    Card     |
 * |             |             |             |
 * |             |             |             |
 * |             |             |             |
 * +-------------+-------------+-------------+
 */
class NavigationPagerPanResponder extends NavigationAbstractPanResponder {

  constructor(direction, props) {
    super();
    this._isResponding = false;
    this._isVertical = direction === Directions.VERTICAL;
    this._props = props;
    this._startValue = 0;
  }

  onMoveShouldSetPanResponder(event, gesture) {
    const props = this._props;

    if (props.navigationState.index !== props.scene.index) {
      return false;
    }

    const layout = props.layout;
    const isVertical = this._isVertical;
    const axis = isVertical ? 'dy' : 'dx';
    const index = props.navigationState.index;
    const distance = isVertical ? layout.height.__getValue() : layout.width.__getValue();

    return Math.abs(gesture[axis]) > RESPOND_THRESHOLD && distance > 0 && index >= 0;
  }

  onPanResponderGrant() {
    this._isResponding = false;
    this._props.position.stopAnimation(value => {
      this._isResponding = true;
      this._startValue = value;
    });
  }

  onPanResponderMove(event, gesture) {
    if (!this._isResponding) {
      return;
    }

    const {
      layout,
      navigationState,
      position,
      scenes
    } = this._props;

    const isVertical = this._isVertical;
    const axis = isVertical ? 'dy' : 'dx';
    const index = navigationState.index;
    const distance = isVertical ? layout.height.__getValue() : layout.width.__getValue();
    const currentValue = I18nManager.isRTL && axis === 'dx' ? this._startValue + gesture[axis] / distance : this._startValue - gesture[axis] / distance;

    const prevIndex = Math.max(0, index - 1);

    const nextIndex = Math.min(index + 1, scenes.length - 1);

    const value = clamp(prevIndex, currentValue, nextIndex);

    position.setValue(value);
  }

  onPanResponderRelease(event, gesture) {
    if (!this._isResponding) {
      return;
    }

    this._isResponding = false;

    const {
      navigationState,
      onNavigateBack,
      onNavigateForward,
      position
    } = this._props;

    const isVertical = this._isVertical;
    const axis = isVertical ? 'dy' : 'dx';
    const velocityAxis = isVertical ? 'vy' : 'vx';
    const index = navigationState.index;
    const distance = I18nManager.isRTL && axis === 'dx' ? -gesture[axis] : gesture[axis];
    const moveSpeed = I18nManager.isRTL && velocityAxis === 'vx' ? -gesture[velocityAxis] : gesture[velocityAxis];

    position.stopAnimation(value => {
      this._reset();
      if (distance > DISTANCE_THRESHOLD || value <= index - POSITION_THRESHOLD || moveSpeed > VELOCITY_THRESHOLD) {
        onNavigateBack && onNavigateBack();
        return;
      }

      if (distance < -DISTANCE_THRESHOLD || value >= index + POSITION_THRESHOLD || moveSpeed < -VELOCITY_THRESHOLD) {
        onNavigateForward && onNavigateForward();
      }
    });
  }

  onPanResponderTerminate() {
    this._isResponding = false;
    this._reset();
  }

  _reset() {
    const props = this._props;
    Animated.timing(props.position, {
      toValue: props.navigationState.index,
      duration: ANIMATION_DURATION
    }).start();
  }
}

function createPanHandlers(direction, props) {
  const responder = new NavigationPagerPanResponder(direction, props);
  return responder.panHandlers;
}

function forHorizontal(props) {
  return createPanHandlers(Directions.HORIZONTAL, props);
}

module.exports = {
  forHorizontal
};