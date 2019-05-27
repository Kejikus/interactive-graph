import { TaskTypeEnum } from '../const/enums';
import {messager, msgTypes} from "../rendererMessager";
import {
	dijkstra,
	generateTable,
	generateVectorText,
	nodeDegree,
	nonIncidentNodes,
	getArrayOfKeysFromMap,
	getRandomColor,
	incidentEdges,
	incidentNodes,
} from "./tools/algorithmMethods";
import {amgdEncode} from "../mainComponents/saveFileTools";

export class InitAlgorithms {
	static create() {
		const tasks = new Map();

		tasks.set(TaskTypeEnum.BreadthFirstSearch, AlgorithmsStore.BreadthFirstSearch);
		tasks.set(TaskTypeEnum.BestFirstSearch, AlgorithmsStore.BestFirstSearch);
		tasks.set(TaskTypeEnum.WeightRadiusDiameterPower, AlgorithmsStore.WeightRadiusDiameterPower);
		tasks.set(TaskTypeEnum.Dijkstra, AlgorithmsStore.Dijkstra);
		tasks.set(TaskTypeEnum.AStar, AlgorithmsStore.AStar);
		tasks.set(TaskTypeEnum.GraphConnectivity, AlgorithmsStore.GraphConnectivity);
		tasks.set(TaskTypeEnum.GraphAddition, AlgorithmsStore.GraphAddition);
		tasks.set(TaskTypeEnum.ColoringGraph, AlgorithmsStore.ColoringGraph);
		tasks.set(TaskTypeEnum.GraphPlanarity, AlgorithmsStore.GraphPlanarity);
		tasks.set(TaskTypeEnum.MinimumSpanningTree, AlgorithmsStore.MinimumSpanningTree);
		tasks.set(TaskTypeEnum.RecoverGraphFromVector, AlgorithmsStore.RecoverGraphFromVector);
		tasks.set(TaskTypeEnum.CycleProblem, AlgorithmsStore.CycleProblem);
		tasks.set(TaskTypeEnum.GraphIsomorphism, AlgorithmsStore.GraphIsomorphism);
		tasks.set(TaskTypeEnum.TheProblemOfWeddings, AlgorithmsStore.TheProblemOfWeddings);

		return tasks;
	}
}

class AlgorithmsStore {
	static BreadthFirstSearch(cy) {
		// Validation
		const selected = cy.$(':selected');
		const isNotValid = selected.length !== 2 || (!selected[0].isNode() && !selected[1].isNode());
		const isOrientedEdges = cy.edges().filter('[?oriented]').length !== 0;
		if (isNotValid) {
			messager.send(msgTypes.toolbarSetMessage, 'Select two nodes and start algorithm again');
			return;
		}

		if (isOrientedEdges) {
			messager.send(msgTypes.toolbarSetMessage, 'Invalid graph for dat algorithm');
			return;
		}

		// Initialization
		const startNode = selected[0];
		const endNode = selected[1];
		const frontier = [];
		const visited = [];
		const paths = new Map();

		frontier.push(startNode);
		// перебирает все ноды графа, для того чтобы найти кратчайший путь
		while (frontier.length > 0) {
			const current = frontier.shift();
			const nodes_neighbors = current.neighborhood().filter('node');
			for (let i = 0; i < nodes_neighbors.length; ++i) {
				const node = nodes_neighbors[i];
				if (!visited.includes(node)) {
					frontier.push(node);
					visited.push(node);
					paths.set(node, current);
				}
			}
		}

		// восстанавливает путь из start до end
		let current_node = endNode;
		let result_path = [current_node];
		while (current_node !== startNode) {
			result_path.push(paths.get(current_node));
			current_node = paths.get(current_node);
		}

		const result = result_path.reverse();
		const result_collection = cy.collection(result);

		for (let i = 0; i < result.length - 1; ++i) {
			const short_edge = result[i].edgesWith(result[i + 1]).min((edge) => edge.data('weight')).ele;
			result_collection.merge(short_edge);
		}

		result_collection.style('background-gradient-stop-colors', `white white red red`);
		result_collection.style('line-color', 'red');

		console.log('short path: ', result.length - 1);
		//  messager.send(msgTypes.showMessageBox, 'Short path', `Short path is ${path_lenght}`);

		return result.length - 1;
	}

