import React, { Component } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { CardStack, Header, StateUtils } from 'react-navigation-views';

const GreatView = ({dispatch, scene}) => (
  <View style={styles.container}>
    <Text style={styles.welcome}>
      Welcome to StackExample! {scene.route.key}
    </Text>
    <Text onPress={() => dispatch({type: 'OpenProfile'})}>
      Tap to open profile
    </Text>
  </View>
);

const StackExample = ({dispatch, navState}) => (
  <CardStack
    navigationState={navState}
    renderScene={props => <GreatView {...props} dispatch={dispatch} />}
    onNavigateBack={() => dispatch({type: 'Back'})}
    renderHeader={props => 
      <Header
        {...props}
        onNavigateBack={() => dispatch({type: 'Back'})}
        renderTitleComponent={props =>
          <Header.Title>
            {props.scene.route.key}
          </Header.Title>
        }
      />
    }
  />
);

const defaultProps = {
  navState: {
    index: 0,
    routes: [
      {key: 'Home', type: 'Home'},
    ],
  },
};

var i = 0;
StackExample.reduceProps = function(lastProps, action) {
  console.log('Handling action type: ', action.type);
  let props = lastProps || defaultProps;
  switch (action.type) {
    case 'OpenProfile':
      return {
        ...props,
        navState: StateUtils.push(props.navState, {key: 'profile-'+(i++)}),
      };
    case 'Back':
      const navState = StateUtils.pop(props.navState);
      if (navState !== props.navState) {
        return {...props, navState};
      }
      return props;
    default:
      return props;
  }
}

StackExample.propsToTitle = function(props) {
  return 'StackExample';
};

StackExample.propsToPath = function(props) {
  return '/';
};

StackExample.pathToAction = function(path) {
  return {type: 'OpenPath', path};
};


const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

export default StackExample;
