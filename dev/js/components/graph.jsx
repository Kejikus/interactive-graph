import {ipcRenderer} from 'electron';
import React, { Component } from 'react';

import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import undoRedo from 'cytoscape-undo-redo';

import $ from 'jquery';

import Toolbar from "./toolbar";
import { InitAlgorithms } from '../stores/algorithms';

import {messager, msgTypes} from "../rendererMessager";

import graphCss from "../../styles/cytoscape.txt.css";
// import BestFirstSearch from "./Tasks/components/BestFirstSearch";
// import AlgorithmWrapper from "./Tasks/AlgorithmWrapper";

cytoscape.use(edgehandles);
undoRedo(cytoscape);

export default class Graph extends Component {

	constructor(props) {
		super(props);
		this.state = {
			mode: null,
			graphOnClick: null,
			lastId: -1,
			lastNodeIdx: -1,
			addEdgeButton: false,
			currentTask: -1,
		};
		this.graphContainer = React.createRef();
		this.toolbar = React.createRef();
		// this.algorithm = React.createRef();

		$(document).on("keydown", (e) => {
			if (e.ctrlKey) {
				if (e.which === 'D'.charCodeAt(0)) {
					this.onAddNodeClick();
					e.preventDefault();
				} else if (e.which === 'E'.charCodeAt(0)) {
					this.onAddEdgeClick();
					e.preventDefault();
				} else if (e.shiftKey && e.which === 'Z'.charCodeAt(0)) {
					this.ur.redo();
					e.preventDefault();
				} else if (e.which === 'Z'.charCodeAt(0)) {
					this.ur.undo();
					e.preventDefault();
				} else if (e.which === ' '.charCodeAt(0)) {
					this.cy.$('*').removeStyle();
					e.preventDefault();
				}
			} else {
				if (e.which === 46) { // Delete
					this.ur.do('remove', this.cy.$(':selected'));
					e.preventDefault();
				}
			}
		});

		this.tasks = InitAlgorithms.create();

		messager.on(msgTypes.graphSetAdjacency, (srcNodeId, tgtNodeId, valueTo, valueFrom) => {
			return this.editAdjacency(srcNodeId, tgtNodeId, valueTo, valueFrom);
		});
		messager.on(msgTypes.graphGetNextId, (callback) => callback(++this.state.lastId));
		messager.on(msgTypes.graphGetNextNodeIdx, (callback) => callback(++this.state.lastNodeIdx));
		messager.on(msgTypes.graphURDo, (name, param) => this.ur.do(name, param));
	}

