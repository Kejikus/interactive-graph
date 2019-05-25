/*
	Contains functions to open/save files of formats:
		.evf - Edges/Vertices
		.imgd - Incidence Matrix Graph Data
		.amgd - Adjacency Matrix Graph Data
		.png - (Only save) - PNG image of a graph
*/

import {dialog, ipcMain} from "electron";
import path from "path";
import {amgdDecode, amgdEncode, evfDecode, evfEncode, imgdDecode, imgdEncode} from "./saveFileTools";
import fs from "fs";
import {win} from '../index';

function ipcSend(msgType, obj) {
    win.webContents.send(msgType, obj);
}

export default {
	openFile() {
		dialog.showOpenDialog({
			title: "Select graph file",
			properties: ["openFile"],
			filters: [
				{name: "All formats", extensions: ["evf", "imgd", "amgd"]},
				{name: "Edges/Vertices format", extensions: ["evf"]},
				{name: "Incidence matrix", extensions: ["imgd"]},
				{name: "Adjacency matrix", extensions: ["amgd"]}
			]
		}, filePaths => {
			console.log(filePaths);
			if (filePaths === undefined) {
				console.log("Nothing selected");
				return;
			}

			let filename = filePaths[0];
			let decodeFunc = null;

			if (path.extname(filename) === '.evf') decodeFunc = evfDecode;
			else if (path.extname(filename) === '.imgd') decodeFunc = imgdDecode;
			else if (path.extname(filename) === '.amgd') decodeFunc = amgdDecode;

			if (decodeFunc !== null) {
				fs.readFile(filename, 'utf8', (err, data) => {
					data = data.replace(/%[^\n]*\n/gm, '\n');
					let graphData = decodeFunc(data);
					console.log(graphData);
					ipcSend("set-graph", graphData);
				});
			}
		});
	},
	saveAsIncidenceMatrix() {
	    dialog.showSaveDialog({
	        title: "Save as incidence matrix",
		    defaultPath: 'graph.imgd',
	        filters: [
	            {name: "Incidence matrix", extensions: ["imgd"]},
	            {name: "All files", extensions: ["*"]}
	        ]
	    }, filename => {
	        if (filename === undefined) return;

	        ipcSend("request-save-collection", null);
	        ipcMain.once("send-save-collection", (sender, obj) => {
	            const fileObj = imgdEncode(obj);
	            if (!fileObj.error)
	                fs.writeFile(filename, fileObj.content, err => {
	                    if (err) return ipcSend("save-error", err);
	                    ipcSend("save-success", null);
	                });
	            else ipcSend("save-error", 'Error saving in .imgd format');
	        });
	    });
	},
	saveAsAdjacencyMatrix() {
	    dialog.showSaveDialog({
	        title: "Save as incidence matrix",
		    defaultPath: 'graph.amgd',
	        filters: [
	            {name: "Adjacency matrix", extensions: ["amgd"]},
	            {name: "All files", extensions: ["*"]}
	        ]
	    }, filename => {
	        if (filename === undefined) return;

	        ipcSend("request-save-collection", null);
	        ipcMain.once("send-save-collection", (sender, obj) => {
	            const fileObj = amgdEncode(obj);
	            if (!fileObj.error)
	                fs.writeFile(filename, fileObj.content, err => {
	                    if (err) return ipcSend("save-error", err);
	                    ipcSend("save-success", null);
	                });
	            else ipcSend("save-error", 'Error saving in .imgd format');
	        });
	    });
	},
	saveAsEdgesVertices() {
	    dialog.showSaveDialog({
	        title: "Save as incidence matrix",
		    defaultPath: 'graph.evf',
	        filters: [
	            {name: "Edges/Vertices format", extensions: ["evf"]},
	            {name: "All files", extensions: ["*"]}
	        ]
	    }, filename => {
	        if (filename === undefined) return;

	        ipcSend("request-save-collection", null);
	        ipcMain.once("send-save-collection", (sender, obj) => {
	            const fileObj = evfEncode(obj);
	            if (!fileObj.error)
	                fs.writeFile(filename, fileObj.content, err => {
	                    if (err) return ipcSend("save-error", err);
	                    ipcSend("save-success", null);
	                });
	            else ipcSend("save-error", 'Error saving in .evf format');
	        });
	    });
	},
	saveAsImage() {
	    dialog.showSaveDialog({
	        title: "Save as image",
	        defaultPath: "graph_image.png",
	        filters: [
	            {name: "PNG Image", extensions: ["png"]},
	            {name: "All files", extensions: ["*"]}
	        ]
	    }, filename => {
	        if (filename === undefined) return;

	        ipcSend("request-save-image", null);
	        ipcMain.once("send-save-image", (sender, obj) => {
	            fs.writeFile(filename, obj, 'base64', err => {
	                if (err) return ipcSend("save-error", err);
	                ipcSend("save-success", null);
	            });
	        });
	    });
	}
}