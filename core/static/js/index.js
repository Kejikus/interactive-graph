function showPopup(data, callback, headText, nodeId = '', nodeLabel = '', onSave = null, onCancel = null) {
    $(popupId + ' header')[0].innerText = headText;
    $(popupId + ' input[name="id"]')[0].setAttribute('placeholder', nodeId);
    $(popupId + ' input[name="label"]')[0].value = nodeLabel;
    $(popupId + ' *[data-action="save"]')[0].onclick = onSave.bind(this, data, callback);
    $(popupId + ' *[data-action="cancel"]')[0].onclick = onCancel.bind(this, callback);
    let instance = M.Modal.getInstance($(popupId)[0]);
    instance.open();
}

function hidePopup() {
    $(popupId + ' *[data-action="save"]')[0].onclick = null;
    $(popupId + ' *[data-action="cancel"]')[0].onclick = null;
    let instance = M.Modal.getInstance($(popupId)[0]);
    instance.close();
}

function savePopupNode(data, callback) {
    let id = $(popupId + ' input[name="id"]')[0].value;
    if (!id) {
        data.id = $(popupId + ' input[name="id"]')[0].getAttribute('placeholder');
    } else {
        data.id = id;
    }
    data.label = $(popupId + ' input[name="label"]')[0].value;
    hidePopup();
    callback(data);
}

function discardPopup(callback) {
    hidePopup();
    callback(null);
}


function getSiblingEdges(from, to) {

}

function updateGraph() {
    let dict = {};
    let edges = graphEdges._data;
    for (let edgeId in edges) {
        let combinedId = edges[edgeId].from + edges[edgeId].to;
        if (!(combinedId in dict)) {
            dict[combinedId] = 1;
        } else {
            dict[combinedId]++;
        }
        if (graphEdges._data[edgeId].smooth === undefined)
            graphEdges._data[edgeId].smooth = {enabled: true, type: 'curvedCW'};
        graphEdges._data[edgeId].smooth.roundness = dict[combinedId] / 5;
    }

    network.body.emitter.emit('_dataChanged');
    network.redraw();
}


let popupId = "#graph-popup";
let incidenceMatrixJQ = $('#incidence-matrix');

let requireLoopConfirm = true;

let container = $("#graph-container")[0];
let graphNodes = new vis.DataSet();
let graphEdges = new vis.DataSet();
let data = {
    nodes: graphNodes,
    edges: graphEdges
};
let options = {
    locale: 'en',
    manipulation: {
        addNode: (data, callback) => {
            showPopup(data, callback, 'Add Node', data.id, '', savePopupNode, discardPopup);
        },
        editNode: (data, callback) =>
            showPopup(data, callback, 'Edit Node', data.id, data.label, savePopupNode, discardPopup),
        addEdge: (data, callback) => {
            if ((data.from !== data.to) || !requireLoopConfirm || confirm("Do you want to create loop?")) {
                callback(data);
                updateGraph();
            }
        },
    },
    edges: {
        smooth: {
            type: 'curvedCW',
            forceDirection: 'none',
            roundness: 0.2
        }
    },
    physics: {
        enabled: false,
        barnesHut: {
            gravitationalConstant: -1000,
            centralGravity: 0.1,
            springConstant: 0,
            avoidOverlap: 0
        },
        minVelocity: 0.2,
        timestep: 0.5
    }
};
let network = new vis.Network(container, data, options);

$(document).ready(() => {
    $('.modal').modal();
});