	static WeightRadiusDiameterPower(cy) {
		let radius = -1;
		let diameter = 0;
		const degreeVector = [];
		const nodeWeightVector = [];

		const pathLength = 1;

		const nodes = cy.nodes();

		for (let i = 0; i < nodes.length; ++i) {
			const dijkstraResult = dijkstra(cy, nodes[i]);
			let biggestValue = 0;
			for (let j = 0; j < dijkstraResult.length; ++j) {
				if (biggestValue < dijkstraResult[j][pathLength]) {
					biggestValue = dijkstraResult[j][pathLength];
				}
			}
			nodeWeightVector.push([nodes[i], biggestValue]);

			if (diameter < biggestValue) {
				diameter = biggestValue;
			}

			if (radius > biggestValue || radius === -1) {
				radius = biggestValue;
			}

			degreeVector.push([nodes[i], nodeDegree(nodes[i])]);
		}

		const weightVecText = generateVectorText(nodeWeightVector, 'Node');
		const degreeVecText = generateVectorText(degreeVector, 'Node');

		messager.send(msgTypes.showMessageBox, 'Radius, Diameter, Weight, Degree',
			`Radius: ${radius}\nDiameter: ${diameter}\n\nWeight vector:\n${weightVecText}\nDegree vector:\n${degreeVecText}`
		);

		return {
			nodeWeightVector: nodeWeightVector,
			degreeVector: degreeVector,
			radius: radius,
			diameter: diameter
		};
	}

	static BestFirstSearch(cy) {
		// Validation
		const selected = cy.$(':selected');
		const isNotValid = selected.length !== 2 || (!selected[0].isNode() && !selected[1].isNode());
		if (isNotValid) {
			messager.send(msgTypes.toolbarSetMessage, 'Select two nodes and start algorithm again');
			return;
		}

		const startNode = selected[0];
		const endNode = selected[1];

		const frontier = [];
		const visited = [startNode];
		let paths = new Map();
		const cameFrom = new Map();
		paths.set(0, [startNode]);
		frontier.push(startNode);
		while (frontier.length > 0) {
			if (current === endNode) break;
			let current = frontier.shift();
			// const incNodes = incidentNodes(current);
			const incEdges = incidentEdges(current);
			for (let i = 0; i < incEdges.length; ++i) {
				let node = null;
				let values = paths.get(incEdges[i].data().weight);
				if (values === undefined) {
					values = [];
				}
				if (incEdges[i].source() === current) {
					node = incEdges[i].target();
					if (visited.includes(node)) continue;
					values.unshift(node);
					paths.set(incEdges[i].data().weight, values);
				} else if (incEdges[i].target() === current) {
					node = incEdges[i].source();
					if (visited.includes(node)) continue;
					values.unshift(node);
					paths.set(incEdges[i].data().weight, values);
				}

				if (!visited.includes(node)) {
					visited.push(current);
					cameFrom.set(node, current);
					paths.values().next().value.splice(0, 1);
					if (paths.values().next().value.length === 0) {
						paths.delete(paths.keys().next().value);
					}
					frontier.push(paths.values().next().value[0]);
					if (node === endNode) {
						current = node;
						break;
					}
				}
				paths = new Map([...paths.entries()].sort((a, b) => a[0] - b[0]));
				// debugger;
			}
		}

		let current_node = endNode;
		let result_path = [current_node];
		while (current_node !== startNode) {
			result_path.push(cameFrom.get(current_node));
			current_node = cameFrom.get(current_node);
		}

		const result = result_path.reverse();
		const result_collection = cy.collection(result);

		for (let i = 0; i < result.length - 1; ++i) {
			const short_edge = result[i].edgesWith(result[i + 1]).min((edge) => edge.data('weight')).ele;
			result_collection.merge(short_edge);
		}

		result_collection.style('background-gradient-stop-colors', `white white red red`);
		result_collection.style('line-color', 'red');
	}

