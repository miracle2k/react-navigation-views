import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';

const Tab = ({id, icon, activeTab, dispatch}) => (
  <TouchableOpacity onPress={() => {
    dispatch({ type: 'TabChange', id });
  }} style={[styles.tab, {backgroundColor: id === activeTab ? 'red' : 'white' }]}>
    <Image source={icon} style={styles.icon} resizeMode="contain" />
  </TouchableOpacity>
);

class TabExample extends Component {
  render() {
    const {activeTab, dispatch} = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{activeTab}</Text>
        <View style={styles.tabs}>
          {TABS.map(tab =>
            <Tab
              key={tab.id}
              id={tab.id}
              icon={tab.icon}
              activeTab={activeTab}
              dispatch={dispatch}
            />
          )}
        </View>
      </View>
    );
  }
}

const TABS = [
  {
    id: 'home',
    icon: require('./icons/user.png'),
    path: '/',
    title: 'Example Home',
  },
  {
    id: 'notifications',
    icon: require('./icons/globe.png'),
    path: '/notifications',
    title: 'Latest updates',
  },
  {
    id: 'settings',
    icon: require('./icons/gear.png'),
    path: '/settings',
    title: 'Customize',
  },
];

const defaultProps = {
  activeTab: 'home',
};

TabExample.reduceProps = function(prevProps, action) {

  // let state = {
  //   routes: [ {key: 'foo'} ],
  //   index: 0
  // };
  // NavigationStateUtils.push(state, {key: 'bar'})


  let props = prevProps || defaultProps;
  if (action.type === 'TabChange' && action.id !== props.activeTab) {
    return {
      ...props,
      activeTab: action.id,
    };
  }
  if (action.type === 'Back' && props.activeTab !== 'home') {
    return {
      ...props,
      activeTab: 'home',
    };
  }  
  return props;
};


TabExample.propsToTitle = function(props) {
  return TABS.find(t => t.id === props.activeTab).title;
};

TabExample.propsToPath = function(props) {
  return TABS.find(t => t.id === props.activeTab).path;
};

TabExample.pathToAction = function(path) {
  const tab = TABS.find(tab => tab.path === path);
  if (tab) {
    return {type: 'TabChange', id: tab.id};
  }
  return null;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  icon: {
    width: 100,
    height: 64,
    alignSelf: 'center',
    flex: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    height: 100,
  },
  tabs: {
    flexDirection: 'row',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
});

export default TabExample;
