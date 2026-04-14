import { useState, useEffect, useRef, useCallback } from 'react'

const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY

// ── Helpers ──────────────────────────────────────────────────────────────────

function starsText(rating) {
  if (!rating) return '—'
  const full  = Math.round(rating)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
}

function metersToMiles(m) {
  return (m / 1609.34).toFixed(1)
}

function distanceBetween(a, b) {
  const R = 6371000
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

// ── Setup guide (shown when no API key) ──────────────────────────────────────

function SetupGuide() {
  return (
    <div style={{ padding: '8px 0' }}>
      <div style={{ fontSize: 13, color: 'var(--ink3)', fontWeight: 700, lineHeight: 1.7, marginBottom: 18 }}>
        The map feature needs a Google Maps API key. Follow these steps to enable it:
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          ['1', 'Go to console.cloud.google.com and create a new project (or select an existing one)'],
          ['2', 'Enable "Maps JavaScript API" and "Places API" from the APIs & Services library'],
          ['3', 'Create an API key under APIs & Services → Credentials'],
          ['4', 'Restrict the key to HTTP referrers: jkelsen13-tech.github.io/*'],
          ['5', 'In your GitHub repo, go to Settings → Secrets → Actions and add a secret named VITE_GOOGLE_MAPS_KEY with your key value'],
          ['6', 'Re-run the GitHub Actions deploy workflow — the map will appear on next deploy'],
        ].map(([n, t]) => (
          <div key={n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: 'var(--violet-bg)', border: '1.5px solid rgba(94,45,153,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, color: 'var(--violet)', flexShrink: 0,
            }}>{n}</div>
            <p style={{ fontSize: 12, color: 'var(--ink3)', fontWeight: 700, lineHeight: 1.6, margin: 0 }}>{t}</p>
          </div>
        ))}
      </div>
      <a
        href="https://weedmaps.com/dispensaries"
        target="_blank"
        rel="noopener noreferrer"
        className="weedmaps-btn"
        style={{ marginTop: 22 }}
      >
        Search dispensaries on Weedmaps ↗
      </a>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Map() {
  const mapRef        = useRef(null)
  const mapObjRef     = useRef(null)
  const markersRef    = useRef({})   // placeId → google.maps.Marker
  const infoWindowRef = useRef(null)

  const [status, setStatus]           = useState('idle')   // idle | loading | manual | ready | error
  const [errorMsg, setErrorMsg]       = useState('')
  const [manualInput, setManualInput] = useState('')
  const [dispensaries, setDispensaries] = useState([])
  const [userCoords, setUserCoords]   = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(null) // placeId being loaded

  // ── Load Google Maps script ───────────────────────────────────────────────
  const loadMapsScript = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (window.google?.maps?.places) { resolve(); return }
      const existing = document.getElementById('gm-script')
      if (existing) {
        existing.addEventListener('load', resolve)
        existing.addEventListener('error', reject)
        return
      }
      const script = document.createElement('script')
      script.id  = 'gm-script'
      script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload  = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }, [])

  // ── Build map at given coords ─────────────────────────────────────────────
  const buildMap = useCallback(async (lat, lng) => {
    setStatus('loading')
    setUserCoords({ lat, lng })
    try {
      await loadMapsScript()
      const center = { lat, lng }
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { featureType: 'all', elementType: 'geometry', stylers: [{ saturation: -30 }] },
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ lightness: 10 }] },
        ],
      })
      mapObjRef.current = map
      infoWindowRef.current = new window.google.maps.InfoWindow()

      // User location marker
      new window.google.maps.Marker({
        position: center,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#5e2d99',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2.5,
        },
        title: 'You',
        zIndex: 999,
      })

      // Search nearby dispensaries
      const svc = new window.google.maps.places.PlacesService(map)
      svc.nearbySearch(
        { location: center, radius: 8000, keyword: 'cannabis dispensary', type: 'store' },
        (results, placeStatus) => {
          const ok = window.google.maps.places.PlacesServiceStatus.OK
          const places = (placeStatus === ok ? results : []) ?? []

          const withDist = places
            .map(p => {
              const loc = p.geometry.location
              const dist = distanceBetween(center, { lat: loc.lat(), lng: loc.lng() })
              return { ...p, _dist: dist }
            })
            .sort((a, b) => a._dist - b._dist)
            .slice(0, 20)

          // Place markers
          withDist.forEach(place => {
            const marker = new window.google.maps.Marker({
              position: place.geometry.location,
              map,
              title: place.name,
              icon: {
                url: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38"><path d="M15 2C8.4 2 3 7.4 3 14C3 22 15 36 15 36C15 36 27 22 27 14C27 7.4 21.6 2 15 2Z" fill="#d4a017" stroke="#7a4d00" stroke-width="1.5"/><circle cx="15" cy="14" r="5" fill="#fff" opacity="0.9"/></svg>')}`,
                scaledSize: new window.google.maps.Size(30, 38),
                anchor: new window.google.maps.Point(15, 38),
              },
            })
            markersRef.current[place.place_id] = marker
            marker.addListener('click', () => openInfoWindow(place, marker, svc))
          })

          setDispensaries(withDist)
          setStatus('ready')
        }
      )
    } catch {
      setStatus('error')
      setErrorMsg('Failed to load Google Maps. Check that your API key is valid.')
    }
  }, [loadMapsScript])

  // ── Open InfoWindow with details ──────────────────────────────────────────
  const openInfoWindow = (place, marker, svc) => {
    const iw = infoWindowRef.current
    if (!iw) return

    const name   = place.name ?? ''
    const rating = place.rating ?? null
    const total  = place.user_ratings_total ?? 0
    const isOpen = place.opening_hours?.isOpen?.() ?? null

    const basicHtml = `
      <div style="font-family:'Mulish',sans-serif;max-width:260px;padding:4px 2px">
        <div style="font-weight:800;font-size:14px;color:#0e0a06;margin-bottom:4px">${name}</div>
        ${rating ? `<div style="color:#7a4d00;font-size:13px;font-weight:700;margin-bottom:2px">${starsText(rating)} <span style="color:#5a4a38;font-weight:600;font-size:11px">${rating} (${total})</span></div>` : ''}
        ${isOpen !== null ? `<div style="font-size:11px;font-weight:800;color:${isOpen ? '#0a4a38' : '#7a4d00'};margin-bottom:6px">${isOpen ? 'Open now' : 'Closed'}</div>` : ''}
        <div style="font-size:11px;color:#5a4a38;font-weight:600">Loading reviews…</div>
      </div>`
    iw.setContent(basicHtml)
    iw.open(mapObjRef.current, marker)

    setLoadingDetails(place.place_id)
    svc.getDetails(
      { placeId: place.place_id, fields: ['name', 'rating', 'reviews', 'website', 'formatted_address', 'opening_hours', 'user_ratings_total'] },
      (det, detStatus) => {
        setLoadingDetails(null)
        const ok = window.google.maps.places.PlacesServiceStatus.OK
        if (detStatus !== ok || !det) return

        const isOpenNow = det.opening_hours?.isOpen?.() ?? null
        const reviews   = (det.reviews ?? []).slice(0, 3)
        const addr      = det.formatted_address ?? ''
        const website   = det.website ?? null
        const detRating = det.rating ?? rating
        const detTotal  = det.user_ratings_total ?? total

        const reviewsHtml = reviews.map(r => `
          <div style="border-top:1px solid rgba(14,10,6,0.12);margin-top:8px;padding-top:8px">
            <div style="display:flex;justify-content:space-between;margin-bottom:2px">
              <span style="font-size:11px;font-weight:800;color:#3a2c1e">${r.author_name}</span>
              <span style="font-size:11px;color:#d4a017;font-weight:700">${starsText(r.rating)}</span>
            </div>
            <div style="font-size:11px;color:#5a4a38;font-weight:600;line-height:1.5;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${r.text}</div>
          </div>`).join('')

        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr || name)}&destination_place_id=${place.place_id}`

        const fullHtml = `
          <div style="font-family:'Mulish',sans-serif;max-width:280px;padding:4px 2px">
            <div style="font-weight:800;font-size:14px;color:#0e0a06;margin-bottom:4px">${det.name ?? name}</div>
            ${detRating ? `<div style="color:#7a4d00;font-size:13px;font-weight:700;margin-bottom:2px">${starsText(detRating)} <span style="color:#5a4a38;font-weight:600;font-size:11px">${detRating} (${detTotal} reviews)</span></div>` : ''}
            ${isOpenNow !== null ? `<div style="font-size:11px;font-weight:800;color:${isOpenNow ? '#0a4a38' : '#7a4d00'};margin-bottom:4px">${isOpenNow ? '● Open now' : '● Closed'}</div>` : ''}
            ${addr ? `<div style="font-size:11px;color:#5a4a38;font-weight:600;margin-bottom:8px">${addr}</div>` : ''}
            <div style="display:flex;gap:8px;margin-bottom:4px">
              ${website ? `<a href="${website}" target="_blank" rel="noopener noreferrer" style="flex:1;display:block;text-align:center;padding:7px 10px;background:#16755c;color:#f5ead8;border-radius:10px;font-weight:800;font-size:11px;text-decoration:none">Website ↗</a>` : ''}
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" style="flex:1;display:block;text-align:center;padding:7px 10px;background:#3a1660;color:#f5ead8;border-radius:10px;font-weight:800;font-size:11px;text-decoration:none">Directions ↗</a>
            </div>
            ${reviews.length ? `<div style="font-size:10px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#7a6a58;margin-top:10px;margin-bottom:2px">Google Reviews</div>${reviewsHtml}` : ''}
          </div>`
        iw.setContent(fullHtml)
      }
    )
  }

  // ── Fly to dispensary on card click ──────────────────────────────────────
  const flyTo = useCallback((place) => {
    if (!mapObjRef.current) return
    const marker = markersRef.current[place.place_id]
    if (!marker) return
    mapObjRef.current.panTo(place.geometry.location)
    mapObjRef.current.setZoom(15)
    const svc = new window.google.maps.places.PlacesService(mapObjRef.current)
    openInfoWindow(place, marker, svc)
  }, [])

  // ── Init: request geolocation ─────────────────────────────────────────────
  useEffect(() => {
    if (!MAPS_KEY) return
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      pos => buildMap(pos.coords.latitude, pos.coords.longitude),
      ()  => setStatus('manual'),
      { timeout: 8000 }
    )
  }, [buildMap])

  // ── Geocode manual input ──────────────────────────────────────────────────
  const handleManualSearch = async (e) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    setStatus('loading')
    try {
      await loadMapsScript()
      const geocoder = new window.google.maps.Geocoder()
      geocoder.geocode({ address: manualInput }, (results, geoStatus) => {
        if (geoStatus === 'OK' && results?.[0]) {
          const loc = results[0].geometry.location
          buildMap(loc.lat(), loc.lng())
        } else {
          setStatus('manual')
          setErrorMsg('Could not find that location. Try a city name or zip code.')
        }
      })
    } catch {
      setStatus('manual')
      setErrorMsg('Failed to load Google Maps. Check your API key.')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!MAPS_KEY) {
    return (
      <div className="map-section">
        <div className="s-label">dispensary map</div>
        <div style={{ background: 'var(--parch2)', border: '1.5px solid var(--border2)', borderRadius: 22, padding: '20px 18px', boxShadow: 'var(--shadow)' }}>
          <SetupGuide />
        </div>
      </div>
    )
  }

  return (
    <div className="map-section">
      <div className="s-label">dispensary map</div>

      <a
        href="https://weedmaps.com/dispensaries"
        target="_blank"
        rel="noopener noreferrer"
        className="weedmaps-btn"
      >
        Also search on Weedmaps ↗
      </a>

      {/* Map container — always rendered so mapRef is available */}
      <div
        className="map-container"
        ref={mapRef}
        style={{ display: status === 'manual' || status === 'error' ? 'none' : 'block' }}
      />

      {/* Manual location input */}
      {status === 'manual' && (
        <div style={{ background: 'var(--parch2)', border: '1.5px solid var(--border2)', borderRadius: 22, padding: '20px 18px', boxShadow: 'var(--shadow)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink3)', marginBottom: 14, lineHeight: 1.6 }}>
            Location access was denied. Enter your city or zip code to find dispensaries nearby.
          </div>
          <form onSubmit={handleManualSearch} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={manualInput}
              onChange={e => { setManualInput(e.target.value); setErrorMsg('') }}
              placeholder="City or zip code…"
              style={{
                flex: 1, padding: '11px 14px', borderRadius: 12,
                border: '1.5px solid var(--border2)', background: 'var(--parch)',
                fontSize: 13, fontWeight: 700, fontFamily: "'Mulish',sans-serif",
                color: 'var(--ink)', outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '11px 18px', borderRadius: 12,
                background: 'var(--emerald-l)', border: 'none',
                color: 'var(--parch)', fontSize: 12, fontWeight: 800,
                fontFamily: "'Mulish',sans-serif", cursor: 'pointer',
              }}
            >Search</button>
          </form>
          {errorMsg && (
            <div style={{ marginTop: 10, fontSize: 12, color: '#c0392b', fontWeight: 700 }}>{errorMsg}</div>
          )}
        </div>
      )}

      {/* Loading spinner */}
      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--ink4)', fontSize: 13, fontWeight: 700 }}>
          Finding dispensaries near you…
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{ background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.25)', borderRadius: 18, padding: '16px 18px', fontSize: 13, fontWeight: 700, color: '#c0392b' }}>
          {errorMsg || 'Something went wrong loading the map.'}
        </div>
      )}

      {/* Dispensary list */}
      {status === 'ready' && dispensaries.length > 0 && (
        <div>
          <div className="s-label" style={{ marginTop: 4, marginBottom: 10 }}>nearby dispensaries</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dispensaries.map(place => {
              const isOpen = place.opening_hours?.isOpen?.() ?? null
              const dist   = userCoords
                ? metersToMiles(distanceBetween(userCoords, { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() }))
                : null
              return (
                <div
                  key={place.place_id}
                  className="disp-card"
                  onClick={() => flyTo(place)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {place.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {place.rating && (
                        <span style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700 }}>
                          {starsText(place.rating)} {place.rating}
                        </span>
                      )}
                      {dist && (
                        <span style={{ fontSize: 11, color: 'var(--ink5)', fontWeight: 700 }}>{dist} mi</span>
                      )}
                    </div>
                  </div>
                  {isOpen !== null && (
                    <span className={`disp-open ${isOpen ? 'yes' : 'no'}`}>
                      {isOpen ? 'Open' : 'Closed'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {status === 'ready' && dispensaries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ink4)', fontSize: 13, fontWeight: 700 }}>
          No dispensaries found nearby. Try searching on Weedmaps.
        </div>
      )}
    </div>
  )
}
