import * as path from 'path'
import * as fs from 'fs'

const SERVICE_NAME = 'TinyDB Studio'

// 密码存储文件路径
const PASSWORD_PATH = path.join(process.env.APPDATA || process.env.HOME || '/tmp', '.tinydb-studio-passwords.json')

export async function savePassword(account: string, password: string): Promise<boolean> {
  try {
    let passwords: Record<string, string> = {}
    
    if (fs.existsSync(PASSWORD_PATH)) {
      const data = fs.readFileSync(PASSWORD_PATH, 'utf8')
      passwords = JSON.parse(data)
    }
    
    passwords[`${SERVICE_NAME}:${account}`] = password
    fs.writeFileSync(PASSWORD_PATH, JSON.stringify(passwords, null, 2))
    return true
  } catch (error) {
    console.error('Save password error:', error)
    return false
  }
}

export async function getPassword(account: string): Promise<string | null> {
  try {
    if (fs.existsSync(PASSWORD_PATH)) {
      const data = fs.readFileSync(PASSWORD_PATH, 'utf8')
      const passwords: Record<string, string> = JSON.parse(data)
      return passwords[`${SERVICE_NAME}:${account}`] || null
    }
    return null
  } catch (error) {
    console.error('Get password error:', error)
    return null
  }
}

export async function deletePassword(account: string): Promise<boolean> {
  try {
    if (fs.existsSync(PASSWORD_PATH)) {
      const data = fs.readFileSync(PASSWORD_PATH, 'utf8')
      const passwords: Record<string, string> = JSON.parse(data)
      delete passwords[`${SERVICE_NAME}:${account}`]
      fs.writeFileSync(PASSWORD_PATH, JSON.stringify(passwords, null, 2))
    }
    return true
  } catch (error) {
    console.error('Delete password error:', error)
    return false
  }
}
