import {app, BrowserWindow, Menu, dialog, ipcMain} from "electron";

import mainMenu from './mainComponents/mainMenu';

// function ipcSend(msgType, obj) {
//     win.webContents.send(msgType, obj);
// }

ipcMain.on('show-message-box', (sender, title, msg) => {
	dialog.showMessageBox({
        type: "none",
        buttons: ["Close"],
        title: title,
        message: msg
    }, () => {});
});

export let win;

function createWindow() {
	win = new BrowserWindow({
		show: false,
		width: 1000,
		height: 700,
		minWidth: 1000,
		minHeight: 700,
		webPreferences: {
			nodeIntegration: true
		}
	});

	Menu.setApplicationMenu(mainMenu.menu);
	win.loadFile('app/index.html');

	win.once('ready-to-show', () => {
		win.show();
	});

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

// process.env.ELECTRON_ENABLE_LOGGING = true;

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    app.quit();
});
