import {app, BrowserWindow, Menu, dialog, ipcMain} from "electron";
import fs from 'fs';
import path from 'path';

import {amgdDecode, amgdEncode, evfDecode, evfEncode, imgdDecode, imgdEncode} from './saveFileTools';
import helpTxt from '../text/help.txt';
import authorsTxt from '../text/authors.txt';


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
                    label: "To be added",
                    enabled: false
                }
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
        {
            label: "Show dev toolbar",
            role: "toggledevtools"
        }
    ]);
    Menu.setApplicationMenu(mainMenu);
}

process.env.ELECTRON_ENABLE_LOGGING = true;

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
});
