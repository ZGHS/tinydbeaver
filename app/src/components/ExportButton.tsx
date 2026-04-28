import React from 'react'

interface ExportButtonProps {
  onExport: () => void
  disabled: boolean
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  disabled
}) => {
  return (
    <button
      onClick={onExport}
      disabled={disabled}
      className="export-btn"
    >
      Export CSV
    </button>
  )
}

export default ExportButton