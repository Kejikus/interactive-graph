import { TaskTypeEnum } from '../const/enums';
import {messager, msgTypes} from "../rendererMessager";
import {dijkstra} from "./tools/algorithmMethods";

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

}
