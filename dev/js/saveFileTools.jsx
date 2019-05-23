import XRegExp from 'xregexp';

const r = String.raw;

export function evfDecode(data) {
    // Decode Edges/Vertices format
    // Returns object {nodes: {...nodeObj}, edges: {...edgeObj}, errors: [...str], lastId: int}
    // Nodes and edges are ready to be added in the graph and are not colliding
    // lastId - greatest id from all objects
    // Edge weight can't be < 0

    const edgesGroup = XRegExp(r`Edges\s*{\s*(?<content>[^}]*)\s*}`, 's');
    const edgeEntry = XRegExp(r`(?:(?<=\)),|(?<!\)))(?<entry>(?<edgeId>\d+)\((?<edgeWeight>\d+(?:\.\d+)?),(?<edgeSourceId>\d+),(?<edgeTargetId>\d+),(?<edgeDirected>1|0)\))`, 'gy');
    const verticesGroup = XRegExp(r`Vertices\s*{\s*(?<content>[^}]*)\s*}`, 's');
    const vertexEntry = XRegExp(r`(?:(?<=\)),|(?<!\)))(?<entry>(?<vertexId>\d+)\((?<vertexX>-?\d+(?:\.\d+)?),(?<vertexY>-?\d+(?:\.\d+)?)\))`, 'gy');

    let edgesMatch = XRegExp.exec(data, edgesGroup);
    let verticesMatch = XRegExp.exec(data, verticesGroup);
    console.log(Boolean(edgesMatch));
    console.log(Boolean(verticesMatch));
    let edges = {};
    let nodes = {};
    let errors = [];
    let usedIds = [];
    let lastId = 0;

    if (verticesMatch) {
        let verticesText = verticesMatch.content.replace(/\s/g, '');
        console.log(verticesText);
        let lastIdx = 0;
        let scannedText = '';
        XRegExp.forEach(verticesText, vertexEntry, (match, i) => {
            console.log(match);
            lastIdx = i;
            let x = parseInt(match.vertexX);
            let y = parseInt(match.vertexY);
            let id = match.vertexId;
            if (!usedIds.includes(id)) {
                nodes[id] = {
                    group: 'nodes',
                    data: {
                        id: id
                    },
                    position: {
                        x: x,
                        y: y
                    }
                };
                lastId = Math.max(parseInt(id), lastId);
                usedIds.push(id);
            } else {
                errors.push(`Error parsing nodes at ${lastIdx + 1} element - node with id ${id} was already defined`);
            }
            scannedText = scannedText.concat(match[0]);
        });
        if (scannedText.length !== verticesText.length) {
            errors.push(`Error parsing vertices definition, after ${lastIdx + 1} item. (Maybe you forgot a comma?)`);
        }
    }

    if (edgesMatch) {
        let edgesText = edgesMatch.content.replace(/\s/g, '');
        console.log(edgesText);
        let lastIdx = 0;
        let scannedText = '';
        XRegExp.forEach(edgesText, edgeEntry, (match, i) => {
            console.log(match);
            lastIdx = i;
            let source = null;
            let target = null;
            let oriented = false;
            let edgeId = match.edgeId;

            let edgeIdUsed = usedIds.includes(edgeId);
            let srcIdUsed = usedIds.includes(source) && (nodes[source] === undefined);
            let tgtIdUsed = usedIds.includes(target) && (nodes[target] === undefined);

            if (!edgeIdUsed && !srcIdUsed && !tgtIdUsed)
            {
                source = match.edgeSourceId;
                target = match.edgeTargetId;
                oriented = match.edgeDirected === '1';
                if (nodes[source] === undefined) {
                    nodes[source] = {
                        group: 'nodes',
                        data: {
                            id: source,
                            layout: true
                        },
                        position: {
                            x: 0,
                            y: 0
                        }
                    };
                    lastId = Math.max(parseInt(source), lastId);
                    usedIds.push(source);
                }
                if (nodes[target] === undefined) {
                    nodes[target] = {
                        group: 'nodes',
                        data: {
                            id: target,
                            layout: true
                        },
                        position: {
                            x: 0,
                            y: 0
                        }
                    };
                    lastId = Math.max(parseInt(target), lastId);
                    usedIds.push(target);
                }
                edges[edgeId] = {
                    group: 'edges',
                    data: {
                        id: edgeId,
                        weight: parseInt(match.edgeWeight),
                        oriented: oriented,
                        source: source,
                        target: target
                    },
                };
                lastId = Math.max(parseInt(edgeId), lastId);
                usedIds.push(edgeId);
            } else {
                if (edgeIdUsed) {
                    errors.push(`Error parsing edges at ${lastIdx + 1} element - can't insert edge object - node/edge with id ${edgeId} was already defined`);
                }
                if (srcIdUsed) {
                    errors.push(`Error parsing edges at ${lastIdx + 1} element - can't insert source node - node/edge with id ${source} was already defined`);
                }
                if (tgtIdUsed) {
                    errors.push(`Error parsing edges at ${lastIdx + 1} element - can't insert target node - node/edge with id ${target} was already defined`);
                }
            }
            scannedText = scannedText.concat(match[0]);
        });
        if (scannedText.length !== edgesText.length) {
            errors.push(`Error in edges definition, after ${lastIdx + 1} item`);
        }
    }

    return {
        errors: errors,
        edges: edges,
        nodes: nodes,
        lastId: lastId
    };
}

