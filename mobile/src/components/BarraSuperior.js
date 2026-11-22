import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const OPCIONES_BD = [
    { valor: 'mysql', etiqueta: 'MySQL' },
    { valor: 'mongodb', etiqueta: 'MongoDB' },
    { valor: 'memory', etiqueta: 'Memoria' }
]

export default function BarraSuperior({
    usuario,
    almacenamiento,
    alCambiarAlmacenamiento,
    alCerrarSesion
}) {
    return (
        <View style={estilos.contenedor}>
            <View style={estilos.filaPrincipal}>
                <View style={estilos.marca}>
                    <View style={estilos.iconoMarca}>
                        <Text style={estilos.textoIcono}>+</Text>
                    </View>
                    <View>
                        <Text style={estilos.titulo}>FaltaUno Móvil</Text>
                        <Text style={estilos.subtitulo}>
                            {usuario.name} · {usuario.role === 'admin' ? 'Administrador' : 'Jugador'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={estilos.botonSalir} onPress={alCerrarSesion}>
                    <Text style={estilos.textoSalir}>Salir</Text>
                </TouchableOpacity>
            </View>

            <View style={estilos.filaAlmacenamiento}>
                <Text style={estilos.etiquetaBd}>Base de datos:</Text>
                <View style={estilos.grupoBotonesBd}>
                    {OPCIONES_BD.map((opcion) => {
                        const activo = almacenamiento === opcion.valor
                        return (
                            <TouchableOpacity
                                key={opcion.valor}
                                style={[estilos.botonBd, activo && estilos.botonBdActivo]}
                                onPress={() => alCambiarAlmacenamiento(opcion.valor)}
                            >
                                <Text style={[estilos.textoBd, activo && estilos.textoBdActivo]}>
                                    {opcion.etiqueta}
                                </Text>
                            </TouchableOpacity>
                        )
                    })}
                </View>
            </View>
        </View>
    )
}

const estilos = StyleSheet.create({
    contenedor: {
        backgroundColor: '#0f291e',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 12
    },
    filaPrincipal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    marca: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    iconoMarca: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: '#198754',
        alignItems: 'center',
        justifyContent: 'center'
    },
    textoIcono: {
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    titulo: {
        color: '#ffffff',
        fontSize: 17,
        fontWeight: 'bold'
    },
    subtitulo: {
        color: '#a3cfbb',
        fontSize: 12
    },
    botonSalir: {
        borderWidth: 1,
        borderColor: '#476b59',
        borderRadius: 16,
        paddingHorizontal: 12,
        paddingVertical: 5
    },
    textoSalir: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600'
    },
    filaAlmacenamiento: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#163829',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6
    },
    etiquetaBd: {
        color: '#d1e7dd',
        fontSize: 12,
        fontWeight: '600'
    },
    grupoBotonesBd: {
        flexDirection: 'row',
        gap: 6
    },
    botonBd: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: '#0f291e'
    },
    botonBdActivo: {
        backgroundColor: '#198754'
    },
    textoBd: {
        color: '#a3cfbb',
        fontSize: 12,
        fontWeight: '600'
    },
    textoBdActivo: {
        color: '#ffffff'
    }
})
