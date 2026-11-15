import { useEffect, useMemo, useState } from 'react'
import partidosIniciales from '../shared/partidosIniciales.js'
import { esFechaPartidoValida } from '../shared/fechas.js'
import MensajeAlerta from './components/MensajeAlerta.jsx'
import FormularioPartido from './components/FormularioPartido.jsx'
import PanelMisPartidos from './components/PanelMisPartidos.jsx'
import BarraNavegacion from './components/BarraNavegacion.jsx'
import Presentacion from './components/Presentacion.jsx'
import PieDePagina from './components/PieDePagina.jsx'
import ListaPartidos from './components/ListaPartidos.jsx'
import BuscadorPartidos from './components/BuscadorPartidos.jsx'
import FiltroDeportes from './components/FiltroDeportes.jsx'
import Acceso from './components/Acceso.jsx'
import ModalActividad from './components/ModalActividad.jsx'
import {
  consultarPartidos,
  crearPartidoApi,
  actualizarPartidoApi,
  eliminarPartidoApi,
  consultarMisInscripciones,
  inscribirseEnPartidoApi,
  cancelarInscripcionPartidoApi,
  obtenerAlmacenamiento,
  cerrarSesionUsuario
} from './services/api.js'
import './styles.css'

const CLAVE_PARTIDOS = 'faltauno.matches.v1'
const CLAVE_MIS_PARTIDOS = 'faltauno.myMatches.v1'
const CLAVE_USUARIO = 'faltauno.user.v1'
const CLAVE_ALMACENAMIENTO = 'faltauno.storage.v1'

function leerListaGuardada(clave, respaldo) {
  try {
    const guardado = localStorage.getItem(clave)

    if (!guardado) return respaldo

    const interpretado = JSON.parse(guardado)

    return Array.isArray(interpretado) ? interpretado : respaldo
  } catch {
    return respaldo
  }
}

function leerUsuarioGuardado(clave) {
  try {
    const guardado =
      localStorage.getItem(clave) || sessionStorage.getItem(clave)

    if (!guardado) return null

    const interpretado = JSON.parse(guardado)

    if (
      interpretado &&
      typeof interpretado === 'object' &&
      typeof interpretado.id === 'string' &&
      typeof interpretado.token === 'string' &&
      typeof interpretado.name === 'string' &&
      typeof interpretado.email === 'string'
    ) {
      return interpretado
    }

    return null
  } catch {
    return null
  }
}

