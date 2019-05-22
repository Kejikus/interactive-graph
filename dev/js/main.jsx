import {ipcRenderer} from 'electron';
import React, { Component } from 'react';
import * as ReactDOM from "react-dom";

import '../styles/index.sass';
import "materialize-css";

import Graph from './components/graph';

ipcRenderer.on("log", (sender, msg) => console.log(msg));

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
