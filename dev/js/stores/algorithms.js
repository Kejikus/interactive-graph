import { TaskTypeEnum } from '../const/enums';
import {messager, msgTypes} from "../rendererMessager";

export class InitAlgorithms {
	static create() {
		const tasks = new Map();
		const alg = new AlgorithmsStore();

		tasks.set(TaskTypeEnum.BreadthFirstSearch, alg.BreadthFirstSearch());
		tasks.set(TaskTypeEnum.BestFirstSearch, alg.BestFirstSearch);
		tasks.set(TaskTypeEnum.Dijkstra, alg.Dijkstra);
		tasks.set(TaskTypeEnum.AStar, alg.AStar);

		return tasks;
	}
}

class AlgorithmsStore {


	BreadthFirstSearch(cy) {

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