function Aplicacion() {
  const [almacenamiento, establecerAlmacenamiento] = useState(obtenerAlmacenamiento)
  const [usuario, establecerUsuario] = useState(() => leerUsuarioGuardado(CLAVE_USUARIO))

  const [partidos, establecerPartidos] = useState(() =>
    leerListaGuardada(`${CLAVE_PARTIDOS}.${almacenamiento}`, almacenamiento === 'memory' ? partidosIniciales : []).filter((partido) => esFechaPartidoValida(partido.date))
  )

  const [idsMisPartidos, establecerIdsMisPartidos] = useState(() =>
    usuario ? leerListaGuardada(`${CLAVE_MIS_PARTIDOS}.${almacenamiento}.${usuario.id}`, []) : []
  )
  const [cargandoInscripciones, establecerCargandoInscripciones] = useState(true)

  const [mostrarFormularioPartido, establecerMostrarFormularioPartido] = useState(false)
  const [partidoEnEdicion, establecerPartidoEnEdicion] = useState(null)
  const [mostrarActividad, establecerMostrarActividad] = useState(false)
  const [alerta, establecerAlerta] = useState(null)
  const [filtroDeporte, establecerFiltroDeporte] = useState('Todos')
  const [busqueda, establecerBusqueda] = useState('')

  useEffect(() => {
    if (!usuario) return
    let activo = true

    Promise.all([consultarPartidos(almacenamiento), consultarMisInscripciones(usuario.id, almacenamiento)])
      .then(([lista, identificadores]) => {
        if (!activo) return
        establecerPartidos(lista)
        establecerIdsMisPartidos(identificadores.filter((identificador) => lista.some((partido) => partido.id === identificador)))
      })
      .catch((error) => {
        if (activo) mostrarError(error)
      })
      .finally(() => {
        if (activo) establecerCargandoInscripciones(false)
      })

    return () => { activo = false }
  }, [usuario, almacenamiento])

  useEffect(() => {
    if (usuario && !cargandoInscripciones) {
      localStorage.setItem(`${CLAVE_PARTIDOS}.${almacenamiento}`, JSON.stringify(partidos))
      localStorage.setItem(`${CLAVE_MIS_PARTIDOS}.${almacenamiento}.${usuario.id}`, JSON.stringify(idsMisPartidos))
    }
  }, [partidos, idsMisPartidos, almacenamiento, usuario, cargandoInscripciones])

  const partidosVisibles = useMemo(() => {
    const consulta = busqueda.trim().toLocaleLowerCase('es')

    return partidos.filter((partido) => {
      const coincideDeporte =
        filtroDeporte === 'Todos' || partido.sport === filtroDeporte

      const texto =
        `${partido.sport} ${partido.location} ${partido.level}`.toLocaleLowerCase('es')

      return coincideDeporte && texto.includes(consulta)
    })
  }, [partidos, filtroDeporte, busqueda])

  const totalPartidosConCupos = partidos.filter((partidoActual) => partidoActual.slots > 0).length
  const totalCuposDisponibles = partidos.reduce((suma, partidoActual) => suma + Number(partidoActual.slots || 0), 0)
  const esAdministrador = usuario?.role === 'admin'
  const nombreAlmacenamiento = almacenamiento === 'memory' ? 'Memoria' : almacenamiento === 'mysql' ? 'MySQL' : 'MongoDB'

  function esVistaActual() {
    return obtenerAlmacenamiento() === almacenamiento && leerUsuarioGuardado(CLAVE_USUARIO)?.token === usuario?.token
  }

  function mostrarError(error) {
    if (error.status === 401) {
      manejarCierreSesion()
      return
    }
    establecerAlerta({ type: 'danger', message: error.message })
  }

  function cambiarAlmacenamiento(siguienteAlmacenamiento) {
    if (siguienteAlmacenamiento === almacenamiento) return
    localStorage.setItem(CLAVE_ALMACENAMIENTO, siguienteAlmacenamiento)
    establecerCargandoInscripciones(true)
    establecerPartidos(leerListaGuardada(`${CLAVE_PARTIDOS}.${siguienteAlmacenamiento}`, siguienteAlmacenamiento === 'memory' ? partidosIniciales : []).filter((partido) => esFechaPartidoValida(partido.date)))
    establecerIdsMisPartidos(leerListaGuardada(`${CLAVE_MIS_PARTIDOS}.${siguienteAlmacenamiento}.${usuario.id}`, []))
    establecerMostrarFormularioPartido(false)
    establecerPartidoEnEdicion(null)
    establecerMostrarActividad(false)
    establecerAlerta(null)
    establecerAlmacenamiento(siguienteAlmacenamiento)
  }

  function guardarSesion(usuarioSesion, recordarSesion = true) {
    const datosSesion = JSON.stringify({
      id: usuarioSesion.id,
      name: usuarioSesion.name,
      email: usuarioSesion.email,
      role: usuarioSesion.role,
      token: usuarioSesion.token
    })

    if (recordarSesion) {
      localStorage.setItem(CLAVE_USUARIO, datosSesion)
      sessionStorage.removeItem(CLAVE_USUARIO)
    } else {
      sessionStorage.setItem(CLAVE_USUARIO, datosSesion)
      localStorage.removeItem(CLAVE_USUARIO)
    }
  }

  function manejarInicioSesion(usuarioEncontrado, recordarSesion = true) {
    const usuarioSesion = {
      id: usuarioEncontrado.id,
      name: usuarioEncontrado.name,
      email: usuarioEncontrado.email,
      role: usuarioEncontrado.role,
      token: usuarioEncontrado.token
    }

    guardarSesion(usuarioSesion, recordarSesion)
    establecerPartidos(leerListaGuardada(`${CLAVE_PARTIDOS}.${almacenamiento}`, almacenamiento === 'memory' ? partidosIniciales : []).filter((partido) => esFechaPartidoValida(partido.date)))
    establecerIdsMisPartidos(leerListaGuardada(`${CLAVE_MIS_PARTIDOS}.${almacenamiento}.${usuarioSesion.id}`, []))
    establecerCargandoInscripciones(true)
    establecerUsuario(usuarioSesion)
    establecerAlerta({
      type: 'success',
      message: `¡Bienvenido de vuelta, ${usuarioEncontrado.name}!`
    })
  }

  function manejarRegistro(nuevoUsuario, recordarSesion = true) {
    manejarInicioSesion(nuevoUsuario, recordarSesion)
    establecerAlerta({
      type: 'success',
      message: `¡Cuenta creada con éxito! Bienvenido a FaltaUno, ${nuevoUsuario.name}.`
    })
  }

  function manejarCierreSesion() {
    cerrarSesionUsuario().catch(() => {})
    localStorage.removeItem(CLAVE_USUARIO)
    sessionStorage.removeItem(CLAVE_USUARIO)
    establecerUsuario(null)
    establecerIdsMisPartidos([])
    establecerCargandoInscripciones(true)
    establecerMostrarFormularioPartido(false)
    establecerPartidoEnEdicion(null)
    establecerMostrarActividad(false)
    establecerAlerta(null)
  }

  async function inscribirseEnPartido(identificador) {
    const partido = partidos.find((elemento) => elemento.id === identificador)

    if (!usuario || cargandoInscripciones || !partido || partido.slots <= 0 || idsMisPartidos.includes(identificador)) return

    try {
      const { slots: cupos } = await inscribirseEnPartidoApi(identificador, usuario.id, usuario.email, almacenamiento)
      if (!esVistaActual()) return

      establecerPartidos((actual) =>
        actual.map((elemento) => elemento.id === identificador ? { ...elemento, slots: cupos } : elemento)
      )
      establecerIdsMisPartidos((actual) => actual.includes(identificador) ? actual : [...actual, identificador])

      establecerAlerta({
        type: 'success',
        message: `Te inscribiste en ${partido.sport} en ${partido.location}.`
      })
    } catch (error) {
      if (esVistaActual()) mostrarError(error)
    }
  }

  async function cancelarInscripcion(identificador) {
    const partido = partidos.find((elemento) => elemento.id === identificador)

    if (!usuario || cargandoInscripciones || !partido || !idsMisPartidos.includes(identificador)) return

    try {
      const { slots: cupos } = await cancelarInscripcionPartidoApi(identificador, usuario.id, usuario.email, almacenamiento)
      if (!esVistaActual()) return

      establecerPartidos((actual) =>
        actual.map((elemento) => elemento.id === identificador ? { ...elemento, slots: cupos } : elemento)
      )
      establecerIdsMisPartidos((actual) => actual.filter((idPartido) => idPartido !== identificador))

      establecerAlerta({
        type: 'warning',
        message: 'Cancelaste tu inscripción. El cupo quedó disponible.'
      })
    } catch (error) {
      if (esVistaActual()) mostrarError(error)
    }
  }

  async function guardarPartido(valores) {
    if (!esAdministrador || cargandoInscripciones) return
    if (partidoEnEdicion) {
      try {
        const actualizado = await actualizarPartidoApi(partidoEnEdicion.id, {
          ...valores,
          userEmail: usuario.email
        }, almacenamiento)
        if (!esVistaActual()) return
        establecerPartidos((actual) =>
          actual.map((elemento) => (elemento.id === partidoEnEdicion.id ? actualizado : elemento))
        )
      } catch (error) {
        if (esVistaActual()) mostrarError(error)
        return
      }

      establecerPartidoEnEdicion(null)
      establecerMostrarFormularioPartido(false)
      establecerAlerta({
        type: 'success',
        message: 'Partido actualizado correctamente.'
      })
      return
    }

    try {
      const creado = await crearPartidoApi({
        ...valores,
        organizerId: usuario.id,
        userEmail: usuario.email
      }, almacenamiento)
      if (!esVistaActual()) return
      establecerPartidos((actual) => [creado, ...actual])
    } catch (error) {
      if (esVistaActual()) mostrarError(error)
      return
    }

    establecerMostrarFormularioPartido(false)
    establecerAlerta({
      type: 'success',
      message: 'Partido publicado. Ya aparece en la lista.'
    })
  }

  function abrirEdicion(partido) {
    if (!esAdministrador || cargandoInscripciones) return
    establecerAlerta(null)
    establecerPartidoEnEdicion(partido)
    establecerMostrarFormularioPartido(true)
  }

  async function manejarEliminarPartido(identificador) {
    if (!esAdministrador || cargandoInscripciones) return
    try {
      await eliminarPartidoApi(identificador, almacenamiento)
      if (!esVistaActual()) return
    } catch (error) {
      if (esVistaActual()) mostrarError(error)
      return
    }

    establecerPartidos((actual) => actual.filter((elemento) => elemento.id !== identificador))
    establecerIdsMisPartidos((actual) => actual.filter((idPartido) => idPartido !== identificador))
    establecerAlerta({
      type: 'warning',
      message: 'El partido fue eliminado de la lista.'
    })
  }

  if (!usuario) {
    return (
      <Acceso
        onLogin={manejarInicioSesion}
        onRegister={manejarRegistro}
      />
    )
  }

  return (
    <div className="app-page min-vh-100 d-flex flex-column">
      <BarraNavegacion
        user={usuario}
        storage={almacenamiento}
        onStorageChange={cambiarAlmacenamiento}
        myMatchesCount={idsMisPartidos.length}
        onCreateMatch={() => {
          if (!esAdministrador || cargandoInscripciones) return
          establecerAlerta(null)
          establecerPartidoEnEdicion(null)
          establecerMostrarFormularioPartido(true)
        }}
        onOpenProfile={() => establecerMostrarActividad(true)}
        onLogout={manejarCierreSesion}
      />

      <main id="inicio" className="container py-4 py-lg-5 flex-grow-1">
        <Presentacion />
        <p className="small text-secondary" role="status">{cargandoInscripciones ? 'Cargando partidos e inscripciones...' : `Mostrando partidos e inscripciones de ${nombreAlmacenamiento}.`}</p>

        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-4">
            <div className="card match-card p-3 text-center">
              <span className="small text-secondary">Partidos publicados</span>
              <strong className="h4 fw-bold text-success mb-0">{partidos.length}</strong>
            </div>
          </div>
          <div className="col-12 col-sm-4">
            <div className="card match-card p-3 text-center">
              <span className="small text-secondary">Partidos con cupos</span>
              <strong className="h4 fw-bold text-success mb-0">{totalPartidosConCupos}</strong>
            </div>
          </div>
          <div className="col-12 col-sm-4">
            <div className="card match-card p-3 text-center">
              <span className="small text-secondary">Cupos disponibles</span>
              <strong className="h4 fw-bold text-success mb-0">{totalCuposDisponibles}</strong>
            </div>
          </div>
        </div>

        <MensajeAlerta
          alert={alerta}
          onClose={() => establecerAlerta(null)}
        />

        <div className="row g-4" id="partidos">
          <section
            className="col-12 col-lg-8"
            aria-labelledby="matches-title"
          >
            <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-3">
              <div>
                <p className="eyebrow mb-1">
                  Encuentra tu próximo partido
                </p>

                <h2 className="h3 fw-bold" id="matches-title">
                  Partidos disponibles
                </h2>
              </div>

              <BuscadorPartidos
                search={busqueda}
                onSearchChange={establecerBusqueda}
              />
            </div>

            <FiltroDeportes
              sportFilter={filtroDeporte}
              onFilterChange={establecerFiltroDeporte}
            />
            <ListaPartidos
              matches={partidosVisibles}
              myMatchIds={idsMisPartidos}
              isAdmin={esAdministrador}
              loading={cargandoInscripciones}
              onJoin={inscribirseEnPartido}
              onCancel={cancelarInscripcion}
              onEdit={abrirEdicion}
              onDelete={manejarEliminarPartido}
            />
          </section>

          <aside className="col-12 col-lg-4" id="mis-partidos">
            <PanelMisPartidos
              matches={partidos}
              myMatchIds={idsMisPartidos}
              onCancel={cancelarInscripcion}
              loading={cargandoInscripciones}
            />
          </aside>
        </div>
      </main>

      <PieDePagina />

      {mostrarFormularioPartido && (
        <FormularioPartido
          editingMatch={partidoEnEdicion}
          onSubmit={guardarPartido}
          errorMessage={alerta?.type === 'danger' ? alerta.message : ''}
          onClose={() => {
            establecerPartidoEnEdicion(null)
            establecerMostrarFormularioPartido(false)
          }}
        />
      )}

      {mostrarActividad && (
        <ModalActividad
          user={usuario}
          storage={almacenamiento}
          onClose={() => establecerMostrarActividad(false)}
        />
      )}
    </div>
  )
}

export default Aplicacion
