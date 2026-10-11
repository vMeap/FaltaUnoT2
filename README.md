# FaltaUno Taller 2

Aplicación frontend para encontrar y crear partidos deportivos amateur. Proyecto en desarrollo para el Taller Evaluado 2.

## Ejecutar en local

```bash
npm install
npm run dev
```

## Estado compartido y contrato de integración

`App.jsx` es la fuente de verdad para los partidos y las inscripciones. El estado persiste en el navegador con las claves `faltauno.matches.v1` y `faltauno.myMatches.v1`.

Cada partido usa este formato:

```js
{
  id: string,
  sport: 'Fútbol' | 'Básquetbol' | 'Pádel',
  location: string,
  date: 'YYYY-MM-DD',
  time: 'HH:mm',
  level: 'Amateur' | 'Intermedio' | 'Competitivo',
  slots: number,
  latitude?: number,
  longitude?: number
}
```

Los componentes de interfaz reciben los datos y acciones mediante props. `MyMatchesPanel` usa `matches`, `myMatchIds` y `onCancel`; el formulario usa `onSubmit` y `onClose`. Los partidos iniciales están en `src/data/initialMatches.json` y llevan coordenadas para su futura integración con el clima.

La integración de Open-Meteo, el diseño previo y la documentación completa de la pauta se agregarán durante el trabajo del equipo.
