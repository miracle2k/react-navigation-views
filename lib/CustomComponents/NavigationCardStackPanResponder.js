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

const { Animated, I18nManager } = require('react-native');
const NavigationAbstractPanResponder = require('../NavigationAbstractPanResponder');

function clamp(min, value, max) {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/**
 * The duration of the card animation in milliseconds.
 */
const ANIMATION_DURATION = 250;

/**
 * The threshold to invoke the `onNavigateBack` action.
 * For instance, `1 / 3` means that moving greater than 1 / 3 of the width of
 * the view will navigate.
 */
const POSITION_THRESHOLD = 1 / 3;

/**
 * The threshold (in pixels) to start the gesture action.
 */
const RESPOND_THRESHOLD = 15;

/**
 * The threshold (in pixels) to finish the gesture action.
 */
const DISTANCE_THRESHOLD = 100;

/**
 * Primitive gesture directions.
 */
const Directions = {
  'HORIZONTAL': 'horizontal',
  'VERTICAL': 'vertical'
};

/**
 * Pan responder that handles gesture for a card in the cards stack.
 *
 *     +------------+
 *   +-+            |
 * +-+ |            |
 * | | |            |
 * | | |  Focused   |
 * | | |   Card     |
 * | | |            |
 * +-+ |            |
 *   +-+            |
 *     +------------+
 */
class NavigationCardStackPanResponder extends NavigationAbstractPanResponder {

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
    const index = props.navigationState.index;
    const currentDragDistance = gesture[isVertical ? 'dy' : 'dx'];
    const currentDragPosition = gesture[isVertical ? 'moveY' : 'moveX'];
    const maxDragDistance = isVertical ? layout.height.__getValue() : layout.width.__getValue();

    const positionMax = isVertical ? props.gestureResponseDistance :
    /**
    * For horizontal scroll views, a distance of 30 from the left of the screen is the
    * standard maximum position to start touch responsiveness.
    */
    props.gestureResponseDistance || 30;

    if (positionMax != null && currentDragPosition > positionMax) {
      return false;
    }

    return Math.abs(currentDragDistance) > RESPOND_THRESHOLD && maxDragDistance > 0 && index > 0;
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

    const props = this._props;
    const layout = props.layout;
    const isVertical = this._isVertical;
    const axis = isVertical ? 'dy' : 'dx';
    const index = props.navigationState.index;
    const distance = isVertical ? layout.height.__getValue() : layout.width.__getValue();
    const currentValue = I18nManager.isRTL && axis === 'dx' ? this._startValue + gesture[axis] / distance : this._startValue - gesture[axis] / distance;

    const value = clamp(index - 1, currentValue, index);

    props.position.setValue(value);
  }

  onPanResponderRelease(event, gesture) {
    if (!this._isResponding) {
      return;
    }

    this._isResponding = false;

    const props = this._props;
    const isVertical = this._isVertical;
    const axis = isVertical ? 'dy' : 'dx';
    const index = props.navigationState.index;
    const distance = I18nManager.isRTL && axis === 'dx' ? -gesture[axis] : gesture[axis];

    props.position.stopAnimation(value => {
      this._reset();

      if (!props.onNavigateBack) {
        return;
      }

      if (distance > DISTANCE_THRESHOLD || value <= index - POSITION_THRESHOLD) {
        props.onNavigateBack();
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
  const responder = new NavigationCardStackPanResponder(direction, props);
  return responder.panHandlers;
}

function forHorizontal(props) {
  return createPanHandlers(Directions.HORIZONTAL, props);
}

function forVertical(props) {
  return createPanHandlers(Directions.VERTICAL, props);
}

module.exports = {
  // constants
  ANIMATION_DURATION,
  DISTANCE_THRESHOLD,
  POSITION_THRESHOLD,
  RESPOND_THRESHOLD,

  // enums
  Directions,

  // methods.
  forHorizontal,
  forVertical
};