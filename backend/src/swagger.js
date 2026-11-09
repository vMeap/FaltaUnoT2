export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'API FaltaUno - Hito 3',
        version: '1.0.0',
        description: 'Endpoints de usuarios y partidos (MySQL) e historial de actividad (MongoDB).'
    },
    paths: {
        '/api/auth/login': {
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
                    200: { description: 'Login correcto' },
                    401: { description: 'Contraseña incorrecta' },
                    404: { description: 'Correo no registrado' }
                }
            }
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Registrar un nuevo usuario en MySQL',
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
        '/api/matches': {
            get: {
                tags: ['Matches'],
                summary: 'Listar partidos disponibles desde MySQL (con filtro opcional por deporte)',
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
                summary: 'Crear un nuevo partido en MySQL',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    sport: { type: 'string', example: 'Fútbol' },
                                    level: { type: 'string', example: 'Amateur' },
                                    date: { type: 'string', example: '2026-11-15' },
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
                    400: { description: 'Datos inválidos' }
                }
            }
        },
        '/api/matches/stats': {
            get: {
                tags: ['Matches'],
                summary: 'Obtener indicadores de partidos y cupos disponibles',
                responses: {
                    200: { description: 'Indicadores generales' }
                }
            }
        },
        '/api/matches/{id}': {
            put: {
                tags: ['Matches'],
                summary: 'Editar los datos o cupos de un partido en MySQL',
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
                    404: { description: 'No encontrado' }
                }
            },
            delete: {
                tags: ['Matches'],
                summary: 'Eliminar o cancelar un partido publicado en MySQL',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Partido eliminado' },
                    404: { description: 'No encontrado' }
                }
            }
        },
        '/api/logs': {
            get: {
                tags: ['Logs'],
                summary: 'Obtener historial de actividad desde MongoDB',
                responses: {
                    200: { description: 'Lista de actividad reciente' }
                }
            },
            post: {
                tags: ['Logs'],
                summary: 'Guardar un registro de actividad en MongoDB',
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
