/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const invariant = require('fbjs/lib/invariant');

/**
 * Utilities to perform atomic operation with navigate state and routes.
 *
 * ```javascript
 * const state1 = {key: 'page 1'};
 * const state2 = NavigationStateUtils.push(state1, {key: 'page 2'});
 * ```
 */
const NavigationStateUtils = {

  /**
   * Gets a route by key. If the route isn't found, returns `null`.
   */
  get(state, key) {
    return state.routes.find(route => route.key === key) || null;
  },

  /**
   * Returns the first index at which a given route's key can be found in the
   * routes of the navigation state, or -1 if it is not present.
   */
  indexOf(state, key) {
    return state.routes.map(route => route.key).indexOf(key);
  },

  /**
   * Returns `true` at which a given route's key can be found in the
   * routes of the navigation state.
   */
  has(state, key) {
    return !!state.routes.some(route => route.key === key);
  },

  /**
   * Pushes a new route into the navigation state.
   * Note that this moves the index to the positon to where the last route in the
   * stack is at.
   */
  push(state, route) {
    invariant(NavigationStateUtils.indexOf(state, route.key) === -1, 'should not push route with duplicated key %s', route.key);

    const routes = state.routes.slice();
    routes.push(route);

    return _extends({}, state, {
      index: routes.length - 1,
      routes
    });
  },

  /**
   * Pops out a route from the navigation state.
   * Note that this moves the index to the positon to where the last route in the
   * stack is at.
   */
  pop(state) {
    if (state.index <= 0) {
      // [Note]: Over-popping does not throw error. Instead, it will be no-op.
      return state;
    }
    const routes = state.routes.slice(0, -1);
    return _extends({}, state, {
      index: routes.length - 1,
      routes
    });
  },

  /**
   * Sets the focused route of the navigation state by index.
   */
  jumpToIndex(state, index) {
    if (index === state.index) {
      return state;
    }

    invariant(!!state.routes[index], 'invalid index %s to jump to', index);

    return _extends({}, state, {
      index
    });
  },

  /**
   * Sets the focused route of the navigation state by key.
   */
  jumpTo(state, key) {
    const index = NavigationStateUtils.indexOf(state, key);
    return NavigationStateUtils.jumpToIndex(state, index);
  },

  /**
   * Sets the focused route to the previous route.
   */
  back(state) {
    const index = state.index - 1;
    const route = state.routes[index];
    return route ? NavigationStateUtils.jumpToIndex(state, index) : state;
  },

  /**
   * Sets the focused route to the next route.
   */
  forward(state) {
    const index = state.index + 1;
    const route = state.routes[index];
    return route ? NavigationStateUtils.jumpToIndex(state, index) : state;
  },

  /**
   * Replace a route by a key.
   * Note that this moves the index to the positon to where the new route in the
   * stack is at.
   */
  replaceAt(state, key, route) {
    const index = NavigationStateUtils.indexOf(state, key);
    return NavigationStateUtils.replaceAtIndex(state, index, route);
  },

  /**
   * Replace a route by a index.
   * Note that this moves the index to the positon to where the new route in the
   * stack is at.
   */
  replaceAtIndex(state, index, route) {
    invariant(!!state.routes[index], 'invalid index %s for replacing route %s', index, route.key);

    if (state.routes[index] === route) {
      return state;
    }

    const routes = state.routes.slice();
    routes[index] = route;

    return _extends({}, state, {
      index,
      routes
    });
  },

  /**
   * Resets all routes.
   * Note that this moves the index to the positon to where the last route in the
   * stack is at if the param `index` isn't provided.
   */
  reset(state, routes, index) {
    invariant(routes.length && Array.isArray(routes), 'invalid routes to replace');

    const nextIndex = index === undefined ? routes.length - 1 : index;

    if (state.routes.length === routes.length && state.index === nextIndex) {
      const compare = (route, ii) => routes[ii] === route;
      if (state.routes.every(compare)) {
        return state;
      }
    }

    invariant(!!routes[nextIndex], 'invalid index %s to reset', nextIndex);

    return _extends({}, state, {
      index: nextIndex,
      routes
    });
  }
};

module.exports = NavigationStateUtils;