export function dijkstra(cy, rootNode) {
	const weight = (edge) => edge.data('weight');
	const currentSum = ele => {
		const sum = ele.scratch("_dijkstra_sum_weight");
		return sum === undefined ? Infinity : sum;
	};
	const setSum = (ele, sum) => ele.scratch("_dijkstra_sum_weight", sum);

	let currentNode = rootNode;
	setSum(rootNode, 0);
	let visitedNodes = cy.collection();
	for (;;) {
		// Calculating new distances and ordering
		const neighborNodes = currentNode.neighborhood('node').difference(visitedNodes);
		neighborNodes.forEach(node => {
			const shortestEdge1 = currentNode.edgesWith(node)
				.difference(`[target="${currentNode.data('id')}"][?oriented]`)
				.min(weight).ele;
			const newWeight = weight(shortestEdge1) + (currentSum(currentNode) || 0);
			setSum(node, Math.min(currentSum(node), newWeight));
		});

		if (neighborNodes.length === 0) break;

		let nextNode = neighborNodes.min(node => currentSum(node)).ele;

		visitedNodes.merge(currentNode);
		currentNode = nextNode;
	}

	const pathLengthVector = cy.nodes()
		.sort((node1, node2) => node1.data('id') - node2.data('id'))
		.map(node => [node, currentSum(node)]);

	cy.nodes().forEach(node => node.removeScratch("_dijkstra_sum_weight"));

	return pathLengthVector;
}

export function generateTable(matrix, colWidth) {
	// Matrix: Map of nodes to ints
	// [[<node>, <int>], [<node>, <int>], ...]

	let header = ''.padStart(colWidth);
	matrix.forEach((_, node) => {
		header += ' | ' + node.data('nodeIdx').toString().padStart(colWidth);
	});

	let rows = '';
	matrix.forEach((row, node) => {
		rows += node.data('nodeIdx').toString().padStart(colWidth);
		row.forEach(pathLength => {
			rows += ' | ' + `${pathLength}`.padStart(colWidth);
		});
		rows += '\n';
	});

	return `${header}\n${rows}`;
}
