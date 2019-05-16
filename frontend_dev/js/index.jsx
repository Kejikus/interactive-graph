import React, { Component } from 'react';
import * as ReactDOM from "react-dom";

import '../styles/index.sass';
import "materialize-css";

import Graph from './components/graph';

// function showPopup(nodeData, headText, nodeId = '', nodeLabel = '', onSave = null, onCancel = null) {
//     $(popupId + ' header')[0].innerText = headText;
//     $(popupId + ' input[name="id"]')[0].setAttribute('placeholder', nodeId);
//     $(popupId + ' input[name="label"]')[0].value = nodeLabel;
//     $(popupId + ' *[data-action="save"]')[0].onclick = onSave.bind(this, nodeData, callback);
//     $(popupId + ' *[data-action="cancel"]')[0].onclick = onCancel.bind(this, callback);
//     let instance = M.Modal.getInstance($(popupId)[0]);
//     instance.open();
// }
//
// function hidePopup() {
//     $(popupId + ' *[data-action="save"]')[0].onclick = null;
//     $(popupId + ' *[data-action="cancel"]')[0].onclick = null;
//     let instance = M.Modal.getInstance($(popupId)[0]);
//     instance.close();
// }
//
// function savePopupNode(nodeData, callback) {
//     let id = $(popupId + ' input[name="id"]')[0].value;
//     if (!id) {
//         nodeData.id = $(popupId + ' input[name="id"]')[0].getAttribute('placeholder');
//     } else {
//         nodeData.id = id;
//     }
//     nodeData.label = $(popupId + ' input[name="label"]')[0].value;
//     hidePopup();
//     callback(nodeData);
// }
//
// function discardPopup(callback) {
//     hidePopup();
//     callback(null);
// }
//
// let popupId = "#graph-popup";
//
// let mode = null;
// let tapHandler = null;
// let acceptHandler = null;
// let lastId = -1;
//
// function addNodeClicked() {
//     const msgBox = $('#message-box')[0];
//     if (mode !== 'add-node') {
//         mode = 'add-node';
//         tapHandler = function (event) {
//             if (mode === 'add-node' && event.target === cy) {
//                 acceptHandler = (data) => {
//                     cy.add({
//                         group: 'nodes',
//
//                     });
//                     msgBox.innerHTML = '';
//                     cy.removeListener('tap', tapHandler);
//                 }
//             }
//         };
//         msgBox.innerHTML = 'Click on the free space to add node there';
//         cy.on('tap', tapHandler);
//     } else {
//         mode = null;
//         msgBox.innerHTML = '';
//         cy.removeListener('tap', tapHandler);
//     }
// }

class IncidenceMatrix extends Component {
    render() {
        return (
            <table className="incidence-matrix">
                <tbody>
                    <tr>
                        <th className="root-cell"></th>
                        <th data-node-id="1">1</th>
                        <th data-node-id="1">2222222</th>
                        <th data-node-id="1">2222222</th>
                        <th data-node-id="1">2222222</th>
                        <th data-node-id="1">2222222</th>
                    </tr>
                    <tr>
                        <th data-node-id="1">1</th>
                        <td data-edge-id="1">XXXX</td>
                        <td data-edge-id="1">X</td>
                        <td data-edge-id="1">X</td>
                        <td data-edge-id="1">X</td>
                        <td data-edge-id="1">X</td>
                    </tr>
                </tbody>
            </table>
        );
    }
}

class App extends Component {

    render() {
        return (
            <div className="main-wrapper">
                <header className="upper-header card-panel">
                    Interactive graph visualizer
                </header>
                <Graph className="content card-panel"/>
                <div className="side-bar card-panel">
                    <IncidenceMatrix/>
                    <ul className="hints">
                        <li>Ctrl+Z / Ctrl+Shift+Z - Undo/redo</li>
                        <li>Ctrl+D - Add node</li>
                        <li>Ctrl+E - Add edge</li>
                    </ul>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App/>,
    document.getElementById('root')
);

// $(document).ready(() => {
//     $('.modal').modal();
// });
