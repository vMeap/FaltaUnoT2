import React, { useEffect, useState } from 'react'
import { SafeAreaView, View, StyleSheet } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import BarraSuperior from './src/components/BarraSuperior'
import PantallaAcceso from './src/screens/PantallaAcceso'
import PantallaPartidos from './src/screens/PantallaPartidos'
import PantallaDetalle from './src/screens/PantallaDetalle'
import { cerrarSesionUsuario, consultarPartidos } from './src/services/api'

export default function App() {
    const [usuario, setUsuario] = useState(null)
    const [almacenamiento, setAlmacenamiento] = useState('mysql')
    const [partidos, setPartidos] = useState([])
    const [idsMisPartidos, setIdsMisPartidos] = useState([])
    const [partidoSeleccionado, setPartidoSeleccionado] = useState(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState('')
    const [intento, setIntento] = useState(0)

    useEffect(() => {
        if (!usuario) return
        let activo = true

        consultarPartidos(almacenamiento, usuario.token)
            .then((lista) => {
                if (!activo) return
                setPartidos(Array.isArray(lista) ? lista : [])
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
        setUsuario(usuarioAutenticado)
    }

    function manejarCambioAlmacenamiento(nuevoAlmacenamiento) {
        if (nuevoAlmacenamiento === almacenamiento) return
        setPartidoSeleccionado(null)
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
        setError('')
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

            <View style={estilos.cuerpo}>
                {partidoActualDetalle ? (
                    <PantallaDetalle
                        partido={partidoActualDetalle}
                        inscrito={idsMisPartidos.includes(partidoActualDetalle.id)}
                        alVolver={() => setPartidoSeleccionado(null)}
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
    }
})
