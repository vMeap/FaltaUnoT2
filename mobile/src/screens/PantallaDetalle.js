import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    StyleSheet
} from 'react-native'
import { consultarClimaPartido } from '../services/servicioClima'

export default function PantallaDetalle({
    partido,
    inscrito,
    alVolver,
    alInscribir,
    alCancelar
}) {
    const [resultadoClima, setResultadoClima] = useState(null)
    const clavePartido = partido ? `${partido.id}-${partido.date}-${partido.time}` : ''

    useEffect(() => {
        if (!partido) return
        let activo = true

        consultarClimaPartido(partido)
            .then((datos) => {
                if (activo) {
                    setResultadoClima({ clave: clavePartido, datos, fallo: false })
                }
            })
            .catch(() => {
                if (activo) {
                    setResultadoClima({ clave: clavePartido, datos: null, fallo: true })
                }
            })

        return () => {
            activo = false
        }
    }, [partido, clavePartido])

    if (!partido) return null

    const sinCupos = Number(partido.slots) <= 0
    const cargandoClima = resultadoClima?.clave !== clavePartido
    const clima = resultadoClima?.datos
    const errorClima = resultadoClima?.fallo

    return (
        <ScrollView contentContainerStyle={estilos.contenedor}>
            <TouchableOpacity style={estilos.botonVolver} onPress={alVolver}>
                <Text style={estilos.textoVolver}>← Volver a la cartelera</Text>
            </TouchableOpacity>

            <View style={estilos.tarjetaDetalle}>
                <View style={estilos.encabezado}>
                    <Text style={estilos.deporte}>{partido.sport}</Text>
                    <View style={estilos.etiquetaNivel}>
                        <Text style={estilos.textoNivel}>{partido.level}</Text>
                    </View>
                </View>

                <View style={estilos.bloqueDato}>
                    <Text style={estilos.etiquetaDato}>Ubicación / Cancha</Text>
                    <Text style={estilos.valorDato}>{partido.location}</Text>
                </View>

                <View style={estilos.filaDoble}>
                    <View style={estilos.bloqueMitad}>
                        <Text style={estilos.etiquetaDato}>Fecha</Text>
                        <Text style={estilos.valorDato}>{partido.date}</Text>
                    </View>
                    <View style={estilos.bloqueMitad}>
                        <Text style={estilos.etiquetaDato}>Horario</Text>
                        <Text style={estilos.valorDato}>{partido.time} hrs</Text>
                    </View>
                </View>

                <View style={estilos.filaDoble}>
                    <View style={estilos.bloqueMitad}>
                        <Text style={estilos.etiquetaDato}>Cupos disponibles</Text>
                        <Text style={estilos.valorDato}>{partido.slots}</Text>
                    </View>
                    <View style={estilos.bloqueMitad}>
                        <Text style={estilos.etiquetaDato}>Estado de tu inscripción</Text>
                        <Text
                            style={[
                                estilos.valorDato,
                                inscrito ? estilos.estadoInscrito : estilos.estadoPendiente
                            ]}
                        >
                            {inscrito
                                ? 'Inscrito (Confirmado)'
                                : sinCupos
                                ? 'Sin cupos'
                                : 'Disponible para unirse'}
                        </Text>
                    </View>
                </View>

                <View style={estilos.cajaClima}>
                    <Text style={estilos.tituloClima}>Pronóstico del clima (Open-Meteo)</Text>
                    {cargandoClima ? (
                        <View style={estilos.filaCargandoClima}>
                            <ActivityIndicator size="small" color="#198754" />
                            <Text style={estilos.textoClimaSecundario}>Consultando clima...</Text>
                        </View>
                    ) : errorClima || !clima ? (
                        <Text style={estilos.textoClimaSecundario}>
                            Pronóstico no disponible para esta fecha u hora.
                        </Text>
                    ) : (
                        <View>
                            <Text style={estilos.temperaturaClima}>
                                {clima.temperatura} °C · {clima.descripcion}
                            </Text>
                            <Text style={estilos.textoClimaSecundario}>
                                Probabilidad de lluvia: {clima.lluvia}% · Viento: {clima.viento} km/h
                            </Text>
                        </View>
                    )}
                </View>

                {inscrito && alCancelar ? (
                    <TouchableOpacity
                        style={estilos.botonBaja}
                        onPress={() => alCancelar(partido.id)}
                    >
                        <Text style={estilos.textoBotonAccion}>Dar de baja mi inscripción</Text>
                    </TouchableOpacity>
                ) : alInscribir ? (
                    <TouchableOpacity
                        style={[estilos.botonInscribir, sinCupos && estilos.botonDeshabilitado]}
                        disabled={sinCupos}
                        onPress={() => alInscribir(partido.id)}
                    >
                        <Text style={estilos.textoBotonAccion}>
                            {sinCupos ? 'Partido sin cupos' : 'Yo apaño (Inscribirme)'}
                        </Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </ScrollView>
    )
}

const estilos = StyleSheet.create({
    contenedor: {
        padding: 16
    },
    botonVolver: {
        alignSelf: 'flex-start',
        marginBottom: 12,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#e8f5ee',
        borderRadius: 16
    },
    textoVolver: {
        color: '#0f5132',
        fontWeight: 'bold',
        fontSize: 13
    },
    tarjetaDetalle: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: '#dfe7e2'
    },
    encabezado: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eef2ef'
    },
    deporte: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#132a1e'
    },
    etiquetaNivel: {
        backgroundColor: '#e8f5ee',
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14
    },
    textoNivel: {
        color: '#0f5132',
        fontWeight: 'bold',
        fontSize: 13
    },
    bloqueDato: {
        marginBottom: 14
    },
    filaDoble: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 14
    },
    bloqueMitad: {
        flex: 1,
        backgroundColor: '#f8faf9',
        padding: 12,
        borderRadius: 10
    },
    etiquetaDato: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 4
    },
    valorDato: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#212529'
    },
    estadoInscrito: {
        color: '#198754'
    },
    estadoPendiente: {
        color: '#495057'
    },
    cajaClima: {
        backgroundColor: '#eff8f3',
        borderRadius: 12,
        padding: 14,
        marginTop: 4,
        marginBottom: 16
    },
    tituloClima: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#0f5132',
        marginBottom: 6
    },
    filaCargandoClima: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8
    },
    temperaturaClima: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#132a1e',
        marginBottom: 2
    },
    textoClimaSecundario: {
        fontSize: 12,
        color: '#495057'
    },
    botonInscribir: {
        backgroundColor: '#198754',
        borderRadius: 24,
        paddingVertical: 13,
        alignItems: 'center'
    },
    botonBaja: {
        backgroundColor: '#dc3545',
        borderRadius: 24,
        paddingVertical: 13,
        alignItems: 'center'
    },
    botonDeshabilitado: {
        backgroundColor: '#adb5bd'
    },
    textoBotonAccion: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 'bold'
    }
})
