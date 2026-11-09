export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'API FaltaUno - Hito 3',
        version: '1.0.0',
        description: 'Partidos e inscripciones independientes en memoria, MySQL o MongoDB. Kevin es el único administrador. Las fechas van desde hoy hasta los próximos 14 días.'
    },
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer' }
        },
        parameters: {
            Storage: {
                name: 'storage', in: 'query', required: false,
                description: 'Almacenamiento de partidos e inscripciones. Las cuentas son compartidas y el historial identifica el almacenamiento utilizado.',
                schema: { type: 'string', enum: ['memory', 'mysql', 'mongodb'], example: 'mysql' }
            }
        }
    },
    paths: {
        '/api/auth/login': {
            parameters: [{ $ref: '#/components/parameters/Storage' }],
            post: {
                tags: ['Auth'],
                summary: 'Iniciar sesión con correo y contraseña',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    email: { type: 'string', example: 'kevin@faltauno.cl' },
                                    password: { type: 'string', example: '123456' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Devuelve user con id, name, email, role y token. Usar el token en Authorize.' },
                    401: { description: 'Contraseña incorrecta' },
                    404: { description: 'Correo no registrado' }
                }
            }
        },
        '/api/auth/register': {
            parameters: [{ $ref: '#/components/parameters/Storage' }],
            post: {
                tags: ['Auth'],
                summary: 'Registrar un usuario normal en MySQL o memoria si MySQL no está disponible',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string', example: 'Juan Pérez' },
                                    email: { type: 'string', example: 'juan@faltauno.cl' },
                                    password: { type: 'string', example: '123456' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Usuario creado' },
                    400: { description: 'Datos incompletos' },
                    409: { description: 'El correo ya existe' }
                }
            }
        },
        '/api/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Cerrar sesión e invalidar el token',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Sesión cerrada' },
                    401: { description: 'Sesión inválida' }
                }
            }
        },
        '/api/matches': {
            parameters: [{ $ref: '#/components/parameters/Storage' }],
            get: {
                tags: ['Matches'],
                summary: 'Listar partidos del almacenamiento elegido entre hoy y los próximos 14 días',
                parameters: [
                    {
                        name: 'sport',
                        in: 'query',
                        required: false,
                        schema: { type: 'string', example: 'Fútbol' }
                    }
                ],
                responses: {
                    200: { description: 'Lista de partidos' }
                }
            },
            post: {
                tags: ['Matches'],
                summary: 'Crear un partido en el almacenamiento elegido (solo Kevin)',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    sport: { type: 'string', example: 'Fútbol' },
                                    level: { type: 'string', example: 'Amateur' },
                                    date: { type: 'string', format: 'date', description: 'Desde hoy hasta hoy + 14 días, en America/Santiago' },
                                    time: { type: 'string', example: '20:00' },
                                    location: { type: 'string', example: 'Canchas Sur' },
                                    slots: { type: 'integer', example: 2 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Partido creado' },
                    400: { description: 'Datos inválidos o fecha fuera de rango' },
                    401: { description: 'Iniciar sesión' },
                    403: { description: 'Solo el administrador puede crear partidos' }
                }
            }
        },
        '/api/matches/stats': {
            parameters: [{ $ref: '#/components/parameters/Storage' }],
            get: {
                tags: ['Matches'],
                summary: 'Obtener indicadores de partidos y cupos disponibles',
                responses: {
                    200: { description: 'Indicadores generales' }
                }
            }
        },
        '/api/matches/{id}': {
            parameters: [{ $ref: '#/components/parameters/Storage' }],
            put: {
                tags: ['Matches'],
                summary: 'Editar un partido del almacenamiento elegido (solo Kevin)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    sport: { type: 'string' },
                                    level: { type: 'string' },
                                    date: { type: 'string' },
                                    time: { type: 'string' },
                                    location: { type: 'string' },
                                    slots: { type: 'integer' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Partido actualizado' },
                    400: { description: 'Datos inválidos o fecha fuera de rango' },
                    401: { description: 'Iniciar sesión' },
                    403: { description: 'Solo el administrador puede editar partidos' },
                    404: { description: 'No encontrado' }
                }
            },
            delete: {
                tags: ['Matches'],
                summary: 'Eliminar un partido y sus inscripciones (solo Kevin)',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Partido eliminado' },
                    401: { description: 'Iniciar sesión' },
                    403: { description: 'Solo el administrador puede eliminar partidos' },
                    404: { description: 'No encontrado' }
                }
            }
        },
        '/api/registrations': {
            parameters: [{ $ref: '#/components/parameters/Storage' }],
            get: {
                tags: ['Registrations'],
                summary: 'Listar los IDs de partidos inscritos de un usuario',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'userId', in: 'query', required: true, schema: { type: 'string', example: 'user-2' } }
                ],
                responses: {
                    200: {
                        description: 'Lista de IDs de partidos',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { type: 'string' }, example: ['match-3'] }
                            }
                        }
                    },
                    400: { description: 'Falta el usuario' },
                    401: { description: 'Iniciar sesión' },
                    403: { description: 'Solo el administrador puede consultar otras cuentas' }
                }
            },
            post: {
                tags: ['Registrations'],
                summary: 'Inscribirse en un partido y descontar un cupo',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['matchId', 'userId'],
                                properties: {
                                    matchId: { type: 'string', example: 'match-3' },
                                    userId: { type: 'string', example: 'user-2' },
                                    userEmail: { type: 'string', example: 'matias@faltauno.cl' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Inscripción guardada y actividad registrada',
                        content: {
                            'application/json': { example: { ok: true, matchId: 'match-3', slots: 0 } }
                        }
                    },
                    400: { description: 'Datos incompletos' },
                    401: { description: 'Iniciar sesión' },
                    403: { description: 'Solo puedes inscribirte con tu cuenta' },
                    404: { description: 'Partido o usuario no encontrado' },
                    409: { description: 'Ya inscrito o sin cupos disponibles' }
                }
            }
        },
        '/api/registrations/{matchId}': {
            parameters: [{ $ref: '#/components/parameters/Storage' }],
            delete: {
                tags: ['Registrations'],
                summary: 'Cancelar una inscripción y devolver un cupo',
                security: [{ bearerAuth: [] }],
                parameters: [
                    { name: 'matchId', in: 'path', required: true, schema: { type: 'string', example: 'match-3' } },
                    { name: 'userId', in: 'query', required: true, schema: { type: 'string', example: 'user-2' } },
                    { name: 'userEmail', in: 'query', required: false, description: 'El servidor usa el correo de la sesión.', schema: { type: 'string', example: 'matias@faltauno.cl' } }
                ],
                responses: {
                    200: {
                        description: 'Inscripción eliminada y actividad registrada',
                        content: {
                            'application/json': { example: { ok: true, matchId: 'match-3', slots: 1 } }
                        }
                    },
                    400: { description: 'Datos incompletos' },
                    401: { description: 'Iniciar sesión' },
                    403: { description: 'Solo puedes cancelar tus inscripciones' },
                    404: { description: 'Partido o inscripción no encontrado' }
                }
            }
        },
        '/api/logs': {
            parameters: [{ $ref: '#/components/parameters/Storage' }],
            get: {
                tags: ['Logs'],
                summary: 'Obtener actividad del almacenamiento elegido: Kevin ve todos los eventos y cada jugador los propios',
                security: [{ bearerAuth: [] }],
                responses: {
                    200: { description: 'Lista de actividad reciente' }
                }
            },
            post: {
                tags: ['Logs'],
                summary: 'Guardar un registro de actividad en MongoDB',
                security: [{ bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    userEmail: { type: 'string', example: 'kevin@faltauno.cl' },
                                    action: { type: 'string', example: 'INSCRIPCION' },
                                    detail: { type: 'string', example: 'Se unió a partido de Fútbol' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Registro guardado' }
                }
            }
        }
    }
}
