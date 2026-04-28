import React, { useState, useCallback, useRef } from 'react'
// import { ConnectionConfig } from '../types'

// 临时类型定义
type ConnectionConfig = any

interface ConnectionSelectorProps {
  connections: ConnectionConfig[]
  currentConnection: ConnectionConfig | null
  onConnect: (config: ConnectionConfig) => void
}

const ConnectionSelector: React.FC<ConnectionSelectorProps> = ({
  connections,
  currentConnection,
  onConnect
}) => {
  const [showModal, setShowModal] = useState(false)
  const [newConnection, setNewConnection] = useState<ConnectionConfig>({
    name: '',
    type: 'postgresql',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '',
    database: 'postgres',
    path: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleConnectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value
    const connection = connections.find(c => c.name === selectedName)
    if (connection) {
      onConnect(connection)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setNewConnection((prev: ConnectionConfig) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConnect(newConnection)
    setShowModal(false)
  }

  const handleSelectFile = useCallback(async () => {
    let useFallback = true
    
    // 优先尝试 Electron API
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.openFileDialog === 'function') {
      try {
        const filePath = await window.electronAPI.openFileDialog()
        if (filePath) {
          setNewConnection((prev: ConnectionConfig) => ({
            ...prev,
            path: filePath
          }))
          useFallback = false
        }
      } catch (error) {
        console.warn('Electron file dialog failed:', error)
      }
    }
    
    // 浏览器环境下使用 HTML5 file input
    if (useFallback && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }, [])

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const filePath = (file as any).path || file.name
      setNewConnection((prev: ConnectionConfig) => ({
        ...prev,
        path: filePath
      }))
    }
  }

  return (
    <div className="connection-selector">
      <select
        value={currentConnection?.name || ''}
        onChange={handleConnectionChange}
        className="connection-select"
      >
        <option value="">Select Connection</option>
        {connections.map(connection => (
          <option key={connection.name} value={connection.name}>
            {connection.name} ({connection.type})
          </option>
        ))}
      </select>
      <button 
        onClick={() => setShowModal(true)}
        className="add-connection-btn"
      >
        + Add
      </button>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Add Connection</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newConnection.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type:</label>
                <select
                  name="type"
                  value={newConnection.type}
                  onChange={handleInputChange}
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>
              {newConnection.type === 'postgresql' && (
                <>
                  <div className="form-group">
                    <label>Host:</label>
                    <input
                      type="text"
                      name="host"
                      value={newConnection.host}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Port:</label>
                    <input
                      type="number"
                      name="port"
                      value={newConnection.port}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Username:</label>
                    <input
                      type="text"
                      name="username"
                      value={newConnection.username}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Password:</label>
                    <input
                      type="password"
                      name="password"
                      value={newConnection.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Database:</label>
                    <input
                      type="text"
                      name="database"
                      value={newConnection.database}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </>
              )}
              {newConnection.type === 'sqlite' && (
                <div className="form-group">
                  <label>Path:</label>
                  <div className="path-input-wrapper">
                    <input
                      type="text"
                      name="path"
                      value={newConnection.path}
                      onChange={handleInputChange}
                      required
                    />
                    <button type="button" onClick={handleSelectFile} className="browse-btn">
                      Browse
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".db,.sqlite,.sqlite3"
                    onChange={handleFileInputChange}
                    className="hidden-file-input"
                  />
                </div>
              )}
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit">Connect</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConnectionSelector