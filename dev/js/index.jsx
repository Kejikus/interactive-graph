import {app, BrowserWindow, Menu} from "electron";


function clearGraph() {

}

function openFile() {

}

function saveAsIncidenceMatrix() {

}

function saveAsAdjacencyMatrix() {

}

function saveAsEdgesVertices() {

}

// Display dialog box with instructions how to use this program
function displayHelp() {

}

// Display dialog box with info about authors
function displayAuthors() {

}


function createWindow() {
    let win = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 1000
    });
    win.loadFile('app/index.html');
    Menu.setApplicationMenu(new Menu.buildFromTemplate([
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
        }
    ]));
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
});
