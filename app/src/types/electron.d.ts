declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

type ElectronAPI = {
  executeQuery: (query: string) => Promise<any>
  getTables: () => Promise<string[]>
  connectDatabase: (config: any) => Promise<boolean>
  getConnections: () => Promise<any[]>
  savePassword: (service: string, account: string, password: string) => Promise<boolean>
  getPassword: (service: string, account: string) => Promise<string | null>
  exportCsv: (data: any[], filename: string) => Promise<{ success: boolean; filePath?: string; fallback?: boolean; error?: string } | false>
  openFileDialog: () => Promise<string | null>
}

export {}
