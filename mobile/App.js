import React, { useEffect, useState } from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import BarraSuperior from './src/components/BarraSuperior'
import PantallaAcceso from './src/screens/PantallaAcceso'
import PantallaPartidos from './src/screens/PantallaPartidos'
import PantallaDetalle from './src/screens/PantallaDetalle'
import PantallaMisPartidos from './src/screens/PantallaMisPartidos'
import {
    cerrarSesionUsuario,
    consultarPartidos,
    consultarMisInscripciones,
    inscribirseEnPartidoApi,
    cancelarInscripcionPartidoApi
} from './src/services/api'

export default function App() {
    const [usuario, setUsuario] = useState(null)
    const [almacenamiento, setAlmacenamiento] = useState('mysql')
    const [partidos, setPartidos] = useState([])
    const [idsMisPartidos, setIdsMisPartidos] = useState([])
    const [partidoSeleccionado, setPartidoSeleccionado] = useState(null)
    const [pestanaActiva, setPestanaActiva] = useState('partidos')
    const [aviso, setAviso] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [intento, setIntento] = useState(0)

    useEffect(() => {
        if (!usuario) return
        let activo = true

        Promise.all([
            consultarPartidos(almacenamiento, usuario.token),
            consultarMisInscripciones(usuario.id, almacenamiento, usuario.token)
        ])
            .then(([lista, ids]) => {
                if (!activo) return
                setPartidos(Array.isArray(lista) ? lista : [])
                setIdsMisPartidos(Array.isArray(ids) ? ids : [])
                setError('')
            })
            .catch((err) => {
                if (activo) setError(err.message || 'No se pudieron cargar los partidos.')
            })
            .finally(() => {
                if (activo) setCargando(false)
            })

        return () => {
            activo = false
        }
    }, [usuario, almacenamiento, intento])

    function recargarCartelera() {
        setCargando(true)
        setError('')
        setIntento((actual) => actual + 1)
    }

    function manejarAutenticacion(usuarioAutenticado) {
        setCargando(true)
        setError('')
        setPestanaActiva('partidos')
        setUsuario(usuarioAutenticado)
    }

    function manejarCambioAlmacenamiento(nuevoAlmacenamiento) {
        if (nuevoAlmacenamiento === almacenamiento) return
        setPartidoSeleccionado(null)
        setIdsMisPartidos([])
        setAviso(null)
        setCargando(true)
        setError('')
        setAlmacenamiento(nuevoAlmacenamiento)
    }

    function manejarCerrarSesion() {
        if (usuario?.token) {
            cerrarSesionUsuario(usuario.token, almacenamiento).catch(() => {})
        }
        setUsuario(null)
        setPartidos([])
        setIdsMisPartidos([])
        setPartidoSeleccionado(null)
        setAviso(null)
        setError('')
    }

    function actualizarCupos(idPartido, cupos) {
        setPartidos((actuales) =>
            actuales.map((p) => (p.id === idPartido ? { ...p, slots: cupos } : p))
        )
    }

    async function manejarInscripcion(idPartido) {
        try {
            const respuesta = await inscribirseEnPartidoApi(
                idPartido,
                usuario.id,
                usuario.email,
                almacenamiento,
                usuario.token
            )
            actualizarCupos(idPartido, respuesta.slots)
            setIdsMisPartidos((actuales) =>
                actuales.includes(idPartido) ? actuales : [...actuales, idPartido]
            )
            setAviso({ tipo: 'exito', texto: '¡Listo! Quedaste inscrito en el partido.' })
        } catch (err) {
            setAviso({ tipo: 'error', texto: err.message || 'No se pudo completar la inscripción.' })
        }
    }

    async function manejarBaja(idPartido) {
        try {
            const respuesta = await cancelarInscripcionPartidoApi(
                idPartido,
                usuario.id,
                usuario.email,
                almacenamiento,
                usuario.token
            )
            actualizarCupos(idPartido, respuesta.slots)
            setIdsMisPartidos((actuales) => actuales.filter((id) => id !== idPartido))
            setAviso({ tipo: 'exito', texto: 'Te diste de baja del partido.' })
        } catch (err) {
            setAviso({ tipo: 'error', texto: err.message || 'No se pudo cancelar la inscripción.' })
        }
    }

    function cambiarPestana(pestana) {
        setPartidoSeleccionado(null)
        setAviso(null)
        setPestanaActiva(pestana)
    }

    const partidoActualDetalle = partidoSeleccionado
        ? partidos.find((p) => p.id === partidoSeleccionado.id) || partidoSeleccionado
        : null

    if (!usuario) {
        return (
            <SafeAreaView style={estilos.fondoAcceso}>
                <StatusBar style="light" />
                <PantallaAcceso
                    almacenamiento={almacenamiento}
                    alAutenticar={manejarAutenticacion}
                />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={estilos.contenedorPrincipal}>
            <StatusBar style="light" />
            <BarraSuperior
                usuario={usuario}
                almacenamiento={almacenamiento}
                alCambiarAlmacenamiento={manejarCambioAlmacenamiento}
                alCerrarSesion={manejarCerrarSesion}
            />

            {aviso && (
                <TouchableOpacity
                    style={[estilos.aviso, aviso.tipo === 'exito' ? estilos.avisoExito : estilos.avisoError]}
                    onPress={() => setAviso(null)}
                >
                    <Text
                        style={[
                            estilos.textoAviso,
                            aviso.tipo === 'exito' ? estilos.textoAvisoExito : estilos.textoAvisoError
                        ]}
                    >
                        {aviso.texto}
                    </Text>
                    <Text style={estilos.cerrarAviso}>✕</Text>
                </TouchableOpacity>
            )}

            <View style={estilos.cuerpo}>
                {partidoActualDetalle ? (
                    <PantallaDetalle
                        partido={partidoActualDetalle}
                        inscrito={idsMisPartidos.includes(partidoActualDetalle.id)}
                        alVolver={() => setPartidoSeleccionado(null)}
                        alInscribir={manejarInscripcion}
                        alCancelar={manejarBaja}
                    />
                ) : pestanaActiva === 'mis-partidos' ? (
                    <PantallaMisPartidos
                        partidos={partidos}
                        idsMisPartidos={idsMisPartidos}
                        usuario={usuario}
                        almacenamiento={almacenamiento}
                        alSeleccionarPartido={(partido) => setPartidoSeleccionado(partido)}
                        alCancelarInscripcion={manejarBaja}
                    />
                ) : (
                    <PantallaPartidos
                        partidos={partidos}
                        idsMisPartidos={idsMisPartidos}
                        almacenamiento={almacenamiento}
                        cargando={cargando}
                        error={error}
                        alRecargar={recargarCartelera}
                        alSeleccionarPartido={(partido) => setPartidoSeleccionado(partido)}
                    />
                )}
            </View>

            <View style={estilos.barraInferior}>
                <TouchableOpacity
                    style={[estilos.pestana, pestanaActiva === 'partidos' && estilos.pestanaActiva]}
                    onPress={() => cambiarPestana('partidos')}
                >
                    <Text
                        style={[
                            estilos.textoPestana,
                            pestanaActiva === 'partidos' && estilos.textoPestanaActiva
                        ]}
                    >
                        Explorar partidos
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[estilos.pestana, pestanaActiva === 'mis-partidos' && estilos.pestanaActiva]}
                    onPress={() => cambiarPestana('mis-partidos')}
                >
                    <Text
                        style={[
                            estilos.textoPestana,
                            pestanaActiva === 'mis-partidos' && estilos.textoPestanaActiva
                        ]}
                    >
                        Mis inscripciones ({idsMisPartidos.length})
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}

const estilos = StyleSheet.create({
    fondoAcceso: {
        flex: 1,
        backgroundColor: '#0f291e'
    },
    contenedorPrincipal: {
        flex: 1,
        backgroundColor: '#f4f7f5'
    },
    cuerpo: {
        flex: 1
    },
    aviso: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginTop: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12
    },
    avisoExito: {
        backgroundColor: '#d1e7dd'
    },
    avisoError: {
        backgroundColor: '#f8d7da'
    },
    textoAviso: {
        flex: 1,
        fontSize: 13,
        fontWeight: 'bold'
    },
    textoAvisoExito: {
        color: '#0f5132'
    },
    textoAvisoError: {
        color: '#842029'
    },
    cerrarAviso: {
        marginLeft: 10,
        color: '#495057',
        fontSize: 13
    },
    barraInferior: {
        flexDirection: 'row',
        backgroundColor: '#0f291e',
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 8
    },
    pestana: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        alignItems: 'center'
    },
    pestanaActiva: {
        backgroundColor: '#198754'
    },
    textoPestana: {
        color: '#a3cfbb',
        fontSize: 13,
        fontWeight: 'bold'
    },
    textoPestanaActiva: {
        color: '#ffffff'
    }
})
