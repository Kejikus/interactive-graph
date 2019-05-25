import {ipcRenderer} from 'electron';
import React, { Component } from 'react';
import * as ReactDOM from "react-dom";

import '../styles/index.sass';
import "materialize-css";

import Graph from './components/graph';
import AdjacencyMatrix from './components/matrix';

ipcRenderer.on("log", (sender, msg) => console.log(msg));

class App extends Component {

	constructor(props) {
		super(props);
		this.adjacencyMatrix = React.createRef();
		this.graph = React.createRef();
	}


	render() {
		return (
			<div className="main-wrapper">
				<header className="upper-header card-panel">
					Interactive graph visualizer
				</header>
				<Graph className="content card-panel" ref={this.graph} adjacencyMatrix={this.adjacencyMatrix}/>
				<div className="side-bar card-panel">
					<AdjacencyMatrix ref={this.adjacencyMatrix} graph={this.graph}/>
					<ul className="hints">
						<li>Ctrl+Z / Ctrl+Shift+Z - Undo/redo</li>
						<li>Ctrl+D - Add node</li>
						<li>Ctrl+E - Add edge</li>
					</ul>
				</div>
			</div>
		);
	}
}

ReactDOM.render(
	<App/>,
	document.getElementById('root')
);
