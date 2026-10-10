import { useEffect } from 'react'

function AlertMessage({ alert, onClose }) {
  useEffect(() => {
    if (!alert) return undefined
    const timer = window.setTimeout(onClose, 4500)
    return () => window.clearTimeout(timer)
  }, [alert, onClose])

  if (!alert) return null
  const role = alert.type === 'danger' ? 'alert' : 'status'
  return <div className={`alert alert-${alert.type} alert-dismissible fade show`} role={role} aria-live="polite">
    {alert.message}
    <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={onClose} />
  </div>
}

export default AlertMessage
