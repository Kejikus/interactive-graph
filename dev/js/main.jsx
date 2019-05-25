import {ipcRenderer} from 'electron';
import React, { Component } from 'react';
import * as ReactDOM from "react-dom";

import '../styles/index.sass';
import "materialize-css";

import Graph from './components/graph';
import SideBar from './components/sideBar';

ipcRenderer.on("log", (sender, msg) => console.log(msg));

class App extends Component {

	constructor(props) {
		super(props);
		this.adjacencyMatrix = React.createRef();
		this.graph = React.createRef();
		this.sideBar = React.createRef();
	}

	render() {

		console.log('render main');

		return (
			<div className="main-wrapper">
				<header className="upper-header card-panel">
					Interactive graph visualizer
				</header>
				<Graph className="content card-panel" ref={this.graph} sideBar={this.sideBar}/>
				<SideBar ref={this.sideBar}/>
			</div>
		);
	}
}

ReactDOM.render(
	<App/>,
	document.getElementById('root')
);
