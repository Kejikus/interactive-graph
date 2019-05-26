import React, { Component } from "react";
import {messager, msgTypes} from "../rendererMessager";


export default
class AdjacencyMatrix extends Component {

	constructor(props) {
		super(props);
		this.state = {
			collection: {
				nodes: [],
				edges: []
			},
			editableCell: {
				row: -1,
				col: -1,
				value: -1,
				ref: React.createRef()
			}
		};

		messager.on(msgTypes.matrixSetData, (nodes, edges) => {
			this.setCollection(nodes, edges);
			this.forceUpdate();
		});
	}

	setCollection(nodes, edges) {
		this.setState({collection: {nodes: nodes, edges: edges}});
	}

	editCell(row, col) {
		Object.assign(this.state.editableCell, {
			row: row,
			col: col
		});
		this.forceUpdate();
	}

	resetEditCell() {
		Object.assign(this.state.editableCell, {
			row: -1,
			col: -1,
			value: -1
		});
		this.forceUpdate();
	}

	render() {

		const headers = this.state.collection.nodes.map((node, index) => {
			return (
				<th key={node.data.id}>{node.data.nodeIdx}</th>
			);
		});

		const rows = this.state.collection.nodes.map((sourceNode, rowIdx) => {

			const edgeCells = this.state.collection.nodes.map((targetNode, colIdx) => {
				const edgesCount = this.state.collection.edges.reduce((count, edge) => {
					const edgeSrcId = edge.data.source;
					const edgeTgtId = edge.data.target;
					const srcNodeId = sourceNode.data.id;
					const tgtNodeId = targetNode.data.id;
					const edgeOriented = edge.data.oriented || false;

					if ((edgeSrcId ===  srcNodeId && edgeTgtId === tgtNodeId) ||
						(edgeSrcId === tgtNodeId && edgeTgtId === srcNodeId && !edgeOriented))
					{
						return count + edge.data.weight;
					}
					return count;
				}, 0);

				if (this.state.editableCell.row === rowIdx && this.state.editableCell.col === colIdx) {
					const inputHandler = (event) => {
						if (event.which === 13) { // Enter
							const newValue = this.state.editableCell.ref.current.value;
							const otherValue = this.state.editableCell.value;

							// Send graph update message
							messager.send(
								msgTypes.graphSetAdjacency,
								sourceNode.data.id,
								targetNode.data.id,
								newValue,
								otherValue
							);
							this.resetEditCell();
							return false;
						}
						if (event.which === 27) { // Esc
							this.resetEditCell();
							return false;
						}
					};

					return (
						<td className="editing" key={targetNode.data.id}>
							<input ref={this.state.editableCell.ref} type="number" min="0" defaultValue={edgesCount} onKeyUp={inputHandler} autoFocus={true}/>
						</td>
					)
				}
				if (this.state.editableCell.row === colIdx && this.state.editableCell.col === rowIdx) {
					this.state.editableCell.value = edgesCount; // Setting 'flipped x/y' value to send on edit
				}
				return (
					<td key={targetNode.data.id} onClick={() => this.editCell(rowIdx, colIdx)}>{edgesCount}</td>
				)
			});

			return (
				<tr key={sourceNode.data.id}>
					<th>{sourceNode.data.nodeIdx}</th>
					{edgeCells}
				</tr>
			);
		});

		return (
			<div className="adjacency-matrix">
				<table>
					<colgroup>
						<col className="first-col"/>
					</colgroup>
					<thead>
					<tr>
						<th className="root-cell" />
						{headers}
					</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	}
}
