import { Pool } from 'pg'
import Database from 'better-sqlite3'

let postgresPool: Pool | null = null
let sqliteDb: Database | null = null
let currentConnection: any = null

export async function connectDatabase(config: any) {
  try {
    if (config.type === 'postgresql') {
      postgresPool = new Pool({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database
      })
      await postgresPool.connect()
    } else if (config.type === 'sqlite') {
      sqliteDb = new Database(config.path)
    }
    currentConnection = config
    return true
  } catch (error) {
    console.error('Connection error:', error)
    return false
  }
}

export async function executeQuery(query: string): Promise<any> {
  try {
    if (currentConnection?.type === 'postgresql' && postgresPool) {
      const result = await postgresPool.query(query)
      return result.rows
    } else if (currentConnection?.type === 'sqlite' && sqliteDb) {
      const result = sqliteDb.prepare(query).all()
      return result
    }
    throw new Error('No database connection')
  } catch (error) {
    console.error('Query execution error:', error)
    throw error
  }
}

export async function getTables(): Promise<string[]> {
  try {
    if (currentConnection?.type === 'postgresql' && postgresPool) {
      const result = await postgresPool.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      )
      return result.rows.map((row: any) => row.table_name)
    } else if (currentConnection?.type === 'sqlite' && sqliteDb) {
      const result = sqliteDb.prepare(
        "SELECT name FROM sqlite_master WHERE type='table'"
      ).all()
      return result.map((row: any) => row.name)
    }
    return []
  } catch (error) {
    console.error('Get tables error:', error)
    return []
  }
}

export function getCurrentConnection() {
  return currentConnection
}

export function closeConnection() {
  if (postgresPool) {
    postgresPool.end()
    postgresPool = null
  }
  if (sqliteDb) {
    sqliteDb.close()
    sqliteDb = null
  }
  currentConnection = null
}