	componentDidMount() {
		// Init of cytoscape.js
		this.cy = cytoscape({
			container: this.graphContainer.current,
			style: graphCss
		});

		// Concat two list of styles
		let concatStyle = this.cy.style().json().concat([
			{
				selector: '[label][weight]',
				style: {
					'label': (ele) => {
						if (ele.data().label && ele.data().weight) {
							return `[${ele.data().weight}] ${ele.data().label}`;
						} else if (ele.data().label) {
							return ele.data().label;
						} else if (ele.data().weight) {
							return ele.data().weight;
						} else {
							return '';
						}
					}
				}
			}
		]);
		this.cy.style().fromJson(concatStyle);

		// Style switches for selecting nodes
		// this.cy.on('select', 'node', event => {
		// 	let node = event.target;
		// 	node.cy().$(`edge[source="${node.id()}"], edge[target="${node.id()}"][!oriented]`).addClass('node-selected');
		// });
		// this.cy.on('unselect', 'node', event => {
		// 	let node = event.target;
		// 	node.cy().$(`edge[source="${node.id()}"], edge[target="${node.id()}"][!oriented]`).removeClass('node-selected');
		// });

		this.cy.on('select unselect', '*', event => {
			if (this.cy.$('edge:selected').length === 1 && this.cy.$(':selected').length === 1 && !this.state.addEdgeButton) {
				this.toolbar.current.addButton('Edit edge', () => this.onEditEdgeClicked(), 'btn waves-effect waves-light');
				this.state.addEdgeButton = true;
			} else if ((this.cy.$('edge:selected').length !== 1 || this.cy.$(':selected').length !== 1) && this.state.addEdgeButton) {
				this.toolbar.current.removeButton(-1);
				if (this.state.mode === 'edit-edge') this.resetMode();
				this.state.addEdgeButton = false;
			}
		});

		// Adjacency matrix recalculation trigger
		// And style override remove trigger
		this.cy.on('add data move remove', () => {
			messager.send(
				msgTypes.matrixSetData,
				this.cy.nodes().difference('[^nodeIdx]').jsons(),
				this.cy.edges().jsons()
			);
		});

		this.cy.on('add move remove select', () => {
			this.cy.$('edge, node[nodeIdx]').removeStyle();
		});

		// const recalculateNodeWeight = node => {
		//     let weightObj = node.connectedEdges().difference('.eh-ghost-edge').difference(`[?oriented][source != "${node.id}"]`).min(edge => {
		//             const srcX = edge.source().position().x;
		//             const srcY = edge.source().position().y;
		//             const tgtX = edge.target().position().x;
		//             const tgtY = edge.target().position().y;
		//             return Math.floor(Math.sqrt(
		//                 Math.pow(Math.abs(srcX - tgtX), 2) +
		//                 Math.pow(Math.abs(srcY - tgtY), 2)
		//             ))
		//     });
		//     if (weightObj.ele) {
		//         node.data('weight', weightObj.value);
		//     } else {
		//         node.data('weight', 0);
		//     }
		// };
		//
		// this.cy.on('add position remove', 'node', event => {
		//     const node = event.target;
		//     recalculateNodeWeight(node);
		//     // console.log(node.neighbourhood());
		//     node.neighbourhood().filter('node').map(node => recalculateNodeWeight(node));
		// });
		// this.cy.on('add remove', 'edge', event => {
		//     const edge = event.target;
		//     recalculateNodeWeight(edge.source());
		//     recalculateNodeWeight(edge.target());
		// });

		this.ur = this.cy.undoRedo({
			undoableDrag: true,
			stackSizeLimit: 10
		});

		function changeData(obj) {
			const oldValue = obj.elem.data()[obj.key];
			obj.elem.data(obj.key, obj.value);
			return {elem: obj.elem, key: obj.key, value: oldValue}
		}

		function unchangeData(obj) {
			const oldValue = obj.elem.data()[obj.key];
			obj.elem.data(obj.key, obj.value);
			return {elem: obj.elem, key: obj.key, value: oldValue}
		}

		this.ur.action("changeData", changeData, unchangeData);

		ipcRenderer.on("clear-graph", () => this.clear());
		ipcRenderer.on("set-graph", (sender, obj) => {
			// console.log(obj);
			if (obj.errors.length > 0) {
				this.toolbar.current.showMessage('File corrupted, check console');
				console.log(obj.errors);
				return;
			}
			this.clear();
			this.ur.reset();
			this.cy.json({
				elements: {
					nodes: Object.values(obj.nodes),
					edges: Object.values(obj.edges)
				}
			});
			this.state.lastId = obj.lastId;

			let layout = this.cy.filter('node[?layout]').layout({
				name: 'circle'
			});
			layout.run();
		});
		ipcRenderer.on("request-save-collection", () => {
			ipcRenderer.send("send-save-collection", {
				nodes: this.cy.nodes().jsons(),
				edges: this.cy.edges().jsons()
			});
		});
		ipcRenderer.on("request-save-image", () => {
			ipcRenderer.send("send-save-image", this.cy.png({
				output: 'base64',
				full: true
			}));
		});
		ipcRenderer.on("save-error", (sender, err) => {
			this.toolbar.current.showMessage("Error saving file: " + err);
		});
		ipcRenderer.on("save-success", () => {
			this.toolbar.current.showMessage("File saved");
		});

		ipcRenderer.on("execute-algorithm", (sender, index) => {
			this.executeAlgorithm(index);
		});

		console.log(this);
	}

