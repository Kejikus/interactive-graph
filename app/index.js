var index =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./dev/js/index.jsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./dev/js/index.jsx":
/*!**************************!*\
  !*** ./dev/js/index.jsx ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\nvar _electron = __webpack_require__(/*! electron */ \"electron\");\n\nfunction clearGraph() {}\n\nfunction openFile() {}\n\nfunction saveAsIncidenceMatrix() {}\n\nfunction saveAsAdjacencyMatrix() {}\n\nfunction saveAsEdgesVertices() {}\n\n// Display dialog box with instructions how to use this program\nfunction displayHelp() {}\n\n// Display dialog box with info about authors\nfunction displayAuthors() {}\n\nfunction createWindow() {\n    var win = new _electron.BrowserWindow({\n        width: 1000,\n        height: 700,\n        minWidth: 1000\n    });\n    win.loadFile('app/index.html');\n    _electron.Menu.setApplicationMenu(new _electron.Menu.buildFromTemplate([{\n        label: \"File\",\n        type: \"submenu\",\n        submenu: [{\n            label: \"New graph\",\n            accelerator: \"CommandOrControl+N\",\n            click: clearGraph\n        }, {\n            label: \"Open...\",\n            accelerator: \"CommandOrControl+O\",\n            click: openFile\n        }, {\n            label: \"Save as\",\n            type: \"submenu\",\n            submenu: [{\n                label: \"Incidence matrix\",\n                click: saveAsIncidenceMatrix\n            }, {\n                label: \"Adjacency matrix\",\n                click: saveAsAdjacencyMatrix\n            }, {\n                label: \"Edges/Vertices format\",\n                accelerator: \"CommandOrControl+S\",\n                click: saveAsEdgesVertices\n            }]\n        }, {\n            label: \"Exit\",\n            click: function click() {\n                return _electron.app.quit();\n            }\n        }]\n    }, {\n        label: \"Theory of graph tasks\",\n        type: \"submenu\",\n        submenu: [{\n            label: \"To be added\",\n            enabled: false\n        }]\n    }, {\n        label: \"About\",\n        type: \"submenu\",\n        submenu: [{\n            label: \"Help\",\n            accelerator: \"F1\",\n            click: displayHelp\n        }, {\n            label: \"Authors\",\n            click: displayAuthors\n        }]\n    }]));\n}\n\n_electron.app.on('ready', createWindow);\n\n_electron.app.on('window-all-closed', function () {\n    _electron.app.quit();\n});\n\n//# sourceURL=webpack://%5Bname%5D/./dev/js/index.jsx?");

/***/ }),

/***/ "electron":
/*!***************************!*\
  !*** external "electron" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"electron\");\n\n//# sourceURL=webpack://%5Bname%5D/external_%22electron%22?");

/***/ })

/******/ });