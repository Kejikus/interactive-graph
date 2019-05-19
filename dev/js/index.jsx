import {app, BrowserWindow, Menu, dialog} from "electron";


function clearGraph() {
    win.webContents.send("clear-graph", {});
}

function openFile() {
    dialog.showOpenDialog({
        title: "Select graph file",
        properties: ["openFile"],
        filters: [
            {name: "Edges/Vertices format", extensions: ["evf"]},
            {name: "Incidence matrix", extensions: ["imgd"]},
            {name: "Adjacency matrix", extensions: ["amgd"]},
            {name: "All files", extensions: ["*"]}
        ]
    }, filePaths => {
        if (filePaths === undefined) {
            console.log("Nothing selected");
            return;
        }

        console.log(filePaths);
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
        if (filename === undefined) {
            console.log("Nothing selected");
            return;
        }

        console.log(filename);
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
        if (filename === undefined) {
            console.log("Nothing selected");
            return;
        }

        console.log(filename);
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
        if (filename === undefined) {
            console.log("Nothing selected");
            return;
        }

        console.log(filename);
    });
}

// Display dialog box with instructions how to use this program
function displayHelp() {
    dialog.showMessageBox({
        type: "none",
        buttons: ["Close"],
        title: "How to use this application",
        message: "To be filled..."
    }, () => {});
}

// Display dialog box with info about authors
function displayAuthors() {
    dialog.showMessageBox({
        type: "none",
        buttons: ["Close"],
        title: "Authors",
        message: "To be filled..."
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

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
});
