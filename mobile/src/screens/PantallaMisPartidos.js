import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import ModalComprobante from '../components/ModalComprobante'

export default function PantallaMisPartidos({
    partidos,
    idsMisPartidos,
    usuario,
    almacenamiento,
    alSeleccionarPartido,
    alCancelarInscripcion
}) {
    const [partidoComprobante, setPartidoComprobante] = useState(null)
    const misPartidos = partidos.filter((partido) => idsMisPartidos.includes(partido.id))

    return (
        <ScrollView contentContainerStyle={estilos.contenedor}>
            <Text style={estilos.eyebrow}>MI AGENDA DEPORTIVA</Text>
            <Text style={estilos.titulo}>Mis inscripciones</Text>

            {misPartidos.length === 0 ? (
                <View style={estilos.cajaVacia}>
                    <Text style={estilos.tituloVacio}>Aún no estás inscrito en ningún partido</Text>
                    <Text style={estilos.textoVacio}>
                        Ve a "Explorar partidos" y presiona "Yo apaño" para sumarte a uno.
                    </Text>
                </View>
            ) : (
                misPartidos.map((partido) => (
                    <View key={partido.id} style={estilos.tarjeta}>
                        <View style={estilos.encabezado}>
                            <Text style={estilos.deporte}>{partido.sport}</Text>
                            <View style={estilos.etiquetaNivel}>
                                <Text style={estilos.textoNivel}>{partido.level}</Text>
                            </View>
                        </View>

                        <Text style={estilos.ubicacion}>{partido.location}</Text>
                        <Text style={estilos.fechaHora}>
                            Fecha: {partido.date} · {partido.time} hrs
                        </Text>

                        <View style={estilos.etiquetaConfirmada}>
                            <Text style={estilos.textoConfirmada}>Inscripción confirmada</Text>
                        </View>

                        <View style={estilos.filaBotones}>
                            <TouchableOpacity
                                style={estilos.botonComprobante}
                                onPress={() => setPartidoComprobante(partido)}
                            >
                                <Text style={estilos.textoBotonClaro}>Ver comprobante</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={estilos.botonDetalle}
                                onPress={() => alSeleccionarPartido(partido)}
                            >
                                <Text style={estilos.textoBoton}>Ver detalle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={estilos.botonBaja}
                                onPress={() => alCancelarInscripcion(partido.id)}
                            >
                                <Text style={estilos.textoBoton}>Dar de baja</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            )}

            <ModalComprobante
                partido={partidoComprobante}
                usuario={usuario}
                almacenamiento={almacenamiento}
                alCerrar={() => setPartidoComprobante(null)}
            />
        </ScrollView>
    )
}

const estilos = StyleSheet.create({
    contenedor: {
        padding: 16,
        paddingBottom: 28
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#198754'
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#132a1e',
        marginBottom: 14
    },
    cajaVacia: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dfe7e2'
    },
    tituloVacio: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#212529',
        textAlign: 'center'
    },
    textoVacio: {
        fontSize: 13,
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 8
    },
    tarjeta: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#dfe7e2'
    },
    encabezado: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4
    },
    deporte: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#132a1e'
    },
    etiquetaNivel: {
        backgroundColor: '#f1f5f3',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    textoNivel: {
        color: '#495057',
        fontSize: 12,
        fontWeight: '600'
    },
    ubicacion: {
        fontSize: 14,
        color: '#495057',
        marginBottom: 4
    },
    fechaHora: {
        fontSize: 13,
        color: '#6c757d',
        marginBottom: 10
    },
    etiquetaConfirmada: {
        alignSelf: 'flex-start',
        backgroundColor: '#d1e7dd',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12
    },
    textoConfirmada: {
        color: '#0f5132',
        fontSize: 12,
        fontWeight: 'bold'
    },
    filaBotones: {
        flexDirection: 'row',
        gap: 6,
        borderTopWidth: 1,
        borderTopColor: '#eef2ef',
        paddingTop: 10
    },
    botonComprobante: {
        flex: 1,
        backgroundColor: '#e8f5ee',
        paddingVertical: 8,
        borderRadius: 16,
        alignItems: 'center'
    },
    botonDetalle: {
        flex: 1,
        backgroundColor: '#198754',
        paddingVertical: 8,
        borderRadius: 16,
        alignItems: 'center'
    },
    botonBaja: {
        flex: 1,
        backgroundColor: '#dc3545',
        paddingVertical: 8,
        borderRadius: 16,
        alignItems: 'center'
    },
    textoBotonClaro: {
        color: '#0f5132',
        fontSize: 12,
        fontWeight: 'bold'
    },
    textoBoton: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold'
    }
})