	// Edit number of outgoing edges
	// valueTo - desired total weight of outgoing edge from src to tgt
	// valueFrom - desired total weight of outgoing edge from tgt to src
	editAdjacency(srcNodeId, tgtNodeId, valueTo, valueFrom) {
		valueTo = Number(valueTo);
		valueFrom = Number(valueFrom);
		// Removing all existing edges
		let edges = this.cy
			.$(`edge[source="${srcNodeId}"][target="${tgtNodeId}"]`)
			.merge(`edge[source="${tgtNodeId}"][target="${srcNodeId}"]`).remove();
		console.log(edges);

		if (valueTo === valueFrom && valueTo > 0) {
			this.cy.add({
				group: 'edges',
				data: {
					id: ++this.state.lastId,
					source: srcNodeId,
					target: tgtNodeId,
					weight: valueTo,
					oriented: false
				}
			});
		} else {
			if (valueTo > 0) {
				this.cy.add({
					group: 'edges',
					data: {
						id: ++this.state.lastId,
						source: srcNodeId,
						target: tgtNodeId,
						weight: valueTo,
						oriented: true
					}
				});
			}
			if (valueFrom > 0) {
				this.cy.add({
					group: 'edges',
					data: {
						id: ++this.state.lastId,
						source: tgtNodeId,
						target: srcNodeId,
						weight: valueFrom,
						oriented: true
					}
				});
			}
		}
	}

	// Algorithms components
	// Algorithms = [
	// 	BestFirstSearch,
	// ];

	// Execute graph algorithm by index
	executeAlgorithm(index) {
		// Данные из графа брать:
		// this.cy.nodes() - объекты нодов
		// this.cy.edges() - объекты ребер
		this.setState({currentTask: index});
		this.tasks.get(index)(this.cy);
	}

	resetMode() {
		let mode = this.state.mode;

		switch (mode) {
			case 'add-node': {
				this.toolbar.current.showMessage('');
				this.cy.removeListener('tap', this.state.graphOnClick);
				this.toolbar.current.removeAllFields();
				this.cy.resize();
				this.state.mode = null;
				this.state.graphOnClick = null;
				break;
			}
			case 'add-edge': {
				if (this.eh !== null) {
					this.eh.disableDrawMode();
					this.eh.disable();
				}
				this.toolbar.current.showMessage('');
				this.toolbar.current.removeAllFields();
				this.cy.resize();
				this.state.mode = null;
				break;
			}
			case 'edit-edge': {
				this.toolbar.current.showMessage('');
				this.toolbar.current.removeAllFields();
				this.cy.resize();
				this.state.mode = null;
				break;
			}
		}
	}

	onAddNodeClick() {
		let state = this.state;
		let cy = this.cy;
		let ur = this.ur;
		let resetMode = () => this.resetMode();

		if (state.mode !== 'add-node') {
			resetMode();
			state.mode = 'add-node';

			// let labelInput = this.toolbar.current
			// 	.addField('text', 'node-label', '', 'Node label', true);

			this.state.graphOnClick = function (event) {
				if (state.mode === 'add-node' && event.target === cy) {
					// let label = labelInput.current.value;
					let id = ++state.lastId;

					ur.do('add', {
						group: 'nodes',
						data: {
							id: id,
							// label: label,
							weight: undefined,
							nodeIdx: ++state.lastNodeIdx},
						position: event.position
					});
					// resetMode();
				}
			};
			this.toolbar.current.showMessage('Click on the free space to add node there');
			this.cy.on('tap', this.state.graphOnClick);
		} else {
			resetMode();
		}
	}

