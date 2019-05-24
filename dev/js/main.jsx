import {ipcRenderer} from 'electron';
import React, { Component } from 'react';
import * as ReactDOM from "react-dom";

import '../styles/index.sass';
import "materialize-css";

import Graph from './components/graph';

ipcRenderer.on("log", (sender, msg) => console.log(msg));

class IncidenceMatrix extends Component {

	constructor(props) {
		super(props);
		this.state = {
			collection: {
				nodes: [],
				edges: []
			}
		}
	}


	setData(collection) {
		this.setState({collection: collection});
	}

	render() {

		const header = this.state.collection.nodes.map((node, index) => {
			return (
				<th key={ node.data.id }>{ node.data.id }</th>
			);
		});

		return (
			<table className="incidence-matrix">
				<tbody>
				<tr>
					<th className="root-cell" />
				</tr>
				</tbody>
			</table>
		);
	}
}

class App extends Component {

	constructor(props) {
		super(props);
		this.adjacencyMatrix = React.createRef();
	}


	render() {
		return (
			<div className="main-wrapper">
				<header className="upper-header card-panel" adjacencyMatrix={this.adjacencyMatrix}>
					Interactive graph visualizer
				</header>
				<Graph className="content card-panel"/>
				<div className="side-bar card-panel">
					<IncidenceMatrix ref={this.adjacencyMatrix}/>
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

// $(document).ready(() => {
//     $('.modal').modal();
// });
