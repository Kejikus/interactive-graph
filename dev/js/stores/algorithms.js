import { TaskTypeEnum } from '../const/enums';

export class InitAlgorithms {
	static create() {
		const tasks = new Map();
		const alg = new AlgorithmsStore();

		tasks.set(TaskTypeEnum.Task1, alg.BestFirstSearch);
		tasks.set(TaskTypeEnum.Task2, alg.BestFirstSearch);

		return tasks;
	}
}

class AlgorithmsStore {
	

	task1(cy) {
		console.log('1');
	}

	BestFirstSearch(cy) {
		console.log(cy);

	}


}
