/*
	Contains window main (upper) menu definition
*/

import {app, Menu} from "electron";
import {TaskTypeEnum} from "../const/enums";
import osDlg from './openSaveDialogs';
import helpDlg from './helpDialogs';
import {win} from "../index";

function ipcSend(msgType, obj) {
    win.webContents.send(msgType, obj);
}

function clearGraph() {
    ipcSend("clear-graph", {});
}

export default {
	menu: Menu.buildFromTemplate([
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
					click: osDlg.openFile
				},
				{
					label: "Save as",
					type: "submenu",
					submenu: [
						{
							label: "Incidence matrix",
							click: osDlg.saveAsIncidenceMatrix
						},
						{
							label: "Adjacency matrix",
							click: osDlg.saveAsAdjacencyMatrix
						},
						{
							label: "Edges/Vertices format",
							accelerator: "CommandOrControl+S",
							click: osDlg.saveAsEdgesVertices
						},
						{
							label: "PNG Image",
							click: osDlg.saveAsImage
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
					label: 'Breadth First Search',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.BreadthFirstSearch),
				},
				{
					label: 'Dijkstra algorithm',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.Dijkstra),
				},
				{
					label: 'Weight, Radius, Diameter, Power',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.WeightRadiusDiameterPower),
				},
				{
					label: 'Graph Connectivity',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.GraphConnectivity),
				},
				{
					label: 'Add graph to full',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.GraphAddition),
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
					click: helpDlg.displayHelp
				},
				{
					label: "File format info",
					click: helpDlg.displayFileInfo
				},
				{
					label: "Authors",
					click: helpDlg.displayAuthors
				}
			]
		},
	])
};
