import {EventEmitter} from 'events';
import {dialog} from "electron";
import helpTxt from "../text/help.txt";

class Messager extends EventEmitter {
	send(messageType, ...args) {
		return this.emit(messageType, ...args);
	}
}

export const messager = new Messager();

export const msgTypes = {
	// components/matrix
	matrixSetData: "set-matrix-collection", // nodes, edges

	// components/graph
	graphSetAdjacency: "graph-set-adjacency", // srcNodeIdx, tgtNodeIdx, valueTo, valueFrom

	// components/toolbar
	toolbarSetMessage: "toolbar-set-message", // msg

	// this
	showMessageBox: "show-message-box", // title, msg
};

messager.on(msgTypes.showMessageBox, (title, msg) => {
	dialog.showMessageBox({
        type: "none",
        buttons: ["Close"],
        title: title,
        message: msg
    }, () => {});
});
