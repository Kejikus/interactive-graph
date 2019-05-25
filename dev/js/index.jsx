import {app, BrowserWindow, Menu, dialog, ipcMain} from "electron";
import fs from 'fs';
import path from 'path';

import {amgdDecode, amgdEncode, evfDecode, evfEncode, imgdDecode, imgdEncode} from './saveFileTools';
import helpTxt from '../text/help.txt';
import authorsTxt from '../text/authors.txt';

import { TaskTypeEnum } from './const/enums';

function ipcSend(msgType, obj) {
    win.webContents.send(msgType, obj);
}

function clearGraph() {
    ipcSend("clear-graph", {});
}

function openFile() {
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
                let graphData = decodeFunc(data);
                console.log(graphData);
                ipcSend("set-graph", graphData);
            });
        }
    });
}

function saveAsIncidenceMatrix() {
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
}

function saveAsAdjacencyMatrix() {
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
}

function saveAsEdgesVertices() {
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
}

function saveAsImage() {
    dialog.showSaveDialog({
        title: "Save as incidence matrix",
	    defaultPath: 'graph_image.png',
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

// Display dialog box with instructions how to use this program
function displayHelp() {
    dialog.showMessageBox({
        type: "none",
        buttons: ["Close"],
        title: "How to use this application",
        message: helpTxt
    }, () => {});
}

// Display dialog box with info about authors
function displayAuthors() {
    dialog.showMessageBox({
        type: "none",
        buttons: ["Close"],
        title: "Authors",
        message: authorsTxt
    }, () => {});
}

let win;
function createWindow() {
	win = new BrowserWindow({
		width: 1000,
		height: 700,
		minWidth: 1000,
		webPreferences: {
			nodeIntegration: true
		}
	});
	win.loadFile('app/index.html');
	let mainMenu = new Menu.buildFromTemplate([
		{
			label: "File",
			type: "submenu",
			submenu: [
				{
					label: 'Dev Tools',
					submenu: [
						{
							label: "Show dev toolbar",
							role: "toggledevtools"
						},
						{
							label: "Reload",
							role: "forcereload"
						},
					]
				},
				{
					label: "New graph",
					accelerator: "CommandOrControl+N",
					click: clearGraph
				},
				{
					label: "Open...",
					accelerator: "CommandOrControl+O",
					click: openFile
				},
				{
					label: "Save as",
					type: "submenu",
					submenu: [
						{
							label: "Incidence matrix",
							click: saveAsIncidenceMatrix
						},
						{
							label: "Adjacency matrix",
							click: saveAsAdjacencyMatrix
						},
						{
							label: "Edges/Vertices format",
							accelerator: "CommandOrControl+S",
							click: saveAsEdgesVertices
						},
						{
							label: "PNG Image",
							click: saveAsImage
						}
					]
				},
				{
					label: "Exit",
					click: () => app.quit()
				}
			]
		},
		{
			label: "Theory of graph tasks",
			type: "submenu",
			submenu: [
				{
					label: 'Task 1',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.Task1),
				},
			]
		},
		{
			label: "About",
			type: "submenu",
			submenu: [
				{
					label: "Help",
					accelerator: "F1",
					click: displayHelp
				},
				{
					label: "Authors",
					click: displayAuthors
				}
			]
		},
	]);
	Menu.setApplicationMenu(mainMenu);

	win.on('close', function(e){
		let choice = dialog.showMessageBox(this, {
			type: 'question',
			buttons: ['Yes', 'No'],
			title: 'Confirm',
			message: 'Are you sure you want to quit?\nIf you have any unsaved data, it will be lost!'
		});
		if (choice === 1){
			e.preventDefault();
		}
	});
}

process.env.ELECTRON_ENABLE_LOGGING = true;

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
});
