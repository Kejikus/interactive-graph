
function showPopup(headText, nodeId = '', nodeLabel = '', onSave = null, onCancel = null) {
    $(popupId + ' header').innerText = headText;
    $(popupId + ' input[name="id"]')[0].value = nodeId;
    $(popupId + ' input[name="label"]')[0].value = nodeLabel;
    $(popupId + ' button[name="save"]').click(onSave);
    $(popupId + ' button[name="cancel"]').click(onCancel);
    $(popupId)[0].style.display = 'block';
}

function hidePopup() {
    $(popupId + ' button[name="save"]').onclick = null;
    $(popupId + ' button[name="cancel"]').onclick = null;
    $(popupId)[0].style.display = 'none';
}

function savePopupNode(data, callback) {
    data.id = $(popupId + ' input[name="id"]')[0].value;
    data.label = $(popupId + ' input[name="label"]')[0].value;
    hidePopup();
    callback(data);
}

function discardPopup(callback) {
    hidePopup();
    callback(null);
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
        addNode: (data, callback) =>
            showPopup('Add Node', data.id, data.label, savePopupNode.bind(this, data, callback), hidePopup.bind(this)),
        editNode: (data, callback) =>
            showPopup('Edit Node', data.id, data.label, savePopupNode.bind(this, data, callback), discardPopup.bind(this, callback)),
        addEdge: (data, callback) => {
            if ((data.from !== data.to) || !requireLoopConfirm || confirm("Do you want to create loop?")) {
                callback(data);
            }
        },
    }
};
let network = new vis.Network(container, data, options);
