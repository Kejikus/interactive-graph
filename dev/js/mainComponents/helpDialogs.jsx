/*
	Contains functions to display help messages
	Currently contains dialogs for:
		Help
		File format info
		Authors
*/

import {dialog} from "electron";
import helpTxt from "../../text/help.txt";
import fileInfoTxt from "../../text/file_info.txt";
import authorsTxt from "../../text/authors.txt";

export default {
	displayHelp() {
		// Display dialog box with instructions how to use this program
	    dialog.showMessageBox({
	        type: "none",
	        buttons: ["Close"],
	        title: "How to use this application",
	        message: helpTxt
	    }, () => {});
	},
	displayFileInfo() {
	    dialog.showMessageBox({
	        type: "none",
	        buttons: ["Close"],
	        title: "File format info",
	        message: fileInfoTxt
	    }, () => {});
	},
	displayAuthors() {
		// Display dialog box with info about authors
		dialog.showMessageBox({
	        type: "none",
	        buttons: ["Close"],
	        title: "Authors",
	        message: authorsTxt
	    }, () => {});
	}
}
