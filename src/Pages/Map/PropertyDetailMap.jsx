// MapAddress.jsx
import React from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { withIdentityPoolId } from '@aws/amazon-location-utilities-auth-helper';

const REGION = 'ap-southeast-1';
const IDENTITY_POOL_ID = 'ap-southeast-1:fa2ef108-06d9-47ae-a216-dcdeb35f8359';
const MAP_NAME = 'explore.map.Grab';

const SAMPLE_PROPERTIES = [
    {
        id: 'BDS-001',
        title: 'Căn hộ 2PN Masteri An Phú',
        address: '159 Xa Lộ Hà Nội, Thảo Điền, TP.Thủ Đức',
        priceVND: 4200000000,
        areaM2: 70,
        coords: [106.7396, 10.8022]
    },
    {
        id: 'BDS-002',
        title: 'Nhà phố Lakeview City',
        address: 'Đ. Song Hành, An Phú, TP.Thủ Đức',
        priceVND: 9800000000,
        areaM2: 100,
        coords: [106.7785, 10.7906]
    },
    {
        id: 'BDS-003',
        title: 'Shophouse Vinhomes Grand Park',
        address: 'Nguyễn Xiển, Long Thạnh Mỹ, TP.Thủ Đức',
        priceVND: 12500000000,
        areaM2: 120,
        coords: [106.8397, 10.8407]
    }
];

export default function MapAddress() {
    const mapRef = React.useRef(null);
    const markersRef = React.useRef([]);
    const [selected, setSelected] = React.useState(null);
    
    React.useEffect(() => {
        let map;
        let cancelled = false;
        
        (async () => {
            const authHelper = await withIdentityPoolId(IDENTITY_POOL_ID, { region: REGION });
            const authOpts = authHelper.getMapAuthenticationOptions();
            const styleUrl = `https://maps.geo.${REGION}.amazonaws.com/maps/v0/maps/${MAP_NAME}/style-descriptor`;
            
            const signed = authOpts.transformRequest(styleUrl, 'Style');
            const ok = await fetch(signed.url, { headers: signed.headers }).then(r => r.ok);
            if (!ok || cancelled || !mapRef.current) return;
            
            map = new maplibregl.Map({
                container: mapRef.current,
                style: styleUrl,
                center: [106.78, 10.80],
                zoom: 12,
                ...authOpts
            });
            
            await new Promise(res => map.once('load', res));
            if (cancelled) return;
            
            markersRef.current = SAMPLE_PROPERTIES.map(p => {
                const m = new maplibregl.Marker().setLngLat(p.coords).addTo(map);
                m.getElement().style.cursor = 'pointer';
                m.getElement().addEventListener('click', async () => {
                    const detail = await fetchPropertyDetail(p.id);
                    setSelected({ ...p, ...detail });
                    map.easeTo({ center: p.coords, zoom: 14, duration: 600 });
                });
                return m;
            });
        })().catch(e => console.error('Map init error:', e));
        
        return () => {
            cancelled = true;
            markersRef.current.forEach(m => {
                try { m.remove(); } catch {}
            });
            markersRef.current = [];
            if (map) {
                try { map.remove(); } catch {}
            }
        };
    }, []);
    
    return (
        <div style={{ position: 'relative', height: '70vh', width: '100%', borderRadius: 12, overflow: 'hidden' }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        {selected && (
            <div
            style={{
                position: 'absolute',
                left: 16,
                bottom: 16,
                width: 360,
                background: 'white',
                borderRadius: 12,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                padding: 16,
                lineHeight: 1.45
            }}
            >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 8 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{selected.title}</h3>
            <button
            onClick={() => setSelected(null)}
            style={{
                border: 'none',
                background: '#f3f4f6',
                borderRadius: 8,
                padding: '6px 10px',
                cursor: 'pointer'
            }}
            >
            Đóng
            </button>
            </div>
            <div style={{ marginTop: 6, color: '#4b5563' }}>{selected.address}</div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Mã BĐS</div>
            <div style={{ fontWeight: 600 }}>{selected.id}</div>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Diện tích</div>
            <div style={{ fontWeight: 600 }}>{selected.areaM2} m²</div>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Giá</div>
            <div style={{ fontWeight: 700, color: '#065f46' }}>
            {Intl.NumberFormat('vi-VN').format(selected.priceVND)} đ
            </div>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Toạ độ</div>
            <div style={{ fontWeight: 600 }}>
            {selected.coords[1].toFixed(5)}, {selected.coords[0].toFixed(5)}
            </div>
            </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
            onClick={() => alert(`Gọi API xem chi tiết: ${selected.id}`)}
            style={{
                flex: 1,
                border: 'none',
                background: '#111827',
                color: 'white',
                borderRadius: 10,
                padding: '10px 12px',
                cursor: 'pointer',
                fontWeight: 600
            }}
            >
            Xem chi tiết
            </button>
            <button
            onClick={() => alert(`Gọi API đặt lịch xem: ${selected.id}`)}
            style={{
                flex: 1,
                border: '1px solid #e5e7eb',
                background: 'white',
                borderRadius: 10,
                padding: '10px 12px',
                cursor: 'pointer',
                fontWeight: 600
            }}
            >
            Đặt lịch
            </button>
            </div>
            </div>
        )}
        </div>
    );
}

function fetchPropertyDetail(id) {
    const extra = {
        'BDS-001': { bedrooms: 2, bathrooms: 2, direction: 'Đông Bắc' },
        'BDS-002': { bedrooms: 4, bathrooms: 3, direction: 'Tây Nam' },
        'BDS-003': { bedrooms: 3, bathrooms: 3, direction: 'Đông Nam' }
    };
    return Promise.resolve(extra[id] || {});
}
