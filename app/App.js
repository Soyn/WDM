import React, { Component } from 'react';
import Header from './components/Header';
import Functionbar from './components/Functionbar';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import { Router, Route, browserHistory } from 'react-router'

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Functionbar />
        <Sidebar />
        {this.props.children}
      </div>
    );
  }
}

export default App;
