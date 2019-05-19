import React, { Component } from 'react';
import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import undoRedo from 'cytoscape-undo-redo';
import $ from 'jquery';
import Toolbar from "./toolbar";

import graphCss from "../../styles/cytoscape.txt.css";

cytoscape.use(edgehandles);
undoRedo(cytoscape);

export default
class Graph extends Component {

    constructor(props) {
        super(props);
        this.state = {
            mode: null,
            graphOnClick: null,
            lastId: -1
        };
        this.graphContainer = React.createRef();
        this.toolbar = React.createRef();
        this.incidenceMatrix = props.incidenceMatrix ? props.incidenceMatrix : null;
        $(document).on("keydown", (e) => {
            if (e.ctrlKey) {
                if (e.which === 'D'.charCodeAt(0)) {
                    this.onAddNodeClick();
                    e.preventDefault();
                } else if (e.which === 'E'.charCodeAt(0)) {
                    this.onAddEdgeClick();
                    e.preventDefault();
                } else if (e.shiftKey && e.which === 'Z'.charCodeAt(0)) {
                    this.ur.redo();
                    e.preventDefault();
                } else if (e.which === 'Z'.charCodeAt(0)) {
                    this.ur.undo();
                    e.preventDefault();
                }
            } else {
                if (e.which === 46) { // Delete
                    this.ur.do('remove', this.cy.$(':selected'));
                    e.preventDefault();
                }
            }
        });
    }

    componentDidMount() {
        this.cy = cytoscape({
            container: this.graphContainer.current,
            style: graphCss
        });
        this.cy.style(this.cy.style()).fromJson([
            {
                selector: 'node[label][weight]',
                style: {
                    'label': (ele) => {
                        if (ele.data().label && ele.data().weight) {
                            return `[${ele.data().weight}] ${ele.data().label}`;
                        } else if (ele.data().label) {
                            return ele.data().label;
                        } else if (ele.data().weight) {
                            return ele.data().weight;
                        } else {
                            return '';
                        }
                    }
                }
            }
        ]);
        this.cy.on('select', 'node', event => {
            let node = event.target;
            node.cy().$(`edge[source="${node.id()}"], edge[target="${node.id()}"][!oriented]`).addClass('node-selected');
        });
        this.cy.on('unselect', 'node', event => {
            let node = event.target;
            node.cy().$(`edge[source="${node.id()}"], edge[target="${node.id()}"][!oriented]`).removeClass('node-selected');
        });

        const recalculateNodeWeight = node => {
            node.data('weight', node.connectedEdges().difference('.eh-ghost-edge').degreeCentrality({
                root: node,
                weight: edge => {
                    const srcX = edge.source().position().x;
                    const srcY = edge.source().position().y;
                    const tgtX = edge.target().position().x;
                    const tgtY = edge.target().position().y;
                    return Math.floor(Math.sqrt(
                        Math.pow(Math.abs(srcX - tgtX), 2) +
                        Math.pow(Math.abs(srcY - tgtY), 2)
                    ));
                },
                alpha: 1,
                directed: true
            }).outdegree);
        };

        this.cy.on('add position', 'node', event => {
            const node = event.target;
            recalculateNodeWeight(node);
            // console.log(node.neighbourhood());
            node.neighbourhood().filter('node').map(node => recalculateNodeWeight(node));
        });
        this.cy.on('add remove', 'edge', event => {
            const edge = event.target;
            recalculateNodeWeight(edge.source());
            recalculateNodeWeight(edge.target());
        });
        this.ur = this.cy.undoRedo({
            stackSizeLimit: 10
        });
    }

    resetMode() {
        let mode = this.state.mode;

        switch (mode) {
            case 'add-node': {
                this.toolbar.current.showMessage('');
                this.cy.removeListener('tap', this.state.graphOnClick);
                this.toolbar.current.removeAllFields();
                this.cy.resize();
                this.state.mode = null;
                this.state.graphOnClick = null;
                break;
            }
            case 'add-edge': {
                if (this.eh !== null) {
                    this.eh.disableDrawMode();
                    this.eh.destroy();
                    this.eh = null;
                }
                this.toolbar.current.showMessage('');
                this.toolbar.current.removeAllFields();
                this.cy.resize();
                this.state.mode = null;
                break;
            }
        }
    }

    onAddNodeClick() {
        let state = this.state;
        let cy = this.cy;
        let ur = this.ur;
        let resetMode = () => this.resetMode();

        if (state.mode !== 'add-node') {
            resetMode();
            state.mode = 'add-node';

            let labelInput = this.toolbar.current
                .addField('text', 'node-label', '', 'Node label', true);

            this.state.graphOnClick = function (event) {
                if (state.mode === 'add-node' && event.target === cy) {
                    let data = {
                        id: ++state.lastId
                    };
                    let label = labelInput.current.value;
                    if (label)
                        data.label = label;

                    ur.do('add',{
                        group: 'nodes',
                        data: {
                            id: ++state.lastId,
                            label: labelInput.current.value,
                            weight: undefined
                        },
                        position: event.position
                    });
                    resetMode();
                }
            };
            this.toolbar.current.showMessage('Click on the free space to add node there');
            this.cy.on('tap', this.state.graphOnClick);
        } else {
            resetMode();
        }
    }

    onAddEdgeClick() {
        let state = this.state;
        let cy = this.cy;
        let resetMode = () => this.resetMode();

        if (state.mode !== 'add-edge') {

            let onEdgeAdded = (source, target, eles) => {
                this.ur.do("add", eles);
                resetMode();
            };
            let edgeObj = () => {
                return {
                    id: ++state.lastId,
                    data: {
                        label: labelInput.current.value,
                        oriented: checkboxIsArrow.current.checked
                    }
                }
            };
            let ghostEdgeObj = () => {
                return {
                    data: {
                        label: labelInput.current.value,
                        oriented: checkboxIsArrow.current.checked
                    }
                }
            };

            resetMode();
            state.mode = 'add-edge';

            let labelInput = this.toolbar.current
                .addField('text', 'edge-label', '', 'Edge label', true);
            let checkboxIsArrow = this.toolbar.current.addField('checkbox', 'edge-is-arrow', 'Oriented');

            // cytoscape-edgehandles options
            // https://github.com/cytoscape/cytoscape.js-edgehandles#initialisation
            let ehOptions = {
                complete: onEdgeAdded,
                loopAllowed: () => true,
                edgeParams: edgeObj,
                ghostEdgeParams: ghostEdgeObj
            };

            this.eh = cy.edgehandles(ehOptions);
            this.eh.enableDrawMode();
        } else {
            resetMode();
        }
    }

    render() {
        return (
            <div className={ this.props.className }>
                <Toolbar className="graph-toolbar"
                         ref={this.toolbar}
                         buttons={[
                            {value: "Pan/select", onClick: () => this.resetMode()},
                            {value: "Add node", onClick: () => this.onAddNodeClick()},
                            {value: "Add edge", onClick: () => this.onAddEdgeClick()}
                         ]} />
                <div className="graph-container" ref={this.graphContainer}/>
            </div>
        );
    }
}
