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
		let neighborNodes = currentNode.neighborhood('node').difference(visitedNodes);
		neighborNodes.forEach(node => {
			const shortestEdge1 = currentNode.edgesWith(node)
				.difference(`[target="${currentNode.data('id')}"][?oriented]`)
				.min(weight).ele;
			if (shortestEdge1 !== undefined) {
				const newWeight = weight(shortestEdge1) + (currentSum(currentNode) || 0);
				setSum(node, Math.min(currentSum(node), newWeight));
			} else {
				neighborNodes = neighborNodes.difference(node);
			}
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

export function nodeDegree(node) {
	const outgoingEdges = node.neighborhood('edge').difference(`[source="${node.data('id')}"][target!="${node.data('id')}"][?oriented]`).length;
	const directedLoops = node.neighborhood(`edge[source="${node.data('id')}"][target="${node.data('id')}"][?oriented]`).length;
	const undirectedLoops = node.neighborhood(`edge[source="${node.data('id')}"][target="${node.data('id')}"][!oriented]`).length * 2;

	return outgoingEdges + directedLoops + undirectedLoops;
}

export function nonIncidentNodes(node) {
	const allNodes = node.cy().nodes();
	const incidentNodes = node.neighborhood('node');
	return allNodes.difference(incidentNodes);
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

export function generateVectorText(vector, prependText) {
	if (prependText) prependText += ' ';
	else prependText = '';
	return vector.reduce((text, value) => text.concat(`${prependText}${value[0].data('nodeIdx')}: ${value[1]}\n`), '');
}
