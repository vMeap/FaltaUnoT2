import React, { useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    StyleSheet
} from 'react-native'
import { iniciarSesionUsuario, registrarCuenta, URL_API } from '../services/api'

const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function PantallaAcceso({ almacenamiento, alAutenticar }) {
    const [modo, setModo] = useState('login')
    const [nombre, setNombre] = useState('')
    const [correo, setCorreo] = useState('')
    const [contrasena, setContrasena] = useState('')
    const [confirmarContrasena, setConfirmarContrasena] = useState('')
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)

    const esRegistro = modo === 'registro'

    function cambiarModo(nuevoModo) {
        setModo(nuevoModo)
        setError('')
    }

    async function manejarEnvio() {
        setError('')
        const correoLimpio = correo.trim().toLowerCase()
        const nombreLimpio = nombre.trim()

        if (esRegistro && nombreLimpio.length < 2) {
            setError('Escribe tu nombre o apodo (mínimo 2 letras).')
            return
        }
        if (!PATRON_CORREO.test(correoLimpio)) {
            setError('Ingresa un correo electrónico válido.')
            return
        }
        if (!contrasena || contrasena.length < 4) {
            setError('La contraseña debe tener al menos 4 caracteres.')
            return
        }
        if (esRegistro && contrasena !== confirmarContrasena) {
            setError('Las contraseñas no coinciden.')
            return
        }

        setCargando(true)
        try {
            const usuario = esRegistro
                ? await registrarCuenta(nombreLimpio, correoLimpio, contrasena, almacenamiento)
                : await iniciarSesionUsuario(correoLimpio, contrasena, almacenamiento)

            alAutenticar(usuario)
        } catch (err) {
            setError(
                err.message === 'Failed to fetch'
                    ? `No se pudo conectar con la API (${URL_API}). Verifica que el backend esté activo.`
                    : err.message
            )
        } finally {
            setCargando(false)
        }
    }

    function completarCuentaPrueba(correoDemo) {
        setModo('login')
        setCorreo(correoDemo)
        setContrasena('123456')
        setError('')
    }

    return (
        <ScrollView contentContainerStyle={estilos.contenedor}>
            <View style={estilos.cabecera}>
                <View style={estilos.circuloLogo}>
                    <Text style={estilos.textoLogo}>+</Text>
                </View>
                <Text style={estilos.marca}>FaltaUno</Text>
                <Text style={estilos.bajada}>
                    Encuentra partidos deportivos e inscríbete desde tu teléfono
                </Text>
            </View>

            <View style={estilos.tarjetaFormulario}>
                <View style={estilos.pestanas}>
                    <TouchableOpacity
                        style={[estilos.botonPestana, !esRegistro && estilos.pestanaActiva]}
                        onPress={() => cambiarModo('login')}
                    >
                        <Text style={[estilos.textoPestana, !esRegistro && estilos.textoPestanaActiva]}>
                            Ingresar
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[estilos.botonPestana, esRegistro && estilos.pestanaActiva]}
                        onPress={() => cambiarModo('registro')}
                    >
                        <Text style={[estilos.textoPestana, esRegistro && estilos.textoPestanaActiva]}>
                            Crear cuenta
                        </Text>
                    </TouchableOpacity>
                </View>

                {error ? (
                    <View style={estilos.cajaError}>
                        <Text style={estilos.textoError}>{error}</Text>
                    </View>
                ) : null}

                {esRegistro && (
                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Nombre o apodo</Text>
                        <TextInput
                            style={estilos.entrada}
                            placeholder="Ej: Matías Rojas"
                            value={nombre}
                            onChangeText={setNombre}
                        />
                    </View>
                )}

                <View style={estilos.campo}>
                    <Text style={estilos.etiqueta}>Correo electrónico</Text>
                    <TextInput
                        style={estilos.entrada}
                        placeholder="tu@correo.cl"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={correo}
                        onChangeText={setCorreo}
                    />
                </View>

                <View style={estilos.campo}>
                    <Text style={estilos.etiqueta}>Contraseña</Text>
                    <TextInput
                        style={estilos.entrada}
                        placeholder="Escribe tu contraseña"
                        secureTextEntry
                        value={contrasena}
                        onChangeText={setContrasena}
                    />
                </View>

                {esRegistro && (
                    <View style={estilos.campo}>
                        <Text style={estilos.etiqueta}>Confirmar contraseña</Text>
                        <TextInput
                            style={estilos.entrada}
                            placeholder="Repite tu contraseña"
                            secureTextEntry
                            value={confirmarContrasena}
                            onChangeText={setConfirmarContrasena}
                        />
                    </View>
                )}

                <TouchableOpacity
                    style={estilos.botonPrincipal}
                    onPress={manejarEnvio}
                    disabled={cargando}
                >
                    {cargando ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={estilos.textoBotonPrincipal}>
                            {esRegistro ? 'Registrarme' : 'Iniciar Sesión'}
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={estilos.cajaCuentasPrueba}>
                    <Text style={estilos.tituloCuentasPrueba}>Acceso rápido de prueba:</Text>
                    <View style={estilos.filaCuentasPrueba}>
                        <TouchableOpacity
                            style={estilos.chipPrueba}
                            onPress={() => completarCuentaPrueba('matias@faltauno.cl')}
                        >
                            <Text style={estilos.textoChipPrueba}>Jugador (Matías)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={estilos.chipPrueba}
                            onPress={() => completarCuentaPrueba('kevin@faltauno.cl')}
                        >
                            <Text style={estilos.textoChipPrueba}>Admin (Kevin)</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    )
}

