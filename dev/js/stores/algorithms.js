import { TaskTypeEnum } from '../const/enums';

export class InitAlgorithms {
	static create() {
		const tasks = new Map();
		const alg = new AlgorithmsStore();

		tasks.set(TaskTypeEnum.Task1, alg.task1);
		tasks.set(TaskTypeEnum.Task2, alg.task2);

		return tasks;
	}
}

class AlgorithmsStore {

	task1() {
		console.log('1');
	}

	task2() {

		console.log('4');
	}
}
