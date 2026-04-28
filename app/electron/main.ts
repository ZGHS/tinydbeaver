import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { connectDatabase, executeQuery, getTables } from './utils/database'
import { savePassword, getPassword } from './utils/password'

const CONFIG_PATH = path.join(app.getPath('userData'), 'connections.json')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

// 保存连接配置
function saveConnections(connections: any[]) {
  try {
    const dir = path.dirname(CONFIG_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(connections, null, 2))
  } catch (error) {
    console.error('Save connections error:', error)
  }
}

// 读取连接配置
function getConnections() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, 'utf8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Get connections error:', error)
  }
  return []
}

// IPC 处理程序
ipcMain.handle('execute-query', async (_, query) => {
  return await executeQuery(query)
})

ipcMain.handle('get-tables', async () => {
  return await getTables()
})

ipcMain.handle('connect-database', async (_, config) => {
  const success = await connectDatabase(config)
  if (success) {
    const connections = getConnections()
    const existingIndex = connections.findIndex(c => c.name === config.name)
    if (existingIndex >= 0) {
      connections[existingIndex] = config
    } else {
      connections.push(config)
    }
    saveConnections(connections)
  }
  return success
})

ipcMain.handle('get-connections', () => {
  return getConnections()
})

ipcMain.handle('save-password', async (_, service, account, password) => {
  return await savePassword(`${service}:${account}`, password)
})

ipcMain.handle('get-password', async (_, service, account) => {
  return await getPassword(`${service}:${account}`)
})

ipcMain.handle('export-csv', async (_, data, filename) => {
  let csvContent: string
  
  try {
    csvContent = convertToCsv(data)
  } catch (convertError) {
    console.error('Failed to convert data to CSV:', convertError)
    return { success: false, error: 'Failed to convert data to CSV' }
  }
  
  try {
    // 使用系统对话框让用户选择保存位置
    const result = await dialog.showSaveDialog({
      defaultPath: path.join(app.getPath('downloads'), filename),
      filters: [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (result.canceled || !result.filePath) {
      console.log('Export CSV canceled by user')
      return false
    }
    
    console.log('Exporting CSV to:', result.filePath)
    
    // 尝试使用异步写入
    await fs.promises.writeFile(result.filePath, csvContent)
    console.log('CSV exported successfully')
    return { success: true, filePath: result.filePath }
  } catch (error) {
    console.error('Export CSV error:', error)
    
    // 如果写入失败，尝试写入应用数据目录作为后备方案
    try {
      const fallbackPath = path.join(app.getPath('userData'), filename)
      console.log('Falling back to:', fallbackPath)
      await fs.promises.writeFile(fallbackPath, csvContent)
      console.log('CSV exported successfully to fallback location')
      return { success: true, filePath: fallbackPath, fallback: true }
    } catch (fallbackError) {
      console.error('Fallback export also failed:', fallbackError)
      return { success: false, error: (error as Error).message }
    }
  }
})

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'SQLite Database', extensions: ['db', 'sqlite', 'sqlite3'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })
  
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

// 转换数据为CSV格式
function convertToCsv(data: any[]): string {
  if (data.length === 0) return ''
  
  const headers = Object.keys(data[0])
  const csvHeaders = headers.join(',')
  
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header]
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  })
  
  return [csvHeaders, ...csvRows].join('\n')
}

app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})