const estilos = StyleSheet.create({
    contenedor: {
        flexGrow: 1,
        backgroundColor: '#0f291e',
        padding: 20,
        justifyContent: 'center'
    },
    cabecera: {
        alignItems: 'center',
        marginBottom: 22
    },
    circuloLogo: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#198754',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8
    },
    textoLogo: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold'
    },
    marca: {
        color: '#ffffff',
        fontSize: 28,
        fontWeight: 'bold'
    },
    bajada: {
        color: '#a3cfbb',
        fontSize: 14,
        textAlign: 'center',
        marginTop: 4
    },
    tarjetaFormulario: {
        backgroundColor: '#ffffff',
        borderRadius: 18,
        padding: 20
    },
    pestanas: {
        flexDirection: 'row',
        backgroundColor: '#eef3f0',
        borderRadius: 12,
        padding: 4,
        marginBottom: 16
    },
    botonPestana: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 10
    },
    pestanaActiva: {
        backgroundColor: '#198754'
    },
    textoPestana: {
        fontSize: 14,
        fontWeight: '600',
        color: '#495057'
    },
    textoPestanaActiva: {
        color: '#ffffff'
    },
    cajaError: {
        backgroundColor: '#f8d7da',
        borderColor: '#f5c2c7',
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        marginBottom: 12
    },
    textoError: {
        color: '#842029',
        fontSize: 13
    },
    campo: {
        marginBottom: 14
    },
    etiqueta: {
        fontSize: 13,
        fontWeight: '600',
        color: '#212529',
        marginBottom: 6
    },
    entrada: {
        borderWidth: 1,
        borderColor: '#ced4da',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        backgroundColor: '#f8faf9'
    },
    botonPrincipal: {
        backgroundColor: '#198754',
        borderRadius: 24,
        paddingVertical: 13,
        alignItems: 'center',
        marginTop: 4
    },
    textoBotonPrincipal: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 'bold'
    },
    cajaCuentasPrueba: {
        marginTop: 18,
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        paddingTop: 12
    },
    tituloCuentasPrueba: {
        fontSize: 12,
        color: '#6c757d',
        marginBottom: 8,
        textAlign: 'center'
    },
    filaCuentasPrueba: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10
    },
    chipPrueba: {
        backgroundColor: '#e8f5ee',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14
    },
    textoChipPrueba: {
        color: '#0f5132',
        fontSize: 12,
        fontWeight: '600'
    }
})
