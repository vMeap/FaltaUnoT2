import { useState } from 'react'
import FondoCancha from './FondoCancha.jsx'
import { iniciarSesionUsuario, registrarCuenta } from '../services/api.js'

const formularioVacio = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    rememberMe: true
}

const patronCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function IconoOjo({ open: abierto }) {
    if (abierto) {
        return (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        )
    }

    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    )
}

function Acceso({ onLogin: alIniciarSesion, onRegister: alRegistrarse }) {
    const [modo, establecerModo] = useState('login')
    const [formulario, establecerFormulario] = useState(formularioVacio)
    const [errores, establecerErrores] = useState({})
    const [mostrarContrasena, establecerMostrarContrasena] = useState(false)
    const [mostrarConfirmacionContrasena, establecerMostrarConfirmacionContrasena] = useState(false)

    const esRegistro = modo === 'register'

    function cambiarModo(siguienteModo) {
        establecerModo(siguienteModo)
        establecerErrores({})
        establecerMostrarContrasena(false)
        establecerMostrarConfirmacionContrasena(false)
    }

    function actualizarCampo(evento) {
        const { name: nombre, value: valor, type: tipo, checked: marcado } = evento.target
        establecerFormulario((actual) => ({
            ...actual,
            [nombre]: tipo === 'checkbox' ? marcado : valor
        }))
        establecerErrores((actual) => ({ ...actual, [nombre]: '' }))
    }

    async function enviarFormulario(evento) {
        evento.preventDefault()
        const nuevosErrores = {}
        const nombreLimpio = formulario.name.trim()
        const correoLimpio = formulario.email.trim().toLocaleLowerCase('es')

        if (esRegistro) {
            if (nombreLimpio.length < 2) {
                nuevosErrores.name = 'Escribe tu nombre o apodo (mínimo 2 letras).'
            }

            if (!patronCorreo.test(correoLimpio)) {
                nuevosErrores.email = 'Ingresa un correo válido (ej: nombre@correo.cl).'
            }

            if (formulario.password.length < 4) {
                nuevosErrores.password = 'Usa una contraseña de al menos 4 caracteres.'
            }

            if (!formulario.confirmPassword || formulario.password !== formulario.confirmPassword) {
                nuevosErrores.confirmPassword = 'Las contraseñas no coinciden.'
            }

            establecerErrores(nuevosErrores)
            if (Object.keys(nuevosErrores).length > 0) return

            try {
                const usuarioCreado = await registrarCuenta(
                    nombreLimpio,
                    correoLimpio,
                    formulario.password
                )
                alRegistrarse(usuarioCreado, formulario.rememberMe)
            } catch (error) {
                establecerErrores({ email: error.message === 'Failed to fetch' ? 'Inicia el backend para crear tu cuenta.' : error.message })
            }
            return
        }

        if (!correoLimpio) {
            nuevosErrores.email = 'Ingresa tu correo electrónico.'
        } else if (!patronCorreo.test(correoLimpio)) {
            nuevosErrores.email = 'Ingresa un correo electrónico válido.'
        }

        if (!formulario.password) {
            nuevosErrores.password = 'Ingresa tu contraseña.'
        }

        if (Object.keys(nuevosErrores).length > 0) {
            establecerErrores(nuevosErrores)
            return
        }

        try {
            const usuarioAutenticado = await iniciarSesionUsuario(correoLimpio, formulario.password)
            alIniciarSesion(usuarioAutenticado, formulario.rememberMe)
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                establecerErrores({ email: 'Inicia el backend para ingresar, también en modo memoria.' })
            } else if (error.message.includes('contraseña')) {
                establecerErrores({ password: error.message })
            } else {
                establecerErrores({ email: error.message })
            }
        }
    }

    return (
        <main className="login-page min-vh-100 d-flex align-items-center py-4 py-lg-5">
            <FondoCancha />

            <div className="container position-relative z-1">
                <div className="login-shell mx-auto">
                    <div className="row g-0">
                        <div className={`col-12 col-lg-6 login-showcase ${esRegistro ? 'login-showcase-register' : ''} p-4 p-sm-5 d-flex flex-column justify-content-between`}>
                            <div className="showcase-top d-flex align-items-center justify-content-between">
                                <div className="showcase-brand-pill">
                                    <span className="showcase-brand-icon" aria-hidden="true">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                            <line x1="12" y1="5" x2="12" y2="19" />
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                        </svg>
                                    </span>
                                    <span className="showcase-brand-text">FaltaUno</span>
                                </div>
                            </div>

                            <div className="showcase-bottom my-auto py-4">
                                <h1 className="display-5 fw-bold text-white mb-3 login-hero-title">
                                    ¿Falta uno
                                    <br />
                                    <span>pa&apos;l partido?</span>
                                </h1>
                                <p className="login-showcase-lead mb-0">
                                    Armamos la pichanga entre todos. Busca dónde jugar hoy o publica tu cancha cuando te falte gente.
                                </p>
                            </div>

                            <div className="showcase-footer d-flex align-items-center justify-content-between flex-wrap gap-2 pt-3">
                                <span className="small text-white-50">
                                    Deporte amateur en tu ciudad
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-sm showcase-switch-btn rounded-pill px-3"
                                    onClick={() => cambiarModo(esRegistro ? 'login' : 'register')}
                                >
                                    {esRegistro ? 'Ya tengo cuenta →' : 'Crear cuenta nueva →'}
                                </button>
                            </div>
                        </div>

                        <section
                            className="col-12 col-lg-6 login-form-panel d-flex flex-column"
                            aria-labelledby="auth-title"
                        >
                            <div
                                className={`auth-banner-header ${esRegistro ? 'auth-banner-register' : 'auth-banner-login'} px-4 pt-4 pb-3 text-center position-relative d-flex flex-column justify-content-between`}
                            >
                                <div className="d-flex align-items-center justify-content-between">
                                    {esRegistro ? (
                                        <button
                                            type="button"
                                            className="auth-back-btn"
                                            aria-label="Volver a Iniciar Sesión"
                                            onClick={() => cambiarModo('login')}
                                        >
                                            ‹
                                        </button>
                                    ) : (
                                        <span />
                                    )}

                                    <div className="auth-mode-tabs" role="tablist" aria-label="Cambiar modo de acceso">
                                        <button
                                            type="button"
                                            role="tab"
                                            aria-selected={!esRegistro}
                                            className={`auth-tab-btn ${!esRegistro ? 'active' : ''}`}
                                            onClick={() => cambiarModo('login')}
                                        >
                                            Ingresar
                                        </button>
                                        <button
                                            type="button"
                                            role="tab"
                                            aria-selected={esRegistro}
                                            className={`auth-tab-btn ${esRegistro ? 'active' : ''}`}
                                            onClick={() => cambiarModo('register')}
                                        >
                                            Crear cuenta
                                        </button>
                                    </div>
                                </div>

                                <div className="my-3">
                                    <h2 className="h3 fw-bold text-white mb-1 auth-banner-title" id="auth-title">
                                        {esRegistro ? 'Registrarse' : 'Iniciar Sesión'}
                                    </h2>
                                    <p className="auth-banner-subtitle mb-0">
                                        {esRegistro
                                            ? 'Crea tu perfil de jugador en un minuto'
                                            : 'Ingresa con tu correo y contraseña'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 p-sm-5 flex-grow-1 d-flex flex-column justify-content-center">
                                <form onSubmit={enviarFormulario} noValidate>
                                    {esRegistro && (
                                        <div className="mb-3">
                                            <label className="form-label auth-label" htmlFor="auth-name">
                                                Nombre o apodo
                                            </label>
                                            <input
                                                id="auth-name"
                                                name="name"
                                                type="text"
                                                autoComplete="name"
                                                placeholder="Ej: Matías Rojas"
                                                className={`form-control auth-field ${errores.name ? 'is-invalid' : ''}`}
                                                value={formulario.name}
                                                onChange={actualizarCampo}
                                            />
                                            {errores.name && (
                                                <div className="invalid-feedback">{errores.name}</div>
                                            )}
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <label className="form-label auth-label" htmlFor="auth-email">
                                            Email
                                        </label>
                                        <input
                                            id="auth-email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="tu@correo.cl"
                                            className={`form-control auth-field ${errores.email ? 'is-invalid' : ''}`}
                                            value={formulario.email}
                                            onChange={actualizarCampo}
                                        />
                                        {errores.email && (
                                            <div className="invalid-feedback">{errores.email}</div>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label auth-label" htmlFor="auth-password">
                                            Contraseña
                                        </label>
                                        <div className="auth-password-wrapper">
                                            <input
                                                id="auth-password"
                                                name="password"
                                                type={mostrarContrasena ? 'text' : 'password'}
                                                autoComplete={esRegistro ? 'new-password' : 'current-password'}
                                                placeholder="Escribe tu contraseña"
                                                className={`form-control auth-field pe-5 ${errores.password ? 'is-invalid' : ''}`}
                                                value={formulario.password}
                                                onChange={actualizarCampo}
                                            />
                                            <button
                                                type="button"
                                                className="auth-eye-btn"
                                                aria-label={mostrarContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                                onClick={() => establecerMostrarContrasena((previo) => !previo)}
                                            >
                                                <IconoOjo open={mostrarContrasena} />
                                            </button>
                                            {errores.password && (
                                                <div className="invalid-feedback d-block">
                                                    {errores.password}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {esRegistro ? (
                                        <div className="mb-4">
                                            <label className="form-label auth-label" htmlFor="auth-confirm-password">
                                                Confirmar Contraseña
                                            </label>
                                            <div className="auth-password-wrapper">
                                                <input
                                                    id="auth-confirm-password"
                                                    name="confirmPassword"
                                                    type={mostrarConfirmacionContrasena ? 'text' : 'password'}
                                                    autoComplete="new-password"
                                                    placeholder="Repite tu contraseña"
                                                    className={`form-control auth-field pe-5 ${errores.confirmPassword ? 'is-invalid' : ''}`}
                                                    value={formulario.confirmPassword}
                                                    onChange={actualizarCampo}
                                                />
                                                <button
                                                    type="button"
                                                    className="auth-eye-btn"
                                                    aria-label={mostrarConfirmacionContrasena ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                                                    onClick={() => establecerMostrarConfirmacionContrasena((previo) => !previo)}
                                                >
                                                    <IconoOjo open={mostrarConfirmacionContrasena} />
                                                </button>
                                                {errores.confirmPassword && (
                                                    <div className="invalid-feedback d-block">
                                                        {errores.confirmPassword}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="d-flex justify-content-between align-items-center mb-4">
                                            <div className="form-check mb-0">
                                                <input
                                                    id="auth-remember"
                                                    name="rememberMe"
                                                    type="checkbox"
                                                    className="form-check-input auth-checkbox"
                                                    checked={formulario.rememberMe}
                                                    onChange={actualizarCampo}
                                                />
                                                <label className="form-check-label auth-remember-label" htmlFor="auth-remember">
                                                    Recuérdame
                                                </label>
                                            </div>

                                            <span className="auth-forgot-text">
                                                ¿Olvidaste tu contraseña?
                                            </span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-auth-cta rounded-pill w-100 py-3 fw-bold"
                                    >
                                        {esRegistro ? 'Registrarse' : 'Iniciar Sesión'}
                                    </button>
                                </form>

                                <p className="text-center auth-footer-text mt-4 mb-0">
                                    {esRegistro ? (
                                        <>
                                            ¿Tienes una cuenta?{' '}
                                            <button
                                                type="button"
                                                className="btn btn-link auth-switch-link p-0 align-baseline"
                                                onClick={() => cambiarModo('login')}
                                            >
                                                Iniciar Sesión
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            ¿Aún no tienes cuenta?{' '}
                                            <button
                                                type="button"
                                                className="btn btn-link auth-switch-link p-0 align-baseline"
                                                onClick={() => cambiarModo('register')}
                                            >
                                                Registrarse
                                            </button>
                                        </>
                                    )}
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Acceso
