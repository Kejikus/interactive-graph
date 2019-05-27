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
					label: 'BreadthFirstSearch',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.BreadthFirstSearch),
				},
				{
					label: 'Dijkstra',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.Dijkstra),
				},
				{
					label: 'WeightRadiusDiameterPower',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.WeightRadiusDiameterPower),
				},
				{
					label: 'ColoringGraph',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.ColoringGraph),
				},
				{
					label: 'GraphConnectivity',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.GraphConnectivity),
				},
				{
					label: 'GraphAddition',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.GraphAddition),
				},
				{
					label: 'MinimumSpanningTree',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.MinimumSpanningTree),
				},
				{
					label: 'BestFirstSearch',
					click: () => ipcSend("execute-algorithm", TaskTypeEnum.BestFirstSearch),
				},
				// {
				// 	label: 'Are two graphs isomorphic',
				// 	click: () => ipcSend("execute-algorithm", TaskTypeEnum.GraphIsomorphism),
				// },
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
