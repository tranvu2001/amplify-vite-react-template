import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { withIdentityPoolId } from '@aws/amazon-location-utilities-auth-helper';
import PropertyServices from '../../axios/PropertyServices';

const REGION = 'ap-southeast-1';
const IDENTITY_POOL_ID = 'ap-southeast-1:fa2ef108-06d9-47ae-a216-dcdeb35f8359';
const MAP_NAME = 'explore.map.Grab';
const STYLE_URL = `https://maps.geo.${REGION}.amazonaws.com/maps/v0/maps/${MAP_NAME}/style-descriptor`;

const TYPES = ['Căn hộ', 'Nhà phố', 'Văn phòng', 'Shophouse'];
const STATUSES = ['Đang thuê', 'Đang trống', 'Đã đặt cọc'];

const groupBy = (arr, key) =>
    arr.reduce((acc, cur) => ((acc[cur[key]] = acc[cur[key]] || []).push(cur), acc), {});
const avgCoords = (arr) => {
    const sum = arr.reduce((s, p) => [s[0] + p.coords[0], s[1] + p.coords[1]], [0, 0]);
    return [sum[0] / arr.length, sum[1] / arr.length];
};

export default function PropertyMapWithFilters() {
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const mapObjRef = useRef(null);
    
    const [selected, setSelected] = useState(null);
    const [stack, setStack] = useState([]);
    const [level, setLevel] = useState('country');
    
    const [filters, setFilters] = useState({
        province: '',
        ward: '',
        types: [],
        statuses: [],
        priceMin: '',
        priceMax: ''
    });
    
    const [properties, setProperties] = useState([]);
    
    useEffect(() => {
        PropertyServices.getAllProperties()
        .then((res) => {
            const data = Array.isArray(res.data) ? res.data : [];
            const mapped = data
            .filter((p) => p.lat && p.lng)
            .map((p) => ({
                id: p.propertyId || p.id,
                title: p.title || `BĐS ${p.propertyId || ''}`,
                address: p.address || '',
                province: p.province || p.city || '',
                ward: p.ward || '',
                type: p.type || '',
                status: p.status || '',
                priceVND: p.priceVND ?? p.price ?? 0,
                areaM2: p.areaM2 ?? p.area ?? 0,
                coords: [Number(p.lng), Number(p.lat)]
            }));
            setProperties(mapped);
        })
        .catch((e) => {
            console.error('load properties error', e);
            setProperties([]);
        });
    }, []);
    
    const provinces = useMemo(
        () => Array.from(new Set(properties.map((p) => p.province).filter(Boolean))),
        [properties]
    );
    
    const wards = useMemo(() => {
        const base = filters.province
        ? properties.filter((p) => p.province === filters.province)
        : properties;
        return Array.from(new Set(base.map((p) => p.ward).filter(Boolean)));
    }, [filters.province, properties]);
    
    const filteredProps = useMemo(() => {
        const min = filters.priceMin ? Number(filters.priceMin) : -Infinity;
        const max = filters.priceMax ? Number(filters.priceMax) : Infinity;
        return properties.filter((p) => {
            if (filters.province && p.province !== filters.province) return false;
            if (filters.ward && p.ward !== filters.ward) return false;
            if (filters.types.length && !filters.types.includes(p.type)) return false;
            if (filters.statuses.length && !filters.statuses.includes(p.status)) return false;
            if (!(p.priceVND >= min && p.priceVND <= max)) return false;
            return true;
        });
    }, [filters, properties]);
    
    const getProvinceCenter = (name) => {
        const base = properties.filter((p) => p.province === name);
        if (!base.length) return null;
        return avgCoords(base);
    };
    
    const getWardCenter = (provinceName, wardName) => {
        const base = properties.filter((p) => p.province === provinceName && p.ward === wardName);
        if (!base.length) return null;
        return avgCoords(base);
    };
    
    const NATIONAL_VIEW = { center: [106, 16], zoom: 5 };

    
    useEffect(() => {
        let cancelled = false;
        
        (async () => {
            const authHelper = await withIdentityPoolId(IDENTITY_POOL_ID, { region: REGION });
            const authOpts = authHelper.getMapAuthenticationOptions();
            const signed = authOpts.transformRequest(STYLE_URL, 'Style');
            const ok = await fetch(signed.url, { headers: signed.headers })
            .then((r) => r.ok)
            .catch(() => false);
            if (!ok || cancelled || !mapRef.current) return;
            
            const map = new maplibregl.Map({
                container: mapRef.current,
                style: STYLE_URL,
                ...NATIONAL_VIEW,
                ...authOpts
            });
            mapObjRef.current = map;
            
            await new Promise((res) => map.once('load', res));
            if (cancelled) return;
        })();
        
        return () => {
            cancelled = true;
            clearMarkers();
            if (mapObjRef.current) try { mapObjRef.current.remove(); } catch (e) {}
            mapObjRef.current = null;
        };
    }, []);
    
    const clearMarkers = () => {
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
    };
    
    const drawProvinceMarkers = () => {
        if (!mapObjRef.current) return;
        const map = mapObjRef.current;
        clearMarkers();
        setLevel('country');
        
        const provincesGrouped = groupBy(filteredProps, 'province');
        Object.entries(provincesGrouped).forEach(([province, props]) => {
            const coords = avgCoords(props);
            const marker = new maplibregl.Marker().setLngLat(coords).addTo(map);
            marker.getElement().style.cursor = 'pointer';
            marker.getElement().addEventListener('click', () => {
                setSelected({
                    title: province,
                    scope: 'province',
                    props,
                    coords,
                    actions: [
                        {
                            label: 'Xem chi tiết',
                            callback: () => {
                                setStack((s) => [...s, { fn: drawProvinceMarkers, prevFilters: { ...filters } }]);
                                setFilters((f) => ({ ...f, province, ward: '' }));
                                map.flyTo({ center: coords, zoom: 11 });
                                setTimeout(() => drawWardMarkers(province), 0);
                            }
                        }
                    ]
                });
            });
            markersRef.current.push(marker);
        });
    };
    
    const drawWardMarkers = (province) => {
        if (!mapObjRef.current) return;
        const map = mapObjRef.current;
        clearMarkers();
        setLevel('province');
        
        const base = filteredProps.filter((p) => p.province === province);
        const wardsGrouped = groupBy(base, 'ward');
        
        Object.entries(wardsGrouped).forEach(([ward, props]) => {
            const coords = avgCoords(props);
            const marker = new maplibregl.Marker().setLngLat(coords).addTo(map);
            marker.getElement().style.cursor = 'pointer';
            marker.getElement().addEventListener('click', () => {
                setSelected({
                    title: ward,
                    scope: 'ward',
                    props,
                    coords,
                    actions: [
                        {
                            label: 'Xem chi tiết',
                            callback: () => {
                                setStack((s) => [...s, { fn: () => drawWardMarkers(province), prevFilters: { ...filters } }]);
                                setFilters((f) => ({ ...f, province, ward }));
                                map.flyTo({ center: coords, zoom: 14 });
                                setTimeout(() => drawPropertyMarkers(props), 0);
                            }
                        }
                    ]
                });
            });
            markersRef.current.push(marker);
        });
    };
    
    const drawPropertyMarkers = (props) => {
        if (!mapObjRef.current) return;
        const map = mapObjRef.current;
        clearMarkers();
        setLevel('ward');
        
        props.forEach((p) => {
            const marker = new maplibregl.Marker().setLngLat(p.coords).addTo(map);
            marker.getElement().style.cursor = 'pointer';
            marker.getElement().addEventListener('click', () =>
                setSelected({ title: p.title, ...p, scope: 'property' })
        );
        markersRef.current.push(marker);
    });
};

useEffect(() => {
    if (!mapObjRef.current) return;
    if (!filteredProps.length) {
        clearMarkers();
        setSelected(null);
        return;
    }
    
    if (!filters.province && !filters.ward) {
        setLevel('country');
        drawProvinceMarkers();
        return;
    }
    
    if (filters.province && !filters.ward) {
        setLevel('province');
        drawWardMarkers(filters.province);
        return;
    }
    
    if (filters.province && filters.ward) {
        const base = filteredProps.filter(
            (p) => p.province === filters.province && p.ward === filters.ward
        );
        setLevel('ward');
        drawPropertyMarkers(base);
    }
}, [filteredProps, filters.province, filters.ward]);

useEffect(() => {
    if (!mapObjRef.current) return;
    const map = mapObjRef.current;
    
    if (!filters.province) {
        setLevel('country');
        setStack([]);
        setSelected(null);
        map.flyTo({ ...NATIONAL_VIEW });
        drawProvinceMarkers();
        return;
    }
    
    const pCenter = getProvinceCenter(filters.province);
    if (pCenter) {
        map.flyTo({ center: pCenter, zoom: filters.ward ? 14 : 11 });
    }
    
    if (!filters.ward) {
        setLevel('province');
        setStack([]);
        setSelected(null);
        drawWardMarkers(filters.province);
    }
}, [filters.province]);

useEffect(() => {
    if (!mapObjRef.current) return;
    if (!filters.province) return;
    if (!filters.ward) return;
    
    const map = mapObjRef.current;
    const wCenter = getWardCenter(filters.province, filters.ward);
    if (wCenter) map.flyTo({ center: wCenter, zoom: 14 });
    
    const base = filteredProps.filter(
        (p) => p.province === filters.province && p.ward === filters.ward
    );
    setLevel('ward');
    setStack([]);
    setSelected(null);
    drawPropertyMarkers(base);
}, [filters.ward, filters.province, filteredProps]);

const goBack = () => {
    const item = stack[stack.length - 1];
    if (!item) return;
    const newStack = stack.slice(0, -1);
    setStack(newStack);
    setFilters(item.prevFilters);
    setSelected(null);
    setTimeout(() => item.fn(), 0);
};

const resetFilters = () => {
    setFilters({ province: '', ward: '', types: [], statuses: [], priceMin: '', priceMax: '' });
};

return (
    <div style={{ position: 'relative', height: 'calc(100vh - 100px)', width: '100%' }}>
    <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    
    <div
    style={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 360,
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        padding: 16
    }}
    >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
    <h3 style={{ margin: 0, fontSize: 16 }}>Bộ lọc</h3>
    <button
    onClick={resetFilters}
    style={{
        border: 'none',
        background: '#eef2ff',
        borderRadius: 8,
        padding: '6px 10px',
        cursor: 'pointer'
    }}
    >
    Xoá lọc
    </button>
    </div>
    
    <label style={{ fontSize: 12, color: '#6b7280' }}>Tỉnh/TP</label>
    <select
    value={filters.province}
    onChange={(e) => setFilters((f) => ({ ...f, province: e.target.value, ward: '' }))}
    style={{
        width: '100%',
        margin: '4px 0 10px 0',
        padding: '8px',
        borderRadius: 8,
        border: '1px solid #e5e7eb'
    }}
    >
    <option value="">-- Tất cả --</option>
    {provinces.map((p) => (
        <option key={p} value={p}>
        {p}
        </option>
    ))}
    </select>
    
    <label style={{ fontSize: 12, color: '#6b7280' }}>Phường/Xã</label>
    <select
    value={filters.ward}
    onChange={(e) => setFilters((f) => ({ ...f, ward: e.target.value }))}
    style={{
        width: '100%',
        margin: '4px 0 10px 0',
        padding: '8px',
        borderRadius: 8,
        border: '1px solid #e5e7eb'
    }}
    >
    <option value="">-- Tất cả --</option>
    {wards.map((w) => (
        <option key={w} value={w}>
        {w}
        </option>
    ))}
    </select>
    
    <div style={{ marginTop: 6 }}>
    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Loại BĐS</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {TYPES.map((t) => {
        const active = filters.types.includes(t);
        return (
            <button
            key={t}
            onClick={() =>
                setFilters((f) => ({
                    ...f,
                    types: active ? f.types.filter((x) => x !== t) : [...f.types, t]
                }))
            }
            style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                background: active ? '#111827' : 'white',
                color: active ? 'white' : '#111827'
            }}
            >
            {t}
            </button>
        );
    })}
    </div>
    </div>
    
    <div style={{ marginTop: 10 }}>
    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Tình trạng</div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
    {STATUSES.map((s) => {
        const active = filters.statuses.includes(s);
        return (
            <button
            key={s}
            onClick={() =>
                setFilters((f) => ({
                    ...f,
                    statuses: active ? f.statuses.filter((x) => x !== s) : [...f.statuses, s]
                }))
            }
            style={{
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                background: active ? '#111827' : 'white',
                color: active ? 'white' : '#111827'
            }}
            >
            {s}
            </button>
        );
    })}
    </div>
    </div>
    
    <div style={{ marginTop: 10 }}>
    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Khoảng giá (VND)</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
    <input
    type="number"
    placeholder="Tối thiểu"
    value={filters.priceMin}
    onChange={(e) => setFilters((f) => ({ ...f, priceMin: e.target.value }))}
    style={{ padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb' }}
    />
    <input
    type="number"
    placeholder="Tối đa"
    value={filters.priceMax}
    onChange={(e) => setFilters((f) => ({ ...f, priceMax: e.target.value }))}
    style={{ padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb' }}
    />
    </div>
    </div>
    
    <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
    Kết quả: <b>{filteredProps.length}</b> bất động sản phù hợp
    </div>
    </div>
    
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
            padding: 16
        }}
        >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>{selected.title}</h3>
        <button
        onClick={() => setSelected(null)}
        style={{ border: 'none', background: '#eee', borderRadius: 8, padding: '6px 10px' }}
        >
        Đóng
        </button>
        </div>
        {selected.scope !== 'property' ? (
            <>
            <div style={{ marginTop: 6, fontSize: 14 }}>Tổng BĐS: {selected.props.length}</div>
            <div style={{ marginTop: 6, fontSize: 14 }}>
            Giá trị tổng:{' '}
            {Intl.NumberFormat('vi-VN').format(
                selected.props.reduce((s, p) => s + (p.priceVND ?? 0), 0)
            )}{' '}
            đ
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            {selected.actions?.map((a, i) => (
                <button
                key={i}
                onClick={a.callback}
                style={{
                    flex: 1,
                    background: '#111827',
                    color: 'white',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 12px',
                    cursor: 'pointer'
                }}
                >
                {a.label}
                </button>
            ))}
            </div>
            </>
        ) : (
            <>
            <div style={{ marginTop: 6 }}>{selected.address}</div>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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
            </div>
            <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Loại</div>
            <div style={{ fontWeight: 600 }}>{selected.type}</div>
            </div>
            <div style={{ background: '#f9fafb', borderRadius: 8, padding: 10 }}>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Tình trạng</div>
            <div style={{ fontWeight: 600 }}>{selected.status}</div>
            </div>
            </div>
            </>
        )}
        </div>
    )}
    
    {stack.length > 0 && (
        <button
        onClick={goBack}
        style={{
            position: 'absolute',
            top: 16,
            left: 16,
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: 8,
            padding: '6px 10px',
            cursor: 'pointer'
        }}
        >
        Quay lại
        </button>
    )}
    </div>
);
}