	static AStar(cy) {
		// Validation
		const selected = cy.$(':selected');
		const isNotValid = selected.length !== 2 || (!selected[0].isNode() && !selected[1].isNode());
		if (isNotValid) {
			messager.send(msgTypes.toolbarSetMessage, 'Select two nodes and start algorithm again');
			return;
		}

		const startNode = selected[0];
		const endNode = selected[1];

		const frontier = [];
		const visited = [startNode];
		let paths = new Map();
		const cameFrom = new Map();
		paths.set(0, [startNode]);
		frontier.push(startNode);
		while (frontier.length > 0) {
			if (current === endNode) break;
			let current = frontier.shift();
			// const incNodes = incidentNodes(current);
			const incEdges = incidentEdges(current);
			for (let i = 0; i < incEdges.length; ++i) {
				let node = null;
				let weight = paths.keys().next().value;
				let values = paths.get(incEdges[i].data().weight);
				if (values === undefined) {
					values = [];
				}
				if (incEdges[i].source() === current) {
					node = incEdges[i].target();
					if (visited.includes(node)) continue;
					values.unshift(node);
					paths.set(incEdges[i].data().weight + weight, values);
				} else if (incEdges[i].target() === current) {
					node = incEdges[i].source();
					if (visited.includes(node)) continue;
					values.unshift(node);
					paths.set(incEdges[i].data().weight + weight, values);
				}

				if (!visited.includes(node)) {
					visited.push(current);
					cameFrom.set(node, current);
					paths.values().next().value.splice(0, 1);
					if (paths.values().next().value.length === 0) {
						paths.delete(paths.keys().next().value);
					}
					frontier.push(paths.values().next().value[0]);
					if (node === endNode) {
						current = node;
						break;
					}
				}
				paths = new Map([...paths.entries()].sort((a, b) => a[0] - b[0]));
			}
			// debugger;
		}

		let current_node = endNode;
		let result_path = [current_node];
		while (current_node !== startNode) {
			result_path.push(cameFrom.get(current_node));
			current_node = cameFrom.get(current_node);
		}

		const result = result_path.reverse();
		const result_collection = cy.collection(result);

		for (let i = 0; i < result.length - 1; ++i) {
			const short_edge = result[i].edgesWith(result[i + 1]).min((edge) => edge.data('weight')).ele;
			result_collection.merge(short_edge);
		}

		result_collection.style('background-gradient-stop-colors', `white white red red`);
		result_collection.style('line-color', 'red');
	}

	static Dijkstra(cy) {
		const selected = cy.$(':selected');
		let rootSelected = selected.length === 1 && selected[0].isNode();
		if (!rootSelected) {
			// messager.send(msgTypes.toolbarSetMessage, 'Select one node and start algorithm again');
			// return;
			selected.unselect();
		}

		const root = rootSelected ? selected[0] : null;
		const matrix = new Map(
			cy.nodes().map(currentRoot => {
				let pathLengths = dijkstra(cy, currentRoot);

				if (currentRoot === root) {
					const textVector = generateVectorText(pathLengths, 'To node');

					messager.send(msgTypes.showMessageBox, 'Dijkstra vector',
						`Path from root to all other nodes:\n${textVector}`);
				}
				return [currentRoot, new Map(pathLengths)];
			})
		);

		const table = generateTable(matrix, 5);

		messager.send(msgTypes.showMessageBox, 'Dijkstra matrix', `Matrix:\n${table}`);
	}

