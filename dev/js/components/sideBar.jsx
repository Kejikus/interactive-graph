import React, { Component } from 'react';
import AdjacencyMatrix from "./matrix";
import AlgorithmWrapper from "./Tasks/AlgorithmWrapper";
import {messager, msgTypes} from "../rendererMessager";

export default
class SideBar extends Component {

	constructor(props) {
		super(props);

		this.state = {
			showInput: false,
			callback: null
		};
		messager.on(msgTypes.sidebarShowInput, (placeholder, callback) => {
			this.setState({showInput: true, placeholder: placeholder, callback: callback});
		});
	}

	onInputKeyUp(event) {
		if (event.which === 13) { // Enter
			this.state.callback(event.currentTarget.value);
			this.setState({showInput: false, placeholder: '', callback: null});
		}
	}

	render() {
		const input = this.state.showInput ? (
			<div className="input-field">
				<input type="text"
				       placeholder={this.state.placeholder}
				       onKeyUp={(e) => this.onInputKeyUp(e)}/>
			</div>
		) : '';

		return (
			<div className="side-bar card-panel">
				<AdjacencyMatrix/>
				{/*<AlgorithmWrapper visible={currentTask !== -1}>*/}
				{/*	{currentTask !== -1 ? <Algorithm /> : <p>Content doesn't exist</p>}*/}
				{/*</AlgorithmWrapper>*/}
				{ input }
				<ul className="hints">
					<li>Ctrl+Z / Ctrl+Shift+Z - Undo/redo</li>
					<li>Ctrl+D - Add node</li>
					<li>Ctrl+E - Add edge</li>
				</ul>
			</div>
		);
	}
}
