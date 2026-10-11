import { useState } from 'react'

const today = new Date()
const minimumDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
const emptyForm = { sport: '', level: '', date: '', time: '', location: '', slots: '1' }

function CreateMatchModal({ onSubmit, onClose }) {
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.sport) nextErrors.sport = 'Selecciona un deporte.'
    if (!form.level) nextErrors.level = 'Selecciona un nivel.'
    if (!form.date || form.date < minimumDate) nextErrors.date = 'La fecha debe ser hoy o posterior.'
    if (!form.time) nextErrors.time = 'Indica la hora del partido.'
    if (form.location.trim().length < 3) nextErrors.location = 'Escribe una ubicación de al menos 3 caracteres.'
    const slots = Number(form.slots)
    if (!Number.isInteger(slots) || slots < 1 || slots > 20) nextErrors.slots = 'Indica entre 1 y 20 cupos.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSubmit({ ...form, location: form.location.trim(), slots })
  }

  return (
    <div className="modal-backdrop-custom" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="create-modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div><p className="eyebrow mb-1">Haz que ocurra</p><h2 className="h4 fw-bold mb-0" id="create-title">Crear partido</h2></div>
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3">
            <div className="col-12 col-sm-6"><label className="form-label" htmlFor="sport">Deporte</label><select id="sport" name="sport" className={`form-select ${errors.sport ? 'is-invalid' : ''}`} value={form.sport} onChange={updateField}><option value="">Selecciona un deporte</option><option>Fútbol</option><option>Básquetbol</option><option>Pádel</option></select>{errors.sport && <div className="invalid-feedback">{errors.sport}</div>}</div>
            <div className="col-12 col-sm-6"><label className="form-label" htmlFor="level">Nivel de juego</label><select id="level" name="level" className={`form-select ${errors.level ? 'is-invalid' : ''}`} value={form.level} onChange={updateField}><option value="">Selecciona un nivel</option><option>Amateur</option><option>Intermedio</option><option>Competitivo</option></select>{errors.level && <div className="invalid-feedback">{errors.level}</div>}</div>
            <div className="col-12 col-sm-6"><label className="form-label" htmlFor="date">Fecha</label><input id="date" name="date" type="date" min={minimumDate} className={`form-control ${errors.date ? 'is-invalid' : ''}`} value={form.date} onChange={updateField} />{errors.date && <div className="invalid-feedback">{errors.date}</div>}</div>
            <div className="col-12 col-sm-6"><label className="form-label" htmlFor="time">Hora</label><input id="time" name="time" type="time" className={`form-control ${errors.time ? 'is-invalid' : ''}`} value={form.time} onChange={updateField} />{errors.time && <div className="invalid-feedback">{errors.time}</div>}</div>
            <div className="col-12"><label className="form-label" htmlFor="location">Ubicación</label><input id="location" name="location" type="text" minLength="3" className={`form-control ${errors.location ? 'is-invalid' : ''}`} placeholder="Ej: Complejo Deportivo Norte" value={form.location} onChange={updateField} />{errors.location && <div className="invalid-feedback">{errors.location}</div>}</div>
            <div className="col-12"><label className="form-label" htmlFor="slots">Cupos faltantes</label><input id="slots" name="slots" type="number" min="1" max="20" step="1" className={`form-control ${errors.slots ? 'is-invalid' : ''}`} value={form.slots} onChange={updateField} />{errors.slots && <div className="invalid-feedback">{errors.slots}</div>}</div>
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4"><button type="button" className="btn btn-light rounded-pill px-3" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary rounded-pill px-3">Publicar partido</button></div>
        </form>
      </section>
    </div>
  )
}

export default CreateMatchModal