	static GraphAddition(cy) {
		const nodes = cy.nodes();
		const edges = cy.edges();
		const actionList = [];
		const usedNodes = cy.collection();
		nodes.forEach(srcNode => {
			const unboundNodes = nonIncidentNodes(srcNode).difference(usedNodes).difference(srcNode);
			unboundNodes.forEach(tgtNode => {
				let edgeId = -1;
				messager.send(msgTypes.graphGetNextId, id => edgeId = id);
				actionList.push({
					name: 'add',
					param: {
						group: 'edges',
						data: {
							id: edgeId,
							source: srcNode.data('id'),
							target: tgtNode.data('id'),
							weight: 1,
							oriented: false
						}
					}
				});
			});
			usedNodes.merge( srcNode );
		});

		if (actionList.length === 0) {
			messager.send(msgTypes.showMessageBox, 'Graph addition', 'Graph is already full!');
			return;
		}

		// Undirect all directed edges
		edges.filter('[?oriented]').forEach(edge => actionList.push({name: 'changeData', param: {elem: edge, key: 'oriented', value: false}}));

		messager.send(msgTypes.graphURDo, 'batch', actionList);
	}

	static GraphPlanarity(cy) {

	}

	static GraphConnectivity(cy) {
		const firstNode = cy.nodes()[0];

		const frontier = [firstNode];
		const visited = [firstNode];

		let isConnected = false;

		while (frontier.length > 0) {
			const current = frontier.shift();
			const nodes_neighbors = current.neighborhood().filter('node');
			for (let i = 0; i < nodes_neighbors.length; ++i) {
				const node = nodes_neighbors[i];
				if (!visited.includes(node)) {
					frontier.push(node);
					visited.push(node);
				}
			}

			if (visited.length === cy.nodes().length) {
				isConnected = true;
				break;
			}
		}

		if (!isConnected) {
			console.log('not connected');
			return;
		}

		const isOrientedEdges = cy.edges().filter('[?oriented]').length !== 0;
		if (isOrientedEdges) {
			let isWeakConnectivity = false;
			cy.nodes().forEach(node => {
				const edges = node.neighborhood().filter('edge');
				const orientedEdges = node.neighborhood().filter(`edge[source="${node.data('id')}"][?oriented]`);
				const result = edges.length === orientedEdges.length;
				if (result) isWeakConnectivity = true;
			});

			const m = isWeakConnectivity ? 'weak connected' : 'strong connected';
			console.log(m);
		} else {
			console.log('connected');
		}
	}

	static ColoringGraph(cy, colorGraph) {
		const nodes = cy.nodes();
		colorGraph = colorGraph === undefined ? true : colorGraph;

		const edgesCounter = new Map();

		for (let i = 0; i < nodes.length; ++i) {
			edgesCounter.set(nodes[i], nodes[i].neighborhood('edge').length);
		}
		const sortMap = new Map([...edgesCounter.entries()].sort((a, b) => b[1] - a[1]));

		let index = 1;
		const colored = cy.collection();
		const keys = [];
		sortMap.forEach((value, key) => {
			keys.push(key);
		});

		const groups = [];

		for (let i = 0; i < keys.length; ++i) {
			const elem = keys[i];
			let needToColor = cy.collection();
			if (colored.and(elem).length === 0) { // elem is not colored
				needToColor.merge(elem);
				for (let j = i + 1; j < sortMap.size; ++j) {
					if (keys[j].neighborhood('node').and(elem).length === 0) { // elem not bound
						needToColor.merge(keys[j]);
					}
				}
			}
			colored.merge(needToColor);

			const colors = [
				'#673AB7',
				'#f44336',
				'#9C27B0',
				'#3F51B5',
				'#2196F3',
				'#009688',
				'#4CAF50',
				'#CDDC39',
				'#FFEB3B',
				'#FF9800',
			];

			if (index < colors.length && colorGraph) {
				const color = colors[index++];
				needToColor.style('background-gradient-stop-colors', `white white ${color} ${color}`);
			}
			else {
				index++;
				if (colorGraph) {
					const color = getRandomColor();
					needToColor.style('background-gradient-stop-colors', `white white ${color} ${color}`);
				}
			}
			if (needToColor.length > 0)
				groups.push(needToColor);
		}

		return {
			chromaColor: index - 1,
			groups: groups
		};
	}

