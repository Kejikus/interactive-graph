import React, { Component } from 'react';
import AdjacencyMatrix from "./matrix";
import AlgorithmWrapper from "./Tasks/AlgorithmWrapper";

export default
class SideBar extends Component {

	constructor(props) {
		super(props);
	}


	render() {
		return (
			<div className="side-bar card-panel">
				<AdjacencyMatrix/>
				{/*<AlgorithmWrapper visible={currentTask !== -1}>*/}
				{/*	{currentTask !== -1 ? <Algorithm /> : <p>Content doesn't exist</p>}*/}
				{/*</AlgorithmWrapper>*/}
				<ul className="hints">
					<li>Ctrl+Z / Ctrl+Shift+Z - Undo/redo</li>
					<li>Ctrl+D - Add node</li>
					<li>Ctrl+E - Add edge</li>
				</ul>
			</div>
		);
	}
}
