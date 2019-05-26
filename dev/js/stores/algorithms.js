import { TaskTypeEnum } from '../const/enums';
import {messager, msgTypes} from "../rendererMessager";
import {dijkstra} from "./tools/algorithmMethods";

export class InitAlgorithms {
	static create() {
		const tasks = new Map();
		const alg = new AlgorithmsStore();

		tasks.set(TaskTypeEnum.BreadthFirstSearch, AlgorithmsStore.BreadthFirstSearch);
		tasks.set(TaskTypeEnum.BestFirstSearch, alg.BestFirstSearch);
		tasks.set(TaskTypeEnum.Dijkstra, alg.Dijkstra);
		tasks.set(TaskTypeEnum.AStar, alg.AStar);
		tasks.set(TaskTypeEnum.GraphConnectivity, alg.GraphConnectivity);

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

		result_collection.addClass('highlight');

		console.log('short path: ', result.length - 1);
		// messager.send(msgTypes.showMessageBox, 'Short path', `Short path is ${path_lenght}`);

		return result.length - 1;
	}

	WeightRadiusDiameterPower(cy) {

	}

	BestFirstSearch(cy) {

	}

	AStar(cy) {

	}

	Dijkstra(cy) {
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
				const textVector = pathLengths.reduce((text, value) => text.concat(`To ${value[0].data('nodeIdx')}: ${value[1]}\n`), '');

				if (currentRoot === root)
					messager.send(msgTypes.showMessageBox, 'Dijkstra vector',
						`Path from root to all other nodes:\n${textVector}`);
				return [currentRoot, new Map(pathLengths)];
			})
		);
	}

	GraphConnectivity(cy) {
		console.log('graph connectivity');
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

}
