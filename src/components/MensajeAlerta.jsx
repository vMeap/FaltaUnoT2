import { useEffect } from 'react'

function MensajeAlerta({ alert: alerta, onClose: alCerrar }) {
  useEffect(() => {
    if (!alerta) return undefined
    const temporizador = window.setTimeout(alCerrar, 4500)
    return () => window.clearTimeout(temporizador)
  }, [alerta, alCerrar])

  if (!alerta) return null
  const rol = alerta.type === 'danger' ? 'alert' : 'status'
  return <div className={`alert alert-${alerta.type} alert-dismissible fade show`} role={rol} aria-live="polite">
    {alerta.message}
    <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={alCerrar} />
  </div>
}

export default MensajeAlerta
