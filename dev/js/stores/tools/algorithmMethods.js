export function dijkstra(cy, root) {
	const weight = (edge) => edge.data('weight');
	const currentSum = ele => ele.scratch("_dijkstra_sum_weight") || Infinity;
	const setSum = (ele, sum) => ele.scratch("_dijkstra_sum_weight", sum);

	let currentNode = root;
	setSum(root, 0);
	let visitedNodes = cy.collection();
	for (;;) {
		// Calculating new distances and ordering
		const neighbourNodes = currentNode.neighborhood('node').difference(visitedNodes);
		neighbourNodes.forEach(node => {
			const shortestEdge1 = currentNode.edgesWith(node)
				.difference(`[target="${currentNode.data('id')}"][?oriented]`)
				.min(weight).ele;
			const newWeight = weight(shortestEdge1) + (currentSum(currentNode) || 0);
			setSum(node, Math.min(currentSum(node), newWeight));
		});

		if (neighbourNodes.length === 0) break;

		const nextNode = neighbourNodes.min(node => currentSum(node)).ele;

		visitedNodes.merge(currentNode);
		currentNode = nextNode;
	}

	const pathLengthVector = cy.nodes()
		.sort((node1, node2) => node1.data('id') - node2.data('id'))
		.map(node => [node, currentSum(node)]);

	cy.nodes().forEach(node => node.removeScratch("_dijkstra_sum_weight"));

	return pathLengthVector;
}