	onAddEdgeClick() {
		let state = this.state;
		let cy = this.cy;
		let resetMode = () => this.resetMode();

		if (state.mode !== 'add-edge') {

			let onEdgeAdded = (source, target, eles) => {
				this.ur.do("add", eles);
				// resetMode();
			};
			let edgeObj = () => {
				return {
					data: {
						id: ++state.lastId,
						weight: parseInt(weightInput.current.value) || 1,
						oriented: checkboxIsArrow.current.checked,
					}
				}
			};
			let ghostEdgeObj = () => {
				return {
					data: {
						weight: parseInt(weightInput.current.value) || 1,
						oriented: checkboxIsArrow.current.checked
					}
				}
			};

			resetMode();
			state.mode = 'add-edge';

			let weightInput = this.toolbar.current
				.addField({
					type: 'number',
					name: 'edge-weight',
					placeholder: 'Edge weight',
					focus: true,
					min: 0
				});
			let checkboxIsArrow = this.toolbar.current.addField({
				type: 'checkbox',
				name: 'edge-is-arrow',
				label: 'Oriented'
			});

			// cytoscape-edgehandles options
			// https://github.com/cytoscape/cytoscape.js-edgehandles#initialisation
			let ehOptions = {
				complete: onEdgeAdded,
				loopAllowed: () => true,
				edgeParams: edgeObj,
				ghostEdgeParams: ghostEdgeObj
			};

			if (!this.eh) {
				this.eh = cy.edgehandles(ehOptions);
			} else {
				Object.assign(this.eh.options, ehOptions); // Update existing options
			}
			this.eh.enable();
			this.eh.enableDrawMode();
		} else {
			resetMode();
		}
	}

	onEditEdgeClicked() {
		let state = this.state;
		let cy = this.cy;
		let resetMode = () => this.resetMode();

		if (state.mode !== 'edit-edge') {

			let edge = cy.$(':selected')[0];

			const onWeightChanged = (event) => {
				this.ur.do("changeData", {
					elem: edge,
					key: 'weight',
					value: parseInt(weightInput.current.value)
				});
			};

			const flipDirection = (event) => {
				this.ur.do("batch", [
					{
						name: 'changeData',
						param: {elem: edge, key: 'source', value: edge.data('target')}
					},
					{
						name: 'changeData',
						param: {elem: edge, key: 'target', value: edge.data('source')}
					}
				]);
			};

			const toggleArrow = (event) => {
				this.ur.do("changeData", {
					elem: edge,
					key: 'oriented',
					value: checkboxIsArrow.current.checked
				});
			};

			resetMode();
			state.mode = 'edit-edge';

			let weightInput = this.toolbar.current
				.addField({
					type: 'number',
					name: 'edge-weight',
					value: edge.data().weight,
					focus: true,
					onChange: onWeightChanged
				});
			let buttonFlip = this.toolbar.current.addField({
				type: 'button',
				name: 'flipper',
				value: 'Flip direction',
				onClick: flipDirection
			});
			let checkboxIsArrow = this.toolbar.current.addField({
				type: 'checkbox',
				name: 'edge-is-arrow',
				label: 'Oriented',
				checked: edge.data().oriented || false,
				onChange: toggleArrow
			});
		} else {
			resetMode();
		}
	}

	clear() {
		console.log('Got it');
		this.cy.remove('*');
	}

	render() {

		// const { currentTask } = this.state;
		// const Algorithm = currentTask !== -1 && this.Algorithms[currentTask];

		return (
			<div className={ this.props.className }>
				<Toolbar className="graph-toolbar"
				         ref={this.toolbar}
				         buttons={[
					         {value: "Pan/select", onClick: () => this.resetMode()},
					         {value: "Add node", onClick: () => this.onAddNodeClick()},
					         {value: "Add edge", onClick: () => this.onAddEdgeClick()},
				         ]} />
				<div className="graph-container" ref={this.graphContainer} />
			</div>
		);
	}
}