export function evfEncode(collection) {
    // Encode given node and edge objects in the .evf format
    // collection - {nodes: [...nodeObj], edges: [..edgeObj]}
    // Return object {error: bool, content: str}
    // content - string containing .evf file contents
    // error - flag if there were an error, if it's set, content will be empty

    let nodesArr = collection.nodes;
    let edgesArr = collection.edges;
    const error = {error: true, content: ""};

    let verticesText = "";
    for (const node of nodesArr) {
        if (verticesText !== "") verticesText += ",";

        if (isNaN(Number(node.data.id))) return error;

        verticesText += `${node.data.id}(${Math.floor(node.position.x)},${Math.floor(node.position.y)})`;
    }

    let edgesText = "";
    for (const edge of edgesArr) {
        if (edgesText !== "")
            edgesText += ",";

        if (isNaN(Number(edge.data.id))) return error;

        const directed = edge.data.oriented ? 1 : 0;

        edgesText += `${edge.data.id}(${edge.data.weight},${edge.data.source},${edge.data.target},${directed})`;
    }

    const content = `Vertices{${verticesText}}Edges{${edgesText}}`;
    return {
        error: false,
        content: content
    };
}

export function imgdDecode(data) {
    // imgd - Incidence Matrix Graph Data
    // Treated as JSON with condition that all JSON is a rectangle array
    // Row - node, column - edge
    // Return {node: {}, edges: {}, errors: [], lastId: int}

    let errors = [];
    let nodes = {};
    let edges = {};
    let lastId = -1;

    const retObj = () => {
        return {
            errors: errors,
            nodes: nodes,
            edges: edges,
            lastId: lastId
        };
    };

    let matrix;
    try {
        let formatError = false;
        let rowLength = -1;
        matrix = JSON.parse(data, (k, v) => {
            if (formatError) return v;
            if (typeof v === 'number') {
                if (!(Number.isInteger(v) && (v >= -1 && v <= 1))) {
                    formatError = true;
                    errors.push(`Error parsing file - '${v}' is not integer or not in [-1, 0, 1]`);
                }
                return v;
            }
            if (typeof v === 'object' && Array.isArray(v)) {
                if (k !== '' && typeof v[0] !== 'number') {
                    formatError = true;
                    errors.push(`Error parsing file - file must be a rectangle array of numbers [-1, 0, 1]`);
                    console.log(2)
                }
                if (k !== '' && rowLength !== -1 && v.length !== rowLength) {
                    formatError = true;
                    errors.push(`Error parsing file - file must be a rectangle array of numbers [-1, 0, 1]`);
                }
                if (k !== '') rowLength = v.length;
                return v;
            }
            formatError = true;
            errors.push('Error parsing file - file must be a rectangle array of numbers [-1, 0, 1]');
            console.log(3);
            return v;
        });
        if (formatError) return retObj();
    } catch (e) {
        return retObj();
    }

    const nodesCount = matrix.length;
    const edgesCount = matrix[0].length;
    for (let i = 0; i < nodesCount; i++) {
        nodes[i] = {
            group: 'nodes',
            data: {
                id: ++lastId,
                layout: true
            },
            position: {
                x: 0,
                y: 0
            }
        };
    }
    for (let i = 0; i < edgesCount; i++) {
        let source = null;
        let target = null;
        let directed = false;
        let id = ++lastId;
        for (let j = 0; j < nodesCount; j++) {
            if (matrix[j][i] === 1) {
                if (source === null) {
                    source = j;
                } else if (target === null) {
                    target = j;
                } else {
                    errors.push(``);
                    return retObj();
                }
            } else if (matrix[j][i] === -1) {
                if (source === null) {
                    source = j;
                    directed = true;
                } else if (target === null && !directed) {
                    target = source;
                    source = j;
                    directed = true;
                } else {
                    return retObj();
                }
            }
        }
        edges[id] = {
            group: 'edges',
            data: {
                id: id,
                weight: 1,
                source: source,
                target: target,
                oriented: directed
            }
        }
    }

    return retObj();
}