	static MinimumSpanningTree(cy, colorGraph) {
		colorGraph = colorGraph === undefined ? true : colorGraph;

		const edges = cy.edges();
		const nodes = cy.nodes();
		const edgesCounter = new Map();
		for (let i = 0; i < edges.length; ++i) {
			edgesCounter.set(edges[i], edges[i].data().weight);
		}
		const sortMap = new Map([...edgesCounter.entries()].sort((a, b) => b[1] - a[1]));
		const k = getArrayOfKeysFromMap(sortMap);
		const keys = k.reverse();
		let underTree = [];
		for (let i = 0; i < nodes.length; ++i) {
			underTree.push([nodes[i]]);
		}

		const resultEdges = cy.collection();
		for (let i = 0; i < keys.length; ++i) {
			let firstIndex = 0;
			let secondIndex = 0;
			for (let j = 0; j < underTree.length; ++j) {
				const first = keys[i].source();
				const second = keys[i].target();
				if (underTree[j].includes(first)) {
					firstIndex = j;
				}
				if (underTree[j].includes(second)) {
					secondIndex = j;
				}
			}

			if (firstIndex !== secondIndex) {
				resultEdges.merge(keys[i]);
				for (let i = 0; i < underTree[secondIndex].length; ++i) {
					underTree[firstIndex].push(underTree[secondIndex][i]);
				}
				underTree.splice(secondIndex, 1);
			}
		}

		if (colorGraph) {
			const src = resultEdges.sources();
			const tgt = resultEdges.targets();
			const resultColl = resultEdges.union(src).union(tgt);
			resultColl.style('background-gradient-stop-colors', `white white red red`);
			resultColl.style('line-color', 'red');
		}

		return resultEdges;
	}

	static CycleProblem(cy) {
		const graphTreeEdges = AlgorithmsStore.MinimumSpanningTree(cy, false);
		const leftEdges = cy.edges().difference(graphTreeEdges).sort((a, b) => a.data('weight') - b.data('weight'));
		const tree = graphTreeEdges.union(graphTreeEdges.sources()).union(graphTreeEdges.targets());

		if (leftEdges.length === 0) {
			let centerNodes = [];
			tree.filter('node').forEach(node => {
				let centralityDegree = 0;
				node.scratch('degreeC', 0);
				const queue = [node];
				const visited = cy.collection();
				while (queue.length > 0) {
					let currentNode = queue.shift();
					const neighborEdges = currentNode.neighborhood('edge').and(tree);
					const neighborNodes = neighborEdges.sources().union(neighborEdges.targets()).difference(currentNode).difference(visited);
					neighborNodes.forEach(tgtNode => {
						tgtNode.scratch('degreeC', currentNode.scratch('degreeC') + 1);
						centralityDegree = Math.max(centralityDegree, currentNode.scratch('degreeC') + 1);
						queue.push(tgtNode);
					});
					visited.merge(currentNode);
				}
				if (centerNodes.length === 0 || centerNodes[0][1] > centralityDegree) {
					centerNodes = [[node, centralityDegree]];
				}
				if (centerNodes[0][1] === centralityDegree) centerNodes.push([node, centralityDegree]);
			});

			centerNodes.forEach(item => item[0].style('background-gradient-stop-colors', `white white red red`));
			messager.send(msgTypes.showMessageBox, 'Tree height', `Tree height: ${centerNodes[0][1]}`);
		} else {
			const cycleEdge = leftEdges[0];
			const cycleNodes = cy.collection();
			const cycleEdges = cy.collection();
			let currentNodeSrc = cycleEdge.source();
			let currentNodeTgt = cycleEdge.target();
			while (true) { // going up from source
				if (currentNodeSrc === currentNodeTgt) {
					cycleNodes.merge(currentNodeSrc);
					break;
				}

				const neighborEdgesSrc = currentNodeSrc.neighborhood('edge').and(tree);
				const neighborNodesSrc = neighborEdgesSrc.sources().union(neighborEdgesSrc.targets()).difference(currentNodeSrc).difference(cycleNodes);

				if (neighborNodesSrc === 0) break;

				if (neighborNodesSrc.length > 1) {
					while (true) { // going up from target to next level
						if (currentNodeSrc === currentNodeTgt) {
							cycleNodes.merge(currentNodeSrc);
							break;
						}

						const neighborEdgesTgt = currentNodeSrc.neighborhood('edge').and(tree);
						const neighborNodesTgt = neighborEdgesTgt.sources().union(neighborEdgesTgt.targets()).difference(currentNodeTgt).difference(cycleNodes);

						if (neighborNodesTgt.length === 0) break;

						if (neighborNodesTgt.length > 1 || neighborNodesTgt.length === 0) { // next level
							break;
						}

						const edge = currentNodeTgt.edgesWith(neighborNodesTgt[0]).and(neighborEdgesTgt);
						cycleEdges.merge(edge);
						cycleNodes.merge(currentNodeTgt);
						currentNodeTgt = neighborNodesTgt[0];
					}
				}

				const edge = currentNodeSrc.edgesWith(neighborNodesSrc[0]).and(neighborEdgesSrc);
				cycleEdges.merge(edge);
				cycleNodes.merge(currentNodeSrc);
				currentNodeSrc = neighborNodesSrc[0];
			}

			cycleEdges.merge(cycleEdge);
			cycleNodes.style('background-gradient-stop-colors', 'white white red red');
			cycleEdges.style('line-color', 'red');
		}
	}

