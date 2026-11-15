import { useState } from 'react'
import { fechaPartido, esFechaPartidoValida } from '../../shared/fechas.js'
import { buscarSede, sedesPorDeporte } from '../../shared/sedes.js'

const formularioVacio = { sport: '', level: '', date: '', time: '', location: '', slots: '1' }

function FormularioPartido({ editingMatch: partidoEnEdicion, onSubmit: alEnviar, onClose: alCerrar, errorMessage: mensajeError }) {
  const fechaMinima = fechaPartido()
  const fechaMaxima = fechaPartido(14)
  const [formulario, establecerFormulario] = useState(() =>
    partidoEnEdicion
      ? {
          sport: partidoEnEdicion.sport,
          level: partidoEnEdicion.level,
          date: partidoEnEdicion.date,
          time: partidoEnEdicion.time,
          location: buscarSede(partidoEnEdicion.sport, partidoEnEdicion.location) ? partidoEnEdicion.location : '',
          slots: String(partidoEnEdicion.slots)
        }
      : formularioVacio
  )
  const [errores, establecerErrores] = useState({})
  const sedesDisponibles = sedesPorDeporte(formulario.sport)

  function actualizarCampo(evento) {
    const { name: nombre, value: valor } = evento.target
    establecerFormulario((actual) => ({ ...actual, [nombre]: valor, ...(nombre === 'sport' ? { location: '' } : {}) }))
    establecerErrores((actual) => ({ ...actual, [nombre]: '', ...(nombre === 'sport' ? { location: '' } : {}) }))
  }

  function enviarFormulario(evento) {
    evento.preventDefault()
    const nuevosErrores = {}
    if (!formulario.sport) nuevosErrores.sport = 'Selecciona un deporte.'
    if (!formulario.level) nuevosErrores.level = 'Selecciona un nivel.'
    if (!esFechaPartidoValida(formulario.date)) nuevosErrores.date = 'La fecha debe estar entre hoy y los próximos 14 días.'
    if (!formulario.time) nuevosErrores.time = 'Indica la hora del partido.'
    if (!buscarSede(formulario.sport, formulario.location)) nuevosErrores.location = 'Selecciona una cancha disponible para el deporte elegido.'
    const cupos = Number(formulario.slots)
    if (!Number.isInteger(cupos) || cupos < 0 || cupos > 20) nuevosErrores.slots = 'Indica entre 0 y 20 cupos.'
    establecerErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) return
    alEnviar({ ...formulario, slots: cupos })
  }

  return (
    <div className="modal-backdrop-custom" role="presentation" onMouseDown={(evento) => { if (evento.target === evento.currentTarget) alCerrar() }}>
      <section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <p className="eyebrow mb-1">Haz que ocurra</p>
            <h2 className="h4 fw-bold mb-0" id="create-title">
              {partidoEnEdicion ? 'Editar partido' : 'Crear partido'}
            </h2>
          </div>
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={alCerrar} />
        </div>
        {mensajeError && <p className="alert alert-danger" role="alert">{mensajeError}</p>}
        <form onSubmit={enviarFormulario} noValidate>
          <div className="row g-3">
            <div className="col-12 col-sm-6"><label className="form-label" htmlFor="sport">Deporte</label><select id="sport" name="sport" className={`form-select ${errores.sport ? 'is-invalid' : ''}`} value={formulario.sport} onChange={actualizarCampo}><option value="">Selecciona un deporte</option><option>Fútbol</option><option>Básquetbol</option><option>Pádel</option></select>{errores.sport && <div className="invalid-feedback">{errores.sport}</div>}</div>
            <div className="col-12 col-sm-6"><label className="form-label" htmlFor="level">Nivel de juego</label><select id="level" name="level" className={`form-select ${errores.level ? 'is-invalid' : ''}`} value={formulario.level} onChange={actualizarCampo}><option value="">Selecciona un nivel</option><option>Amateur</option><option>Intermedio</option><option>Competitivo</option></select>{errores.level && <div className="invalid-feedback">{errores.level}</div>}</div>
            <div className="col-12 col-sm-6"><label className="form-label" htmlFor="date">Fecha</label><input id="date" name="date" type="date" min={fechaMinima} max={fechaMaxima} className={`form-control ${errores.date ? 'is-invalid' : ''}`} value={formulario.date} onChange={actualizarCampo} />{errores.date && <div className="invalid-feedback">{errores.date}</div>}</div>
            <div className="col-12 col-sm-6"><label className="form-label" htmlFor="time">Hora</label><input id="time" name="time" type="time" className={`form-control ${errores.time ? 'is-invalid' : ''}`} value={formulario.time} onChange={actualizarCampo} />{errores.time && <div className="invalid-feedback">{errores.time}</div>}</div>
            <div className="col-12">
              <label className="form-label" htmlFor="location">Cancha o sede</label>
              <select id="location" name="location" className={`form-select ${errores.location ? 'is-invalid' : ''}`} value={formulario.location} onChange={actualizarCampo} disabled={!formulario.sport} aria-describedby="location-help" aria-invalid={Boolean(errores.location)}>
                <option value="">{formulario.sport ? 'Selecciona una cancha' : 'Primero selecciona un deporte'}</option>
                {sedesDisponibles.map((sede) => <option key={sede.name} value={sede.name}>{sede.name}</option>)}
              </select>
              {errores.location && <div className="invalid-feedback" role="alert">{errores.location}</div>}
              <div id="location-help" className="form-text">Las sedes se muestran según el deporte elegido.</div>
            </div>
            <div className="col-12"><label className="form-label" htmlFor="slots">Cupos faltantes</label><input id="slots" name="slots" type="number" min="0" max="20" step="1" className={`form-control ${errores.slots ? 'is-invalid' : ''}`} value={formulario.slots} onChange={actualizarCampo} />{errores.slots && <div className="invalid-feedback">{errores.slots}</div>}</div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-light rounded-pill px-3" onClick={alCerrar}>Cancelar</button>
            <button type="submit" className="btn btn-primary rounded-pill px-3">
              {partidoEnEdicion ? 'Guardar cambios' : 'Publicar partido'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default FormularioPartido
