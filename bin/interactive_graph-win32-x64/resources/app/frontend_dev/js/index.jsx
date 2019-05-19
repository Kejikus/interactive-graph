import {app, BrowserWindow} from "electron";


function createWindow() {
    let win = new BrowserWindow({
        width: 1000,
        height: 700,
        minWidth: 1000
    });
    win.loadFile('app/index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
});