	static TheProblemOfWeddings(cy) {
		let coloring = AlgorithmsStore.ColoringGraph(cy);
		if (coloring.groups.length !== 2) {
			messager.send(msgTypes.showMessageBox, 'Error', 'Graph must be bipartite');
			return;
		}

		let selected = cy.$(':selected');
		const valid = selected.length === 1 && selected[0].isNode();
		if (!valid) {
			messager.send(msgTypes.showMessageBox, 'Error', 'Select one node in one part');
			return;
		}

		const validGraph = (coloring.groups[0].and(selected).length > 0 && coloring.groups[0].length <= coloring.groups[1].length) ||
			(coloring.groups[1].and(selected).length > 0 && coloring.groups[1].length <= coloring.groups[0].length);

		if (validGraph) messager.send(msgTypes.showMessageBox, 'Success', 'Graph requirements are met');
		else messager.send(msgTypes.showMessageBox, 'Failure', 'Graph requirements are NOT met');
	}

	static GraphIsomorphism(cy) {
		const selected = cy.$(':selected');
		const selectedNodes = cy.$('node:selected');
		let validSelect = selected.length === 2 && selected.length === selectedNodes.length;

		if (!validSelect) {
			messager.send(msgTypes.showMessageBox, 'Input error', 'Select two nodes from two unconnected graphs and start again');
			return;
		}

		debugger;
		const dijkstraOut = new Map(dijkstra(cy, selected[0]));
		if (dijkstraOut.get(selected[1]) !== Infinity) {
			messager.send(msgTypes.showMessageBox, 'Input error', 'Select two nodes from two UNCONNECTED graphs and start again');
			return;
		}

		let graph1 = cy.collection().merge(selected[0]);
		let graph2 = cy.collection().merge(selected[1]);
		debugger;
		while (true) {
			const neighbours = graph1.neighborhood();
			if (neighbours && neighbours.length === 0) break;
			graph1.merge(neighbours);
		}
		while (true) {
			const neighbours = graph2.neighborhood();
			if (neighbours.length === 0) break;
			graph2.merge(neighbours);
		}



		function permute(arr) {
			let l = arr.length,
				used = Array(l),
				data = Array(l);
			return function* backtracking(pos) {
				if(pos === l) yield data.slice();
				else for(var i=0; i<l; ++i) if(!used[i]) {
					used[i] = true;
					data[pos] = arr[i];
					yield* backtracking(pos+1);
					used[i] = false;
				}
			}(0);
		}

		function rotateMatrix(matrix) {
			let ret = [];
			for (let i = 0; i < matrix.length; i++) ret.push([]);
			for (let i = 0; i < matrix.length; i++) {
				for (let j = 0; j < matrix.length; j++) {
					ret[j].push(matrix[i][j]);
				}
			}
			return ret;
		}


		debugger;
		const adjMatrix1 = amgdEncode({nodes: graph1.filter('node'), edges: graph1.filter('edge')}).content;
		let adjMatrix2 = permute(amgdEncode({nodes: graph2.filter('node'), edges: graph2.filter('edge')}).content);
		let isomorphic = undefined;

		if (adjMatrix1.length !== adjMatrix2.length) isomorphic = false;
		if (graph1.filter('edge').length !== graph2.filter('edge').length) isomorphic = false;

		if (isomorphic === undefined) {
			for (const perm of adjMatrix2) {
				let rotMatrixPerm = permute(rotateMatrix(adjMatrix2));
				for (const perm2 of rotMatrixPerm) {
					let resMatrix = rotateMatrix(perm2);
					if (JSON.stringify(resMatrix) === JSON.stringify(adjMatrix1)) {
						isomorphic = true;
						break;
					}
				}
				if (isomorphic) break;
			}
		}

		messager.send(msgTypes.showMessageBox, 'Isomorphism', `Graph are ${isomorphic ? '' : 'not '}isomorphic`);
	}

