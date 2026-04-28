import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // 数据库操作
  executeQuery: (query: string) => ipcRenderer.invoke('execute-query', query),
  getTables: () => ipcRenderer.invoke('get-tables'),
  
  // 连接管理
  connectDatabase: (config: any) => ipcRenderer.invoke('connect-database', config),
  getConnections: () => ipcRenderer.invoke('get-connections'),
  
  // 密码管理
  savePassword: (service: string, account: string, password: string) => 
    ipcRenderer.invoke('save-password', service, account, password),
  getPassword: (service: string, account: string) => 
    ipcRenderer.invoke('get-password', service, account),
  
  // 导出功能
  exportCsv: (data: any[], filename: string) => 
    ipcRenderer.invoke('export-csv', data, filename),
  
  // 文件选择器
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog')
})

type ElectronAPI = {
  executeQuery: (query: string) => Promise<any>
  getTables: () => Promise<string[]>
  connectDatabase: (config: any) => Promise<boolean>
  getConnections: () => Promise<any[]>
  savePassword: (service: string, account: string, password: string) => Promise<boolean>
  getPassword: (service: string, account: string) => Promise<string | null>
  exportCsv: (data: any[], filename: string) => Promise<boolean>
  openFileDialog: () => Promise<string | null>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}