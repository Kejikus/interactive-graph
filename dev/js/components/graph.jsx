import {ipcRenderer} from 'electron';
import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import undoRedo from 'cytoscape-undo-redo';
import $ from 'jquery';
import Toolbar from "./toolbar";
import { InitAlgorithms } from '../stores/algorithms';

import graphCss from "../../styles/cytoscape.txt.css";

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
			addEdgeButton: false
		};
		this.graphContainer = React.createRef();
		this.toolbar = React.createRef();
		this.adjacencyMatrix = props.adjacencyMatrix || null;
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
				}
			} else {
				if (e.which === 46) { // Delete
					this.ur.do('remove', this.cy.$(':selected'));
					e.preventDefault();
				}
			}
		});

		this.tasks = InitAlgorithms.create();
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
		this.cy.on('select', 'node', event => {
			let node = event.target;
			node.cy().$(`edge[source="${node.id()}"], edge[target="${node.id()}"][!oriented]`).addClass('node-selected');
		});
		this.cy.on('unselect', 'node', event => {
			let node = event.target;
			node.cy().$(`edge[source="${node.id()}"], edge[target="${node.id()}"][!oriented]`).removeClass('node-selected');
		});

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
		this.cy.on('add data move remove', () => {
			if (this.adjacencyMatrix !== null) {
				this.adjacencyMatrix.current.setCollection(
					this.cy.nodes().unmerge('[^nodeIdx]').jsons(),
					this.cy.edges().jsons()
				);
			}
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
	// offset - desired number of outgoing edges - current number
	editAdjacency(srcNodeId, tgtNodeId, offset) {
		if (offset < 0) {
			// Removing directed edges
			let directedEdges = this.cy.$(`edge[source=${srcNodeId}][target=${tgtNodeId}][?oriented]`);
			const offset1 = Math.min(directedEdges.length, -offset);

			for (let i = 0; i < offset1; i++) directedEdges[i].remove();

			offset += offset1;
			if (offset === 0) return;

			// If not enough, directing undirected edges
			let undirectedEdges = this.cy.$(`edge[source=${tgtNodeId}][target=${srcNodeId}][!oriented]`);
			const offset2 = Math.min(undirectedEdges.length, -offset);

			for (let i = 0; i < offset2; i++) undirectedEdges[i].data('oriented', true);

			offset += offset2;
			if (offset === 0) return;

			// Directing left edges
			undirectedEdges = this.cy.$(`edge[source=${srcNodeId}][target=${tgtNodeId}][!oriented]`);
			const offset3 = Math.min(undirectedEdges.length, -offset);

			for (let i = 0; i < offset3; i++) {
				undirectedEdges[i].data('source', tgtNodeId);
				undirectedEdges[i].data('target', srcNodeId);
				undirectedEdges[i].data('oriented', true);
			}
		} else if (offset > 0) {
			// Undirecting existing edges
			let directedEdges = this.cy.$(`edge[source="${tgtNodeId}"][target="${srcNodeId}"][?oriented]`);
			const offset1 = Math.min(directedEdges.length, offset);

			for (let i = 0; i < offset1; i++) directedEdges[i].data('oriented', false);

			offset -= offset1;

			// Loops are adding with another logic
			if (srcNodeId === tgtNodeId) {
				const offset2 = Math.floor(offset / 2);
				for (let i = 0; i < offset2; i++) {
					this.cy.add({
						group: 'edges',
						data: {
							id: ++this.state.lastId,
							source: srcNodeId,
							target: tgtNodeId,
							oriented: false,
							weight: 1
						}
					});
				}
				offset -= offset2 * 2;
				if (offset > 0) {
					this.cy.add({
						group: 'edges',
						data: {
							id: ++this.state.lastId,
							source: srcNodeId,
							target: tgtNodeId,
							oriented: true,
							weight: 1
						}
					});
				}
				return;
			}

			// Adding extra directed edges
			for (let i = 0; i < offset; i++) {
				this.cy.add({
					group: 'edges',
					data: {
						id: ++this.state.lastId,
						source: srcNodeId,
						target: tgtNodeId,
						oriented: true,
						weight: 1
					}
				});
			}
		}
	}

	// Execute graph algorithm by index
	executeAlgorithm(index) {
		// Данные из графа брать:
		// this.cy.nodes() - объекты нодов
		// this.cy.edges() - объекты ребер
		this.tasks.get(index)();
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
			// resetMode();
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
						weight: weightInput.current.value || 1,
						oriented: checkboxIsArrow.current.checked,
					}
				}
			};
			let ghostEdgeObj = () => {
				return {
					data: {
						weight: weightInput.current.value || 1,
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
					focus: true
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
				this.ur.do("move", {
					eles: edge,
					location: {
						source: edge.data().target,
						target: edge.data().source
					}
				});
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
		return (
			<div className={ this.props.className }>
				<Toolbar className="graph-toolbar"
				         ref={this.toolbar}
				         buttons={[
					         {value: "Pan/select", onClick: () => this.resetMode()},
					         {value: "Add node", onClick: () => this.onAddNodeClick()},
					         {value: "Add edge", onClick: () => this.onAddEdgeClick()}
				         ]} />
				<div className="graph-container" ref={this.graphContainer}/>
			</div>
		);
	}
}
