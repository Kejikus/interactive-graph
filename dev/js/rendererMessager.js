import {EventEmitter} from 'events';
import {ipcRenderer} from 'electron';

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
	graphGetNextId: "graph-get-next-id", // callback (id) => void
	graphGetNextNodeIdx: "graph-get-next-node-idx", // callback (idx) => void
	graphURDo: "graph-ur-do", // name, param

	// components/toolbar
	toolbarSetMessage: "toolbar-set-message", // msg

	// components/sidebar
	sidebarShowInput: "sidebar-show-input", // callback on input accept

	// this
	showMessageBox: "show-message-box", // title, msg
};

messager.on(msgTypes.showMessageBox, (title, msg) => {
	ipcRenderer.send('show-message-box', title, msg);
});