	static RecoverGraphFromVector(cy) {
		messager.send(msgTypes.sidebarShowInput, 'Input space-separated numbers', (input) => {
			if (input.match(/^(\d+\s*)*$/) === null) {
				messager.send(msgTypes.showMessageBox, 'Input error', 'Input must be space-separated string of positive integer numbers');
				return;
			}

			const degrees = input.split(/\s+/).map(item => Number(item)).sort((a, b) => b - a);

			const actionList = [{name: 'remove', param: '*'}];
			const nodeIds = [];
			let history = '';

			for (let i = 0; i < degrees.length; i++) {
				let id = -1, nodeIdx = -1;
				messager.send(msgTypes.graphGetNextId, i => id = i);
				messager.send(msgTypes.graphGetNextNodeIdx, i => nodeIdx = i);

				actionList.push({
					name: 'add',
					param: {
						group: 'nodes',
						data: {
							id: id,
							nodeIdx: nodeIdx
						}
					}
				});
				nodeIds.push(id);
			}

			history += `${degrees}\n`;

			for (let srcIdx = 0; srcIdx < degrees.length; srcIdx++) {
				let currentDegree = degrees[srcIdx];
				if (currentDegree === 0)
					break;
				if (currentDegree > degrees.length) {
					messager.send(msgTypes.showMessageBox, 'Input error', `Invalid degree ${currentDegree}`);
					return;
				}

				for (let i = srcIdx + 1; i < currentDegree; i++) {
					if (degrees[i] === 0) {
						messager.send(msgTypes.showMessageBox, 'Input error', `Invalid degree vector, can't place all edges`);
						return;
					}
					degrees[i]--;
					let id = -1;
					messager.send(msgTypes.graphGetNextId, i => id = i);
					actionList.push({
						name: 'add',
						param: {
							group: 'edges',
							data: {
								id: id,
								source: nodeIds[srcIdx],
								target: nodeIds[i],
								weight: 1
							}
						}
					});
				}
				degrees[srcIdx] = 0;
				history += `${degrees}\n`;
			}

			actionList.push({name: 'layout', param: {name: 'circle'}});

			messager.send(msgTypes.graphURDo, actionList);
			messager.send(msgTypes.showMessageBox, 'Recovery history', history);
		});
	}
}
