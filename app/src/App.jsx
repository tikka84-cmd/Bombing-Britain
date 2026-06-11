import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { formatDateRange, formatPeriod, formatCasualty, formatTags } from './format'

// Free, no-API-key basemap: CARTO Positron (light, neutral, good for data viz).
const BASEMAP_STYLE = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors © CARTO',
    },
  },
  layers: [{ id: 'carto', type: 'raster', source: 'carto' }],
}

const GB_BOUNDS = [
  [-8.7, 49.8],
  [1.9, 60.9],
]

// Casualty colour scale (warm = more). sz === -1 means "no usable figure".
const COLOUR = [
  'case',
  ['<', ['get', 'sz'], 0], '#8a8d91', // unknown / not sized
  [
    'step',
    ['get', 'sz'],
    '#6baed6', // 0 casualties
    1, '#fee08b',
    10, '#fdae61',
    50, '#f46d43',
    200, '#d73027',
  ],
]

const RADIUS = [
  'interpolate',
  ['linear'],
  ['zoom'],
  4,
  [
    'case',
    ['<', ['get', 'sz'], 0], 2,
    ['interpolate', ['linear'], ['get', 'sz'], 0, 2.5, 10, 4, 50, 6, 200, 9, 1000, 13],
  ],
  9,
  [
    'case',
    ['<', ['get', 'sz'], 0], 3.5,
    ['interpolate', ['linear'], ['get', 'sz'], 0, 4, 10, 7, 50, 11, 200, 16, 1000, 24],
  ],
]

export default function App() {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [count, setCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (mapRef.current) return
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAP_STYLE,
      bounds: GB_BOUNDS,
      fitBoundsOptions: { padding: 30 },
      attributionControl: false,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right')

    map.on('load', async () => {
      try {
        const res = await fetch('/raids.geojson')
        if (!res.ok) throw new Error(`Failed to load data (${res.status})`)
        const data = await res.json()
        setCount(data.features.length)

        map.addSource('raids', { type: 'geojson', data })
        map.addLayer({
          id: 'raids-circles',
          type: 'circle',
          source: 'raids',
          paint: {
            'circle-color': COLOUR,
            'circle-radius': RADIUS,
            'circle-opacity': 0.75,
            'circle-stroke-color': 'rgba(60,20,20,0.5)',
            'circle-stroke-width': 0.3,
          },
        })

        map.on('click', 'raids-circles', (e) => {
          if (e.features && e.features.length) setSelected(e.features[0].properties)
        })
        map.on('mouseenter', 'raids-circles', () => {
          map.getCanvas().style.cursor = 'pointer'
        })
        map.on('mouseleave', 'raids-circles', () => {
          map.getCanvas().style.cursor = ''
        })
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <>
      <div className="map" ref={mapContainer} />

      <div className="header panel">
        <h1>Bombing Britain</h1>
        <p>
          German and Italian air attacks on the whole United Kingdom, 1939–1945. Not just London:
          watch the bombing spread across the country.
        </p>
        {count != null && (
          <div className="count">{count.toLocaleString('en-GB')} located attacks shown</div>
        )}
      </div>

      <div className="legend panel">
        <h2>Total casualties</h2>
        <div className="row"><span className="dot" style={{ background: '#6baed6' }} /> none recorded</div>
        <div className="row"><span className="dot" style={{ background: '#fee08b' }} /> 1–9</div>
        <div className="row"><span className="dot" style={{ background: '#fdae61' }} /> 10–49</div>
        <div className="row"><span className="dot" style={{ background: '#f46d43' }} /> 50–199</div>
        <div className="row"><span className="dot" style={{ background: '#d73027' }} /> 200+</div>
        <div className="row"><span className="dot" style={{ background: '#8a8d91' }} /> figure not usable</div>
      </div>

      {loading && <div className="loading panel">Loading attacks…</div>}
      {error && <div className="loading panel">Could not load data: {error}</div>}

      {selected && <DetailCard p={selected} onClose={() => setSelected(null)} />}

      <div className="attribution panel">
        Data: <em>Bombing Britain: an air raid map</em>, Dr Laura Blomvall, University of York, with
        Taylor &amp; Francis and The National Archives (HO 203, Crown Copyright), funded by the AHRC.
        Independent visualisation, not affiliated or endorsed.
      </div>
    </>
  )
}

function DetailCard({ p, onClose }) {
  const tags = formatTags(p.tags)
  const lowConfidence = p.gc === 'low' || p.gc === 'medium'
  return (
    <div className="card panel">
      <button className="close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <h2>{p.loc}</h2>
      <div className="sub">{[p.reg, p.ctry].filter(Boolean).join(' · ')}</div>
      <dl>
        <dt>Date</dt>
        <dd>{formatDateRange(p.sd, p.ed)}</dd>
        <dt>Time</dt>
        <dd>{formatPeriod(p.per)}</dd>
        <dt>Killed</dt>
        <dd>{formatCasualty(p.kV, p.kB, p.kR)}</dd>
        <dt>Injured</dt>
        <dd>{formatCasualty(p.iV, p.iB, p.iR)}</dd>
        <dt>Total</dt>
        <dd>{formatCasualty(p.tV, p.tB, p.tR)}</dd>
        {tags && (
          <>
            <dt>Recorded</dt>
            <dd>{tags}</dd>
          </>
        )}
      </dl>

      {p.lon === 1 && (
        <div className="flag">
          Casualty figure is a city-wide total for London, not for this location alone.
        </div>
      )}
      {lowConfidence && (
        <div className="flag">Location is approximate (geocoding confidence: {p.gc}).</div>
      )}

      {p.notes && <div className="notes">{p.notes}</div>}

      {p.link && (
        <div className="notes" style={{ borderTop: 'none', paddingTop: 0 }}>
          <a href={p.link} target="_blank" rel="noreferrer">
            Source record (HO 203)
          </a>{' '}
          <span style={{ color: 'var(--muted)' }}>— resolves only with institutional access.</span>
        </div>
      )}
    </div>
  )
}
