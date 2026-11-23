import React from 'react'
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const NOMBRES_BD = {
    mysql: 'MySQL',
    mongodb: 'MongoDB',
    memory: 'Memoria'
}

export default function ModalComprobante({ partido, usuario, almacenamiento, alCerrar }) {
    if (!partido) return null

    const folio = `FU-${String(partido.id).slice(0, 6).toUpperCase()}-${String(usuario.id).slice(0, 4).toUpperCase()}`

    return (
        <Modal transparent animationType="fade" visible onRequestClose={alCerrar}>
            <View style={estilos.fondo}>
                <View style={estilos.tarjeta}>
                    <View style={estilos.encabezado}>
                        <Text style={estilos.titulo}>Comprobante de Inscripción</Text>
                        <View style={estilos.etiquetaConfirmada}>
                            <Text style={estilos.textoConfirmada}>INSCRIPCIÓN CONFIRMADA</Text>
                        </View>
                    </View>

                    <View style={estilos.cajaFolio}>
                        <Text style={estilos.etiquetaDato}>Folio</Text>
                        <Text style={estilos.folio}>{folio}</Text>
                    </View>

                    <Text style={estilos.subtitulo}>Jugador</Text>
                    <Fila etiqueta="Nombre" valor={usuario.name} />
                    <Fila etiqueta="Correo" valor={usuario.email} />

                    <Text style={estilos.subtitulo}>Evento</Text>
                    <Fila etiqueta="Deporte" valor={partido.sport} />
                    <Fila etiqueta="Nivel" valor={partido.level} />
                    <Fila etiqueta="Cancha" valor={partido.location} />
                    <Fila etiqueta="Fecha" valor={partido.date} />
                    <Fila etiqueta="Hora" valor={`${partido.time} hrs`} />
                    <Fila etiqueta="Base de datos" valor={NOMBRES_BD[almacenamiento] || almacenamiento} />

                    <TouchableOpacity style={estilos.botonCerrar} onPress={alCerrar}>
                        <Text style={estilos.textoBotonCerrar}>Cerrar comprobante</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

function Fila({ etiqueta, valor }) {
    return (
        <View style={estilos.fila}>
            <Text style={estilos.etiquetaDato}>{etiqueta}</Text>
            <Text style={estilos.valorDato}>{valor}</Text>
        </View>
    )
}

const estilos = StyleSheet.create({
    fondo: {
        flex: 1,
        backgroundColor: 'rgba(15, 41, 30, 0.7)',
        justifyContent: 'center',
        padding: 20
    },
    tarjeta: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 20
    },
    encabezado: {
        alignItems: 'center',
        paddingBottom: 12,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eef2ef'
    },
    titulo: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#132a1e',
        marginBottom: 8
    },
    etiquetaConfirmada: {
        backgroundColor: '#198754',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12
    },
    textoConfirmada: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: 'bold'
    },
    cajaFolio: {
        backgroundColor: '#e8f5ee',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        marginBottom: 12
    },
    folio: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f5132',
        letterSpacing: 1
    },
    subtitulo: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#198754',
        marginTop: 6,
        marginBottom: 4
    },
    fila: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f3'
    },
    etiquetaDato: {
        fontSize: 12,
        color: '#6c757d'
    },
    valorDato: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#212529',
        flexShrink: 1,
        textAlign: 'right',
        marginLeft: 10
    },
    botonCerrar: {
        backgroundColor: '#0f291e',
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 16
    },
    textoBotonCerrar: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold'
    }
})
