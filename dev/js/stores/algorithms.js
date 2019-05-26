import { TaskTypeEnum } from '../const/enums';
import {messager, msgTypes} from "../rendererMessager";

export class InitAlgorithms {
	static create() {
		const tasks = new Map();
		const alg = new AlgorithmsStore();

		tasks.set(TaskTypeEnum.BreadthFirstSearch, AlgorithmsStore.BreadthFirstSearch);
		tasks.set(TaskTypeEnum.BestFirstSearch, alg.BestFirstSearch);
		tasks.set(TaskTypeEnum.Dijkstra, alg.Dijkstra);
		tasks.set(TaskTypeEnum.AStar, alg.AStar);

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
		if (selected.length !== 1 || !selected[0].isNode()) {
			messager.send(msgTypes.toolbarSetMessage, 'Select one node and start algorithm again');
			return;
		}

		const root = selected[0];
		const weight = (edge) => edge.data().weight;

		let currentNode = root;
		let visitedNodes = cy.collection();
		for (;;) {
			// Calculating new distances and ordering
			const neighbourNodes = currentNode.neighborhood('node').difference(visitedNodes);
			neighbourNodes.forEach(node => {
				const shortestEdge1 = currentNode.edgesWith(node)
					.difference(`[target="${currentNode.data().id}"][?oriented]`).min(ele => ele.data().weight).ele;
				const newWeight = shortestEdge1.data().weight + (currentNode.scratch('_sum_weight') || 0);
				node.scratch(
					"_sum_weight",
					Math.min(node.scratch("_sum_weight"), newWeight)
				);
			});
			const nextNode = neighbourNodes.min(node => node.scratch("_sum_weight")).ele;

			if (neighbourNodes.length === 0) break;

			visitedNodes.merge(currentNode);
			currentNode = nextNode;
		}
	}

}
