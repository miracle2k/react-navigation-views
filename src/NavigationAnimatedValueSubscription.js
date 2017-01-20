/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */
'use strict';

import type  {
  NavigationAnimatedValue
} from './NavigationTypeDefinition';

class NavigationAnimatedValueSubscription {
  _value: NavigationAnimatedValue;
  _token: string;

  constructor(value: NavigationAnimatedValue, callback: Function) {
    this._value = value;
    this._token = value.addListener(callback);
  }

  remove(): void {
    this._value.removeListener(this._token);
  }
}

module.exports = NavigationAnimatedValueSubscription;
