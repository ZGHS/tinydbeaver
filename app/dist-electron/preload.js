let electron = require("electron");
//#region electron/preload.ts
electron.contextBridge.exposeInMainWorld("electronAPI", {
	executeQuery: (query) => electron.ipcRenderer.invoke("execute-query", query),
	getTables: () => electron.ipcRenderer.invoke("get-tables"),
	connectDatabase: (config) => electron.ipcRenderer.invoke("connect-database", config),
	getConnections: () => electron.ipcRenderer.invoke("get-connections"),
	savePassword: (service, account, password) => electron.ipcRenderer.invoke("save-password", service, account, password),
	getPassword: (service, account) => electron.ipcRenderer.invoke("get-password", service, account),
	exportCsv: (data, filename) => electron.ipcRenderer.invoke("export-csv", data, filename),
	openFileDialog: () => electron.ipcRenderer.invoke("open-file-dialog")
});
//#endregion
