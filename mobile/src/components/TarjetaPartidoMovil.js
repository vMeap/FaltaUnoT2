import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

export default function TarjetaPartidoMovil({ partido, inscrito, alVerDetalle }) {
    const sinCupos = Number(partido.slots) <= 0

    return (
        <TouchableOpacity
            style={estilos.tarjeta}
            activeOpacity={0.85}
            onPress={() => alVerDetalle(partido)}
        >
            <View style={estilos.encabezado}>
                <View style={estilos.iconoDeporte}>
                    <Text style={estilos.letraDeporte}>{partido.sport.charAt(0)}</Text>
                </View>

                <View style={estilos.etiquetasDerecha}>
                    <View style={estilos.etiquetaNivel}>
                        <Text style={estilos.textoNivel}>{partido.level}</Text>
                    </View>

                    {inscrito && (
                        <View style={estilos.etiquetaInscrito}>
                            <Text style={estilos.textoInscrito}>Inscrito</Text>
                        </View>
                    )}
                </View>
            </View>

            <Text style={estilos.deporte}>{partido.sport}</Text>
            <Text style={estilos.ubicacion}>{partido.location}</Text>
            <Text style={estilos.fechaHora}>
                Fecha: {partido.date} · {partido.time} hrs
            </Text>

            <View style={estilos.pieTarjeta}>
                <Text
                    style={[
                        estilos.textoCupos,
                        sinCupos ? estilos.textoSinCupos : estilos.textoConCupos
                    ]}
                >
                    {sinCupos
                        ? 'Partido completo'
                        : `Faltan ${partido.slots} ${partido.slots === 1 ? 'jugador' : 'jugadores'}`}
                </Text>

                <View style={estilos.botonDetalle}>
                    <Text style={estilos.textoBotonDetalle}>Ver detalle →</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const estilos = StyleSheet.create({
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
        marginBottom: 10
    },
    iconoDeporte: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e8f5ee',
        alignItems: 'center',
        justifyContent: 'center'
    },
    letraDeporte: {
        color: '#198754',
        fontWeight: 'bold',
        fontSize: 16
    },
    etiquetasDerecha: {
        flexDirection: 'row',
        gap: 6
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
    etiquetaInscrito: {
        backgroundColor: '#d1e7dd',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12
    },
    textoInscrito: {
        color: '#0f5132',
        fontSize: 12,
        fontWeight: 'bold'
    },
    deporte: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#132a1e',
        marginBottom: 2
    },
    ubicacion: {
        fontSize: 14,
        color: '#495057',
        marginBottom: 4
    },
    fechaHora: {
        fontSize: 13,
        color: '#6c757d',
        marginBottom: 12
    },
    pieTarjeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eef2ef',
        paddingTop: 10
    },
    textoCupos: {
        fontSize: 13,
        fontWeight: 'bold'
    },
    textoConCupos: {
        color: '#198754'
    },
    textoSinCupos: {
        color: '#dc3545'
    },
    botonDetalle: {
        backgroundColor: '#198754',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16
    },
    textoBotonDetalle: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold'
    }
})
