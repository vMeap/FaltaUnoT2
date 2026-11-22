import React, { useMemo, useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    StyleSheet
} from 'react-native'
import TarjetaPartidoMovil from '../components/TarjetaPartidoMovil'

const DEPORTES = ['Todos', 'Fútbol', 'Básquetbol', 'Pádel']

export default function PantallaPartidos({
    partidos,
    idsMisPartidos,
    almacenamiento,
    cargando,
    error,
    alRecargar,
    alSeleccionarPartido
}) {
    const [busqueda, setBusqueda] = useState('')
    const [filtroDeporte, setFiltroDeporte] = useState('Todos')

    const partidosVisibles = useMemo(() => {
        const textoBuscado = busqueda.trim().toLowerCase()

        return partidos.filter((partido) => {
            const coincideDeporte =
                filtroDeporte === 'Todos' || partido.sport === filtroDeporte

            const contenido =
                `${partido.sport} ${partido.location} ${partido.level}`.toLowerCase()

            return coincideDeporte && contenido.includes(textoBuscado)
        })
    }, [partidos, filtroDeporte, busqueda])

    const partidosConCupos = partidos.filter((p) => Number(p.slots) > 0).length
    const totalCupos = partidos.reduce((acc, p) => acc + Number(p.slots || 0), 0)
    const nombreBd =
        almacenamiento === 'mysql'
            ? 'MySQL'
            : almacenamiento === 'mongodb'
            ? 'MongoDB'
            : 'Memoria'

    return (
        <ScrollView contentContainerStyle={estilos.contenedor}>
            <View style={estilos.filaEncabezado}>
                <View>
                    <Text style={estilos.eyebrow}>CARTELERA DEPORTIVA ({nombreBd})</Text>
                    <Text style={estilos.titulo}>Partidos disponibles</Text>
                </View>

                <TouchableOpacity style={estilos.botonActualizar} onPress={alRecargar}>
                    <Text style={estilos.textoActualizar}>Actualizar</Text>
                </TouchableOpacity>
            </View>

            <View style={estilos.filaIndicadores}>
                <View style={estilos.cajaIndicador}>
                    <Text style={estilos.valorIndicador}>{partidos.length}</Text>
                    <Text style={estilos.etiquetaIndicador}>Publicados</Text>
                </View>
                <View style={estilos.cajaIndicador}>
                    <Text style={estilos.valorIndicador}>{partidosConCupos}</Text>
                    <Text style={estilos.etiquetaIndicador}>Con cupos</Text>
                </View>
                <View style={estilos.cajaIndicador}>
                    <Text style={estilos.valorIndicador}>{totalCupos}</Text>
                    <Text style={estilos.etiquetaIndicador}>Cupos libres</Text>
                </View>
            </View>

            <TextInput
                style={estilos.buscador}
                placeholder="Buscar por deporte, cancha o nivel..."
                value={busqueda}
                onChangeText={setBusqueda}
            />

            <View style={estilos.filaFiltros}>
                {DEPORTES.map((deporte) => {
                    const activo = filtroDeporte === deporte
                    return (
                        <TouchableOpacity
                            key={deporte}
                            style={[estilos.botonFiltro, activo && estilos.botonFiltroActivo]}
                            onPress={() => setFiltroDeporte(deporte)}
                        >
                            <Text style={[estilos.textoFiltro, activo && estilos.textoFiltroActivo]}>
                                {deporte}
                            </Text>
                        </TouchableOpacity>
                    )
                })}
            </View>

            {cargando ? (
                <View style={estilos.cajaEstado}>
                    <ActivityIndicator size="large" color="#198754" />
                    <Text style={estilos.textoEstado}>Cargando partidos desde la API...</Text>
                </View>
            ) : error ? (
                <View style={estilos.cajaError}>
                    <Text style={estilos.textoError}>{error}</Text>
                    <TouchableOpacity style={estilos.botonReintentar} onPress={alRecargar}>
                        <Text style={estilos.textoReintentar}>Reintentar conexión</Text>
                    </TouchableOpacity>
                </View>
            ) : partidosVisibles.length === 0 ? (
                <View style={estilos.cajaEstado}>
                    <Text style={estilos.tituloVacio}>No encontramos partidos</Text>
                    <Text style={estilos.textoEstado}>
                        Prueba cambiando el filtro de deporte o el texto de búsqueda.
                    </Text>
                </View>
            ) : (
                partidosVisibles.map((partido) => (
                    <TarjetaPartidoMovil
                        key={partido.id}
                        partido={partido}
                        inscrito={idsMisPartidos.includes(partido.id)}
                        alVerDetalle={alSeleccionarPartido}
                    />
                ))
            )}
        </ScrollView>
    )
}

const estilos = StyleSheet.create({
    contenedor: {
        padding: 16,
        paddingBottom: 28
    },
    filaEncabezado: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14
    },
    eyebrow: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#198754'
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#132a1e'
    },
    botonActualizar: {
        backgroundColor: '#e8f5ee',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16
    },
    textoActualizar: {
        color: '#0f5132',
        fontSize: 12,
        fontWeight: 'bold'
    },
    filaIndicadores: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14
    },
    cajaIndicador: {
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#dfe7e2'
    },
    valorIndicador: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#198754'
    },
    etiquetaIndicador: {
        fontSize: 11,
        color: '#6c757d'
    },
    buscador: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 14,
        marginBottom: 12
    },
    filaFiltros: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16
    },
    botonFiltro: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#ced4da',
        backgroundColor: '#ffffff'
    },
    botonFiltroActivo: {
        backgroundColor: '#198754',
        borderColor: '#198754'
    },
    textoFiltro: {
        fontSize: 13,
        fontWeight: '600',
        color: '#495057'
    },
    textoFiltroActivo: {
        color: '#ffffff'
    },
    cajaEstado: {
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
        marginBottom: 4
    },
    textoEstado: {
        fontSize: 13,
        color: '#6c757d',
        textAlign: 'center',
        marginTop: 8
    },
    cajaError: {
        backgroundColor: '#f8d7da',
        borderRadius: 14,
        padding: 16,
        alignItems: 'center'
    },
    textoError: {
        color: '#842029',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 10
    },
    botonReintentar: {
        backgroundColor: '#842029',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16
    },
    textoReintentar: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold'
    }
})
