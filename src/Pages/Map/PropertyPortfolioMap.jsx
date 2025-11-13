import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { withIdentityPoolId } from '@aws/amazon-location-utilities-auth-helper';
import LocationService from "../../axios/LocationService";
import CustomSelect from "../../Components/Select/Select"
import PropertyServices from "../../axios/PropertyServices";


const REGION = 'ap-southeast-1';
const IDENTITY_POOL_ID = 'ap-southeast-1:fa2ef108-06d9-47ae-a216-dcdeb35f8359';
const MAP_NAME = 'explore.map.Grab';
const STYLE_URL = `https://maps.geo.${REGION}.amazonaws.com/maps/v0/maps/${MAP_NAME}/style-descriptor`;

const TYPES = ['Căn hộ', 'Nhà phố', 'Văn phòng', 'Shophouse'];
const STATUSES = ['Đang thuê', 'Đang trống', 'Đã đặt cọc'];

// function genProps() {
//   const out = [];
//   for (let i = 1; i <= 40; i++) {
//     out.push({
//       id: `BDS-${String(i).padStart(3, '0')}`,
//       title: `BĐS mẫu ${i}`,
//       address: `Phường 1`,
//       province: '79',
//       ward: '760001',
//       type: TYPES[i % TYPES.length],
//       status: STATUSES[i % STATUSES.length],
//       priceVND: 1500000000 + i * 250000000,
//       areaM2: 45 + (i % 15) * 5,
//       coords: [106.7 + (i % 5) * 0.01, 10.78 + (i % 4) * 0.01]
//     });
//   }
//   return out;
// }

// const PROPERTIES = []

// `
// {
//   "propertyId": {
//     "S": "pty030"
//   },
//   "address": {
//     "S": "KĐT Splendora Bắc An Khánh"
//   },
//   "createdAt": {
//     "S": "2025-10-05T04:30:00Z"
//   },
//   "currency": {
//     "S": "VND"
//   },
//   "lat": {
//     "N": "21.02039"
//   },
//   "listingType": {
//     "S": "SALE"
//   },
//   "lng": {
//     "N": "105.73579"
//   },
//   "ownerId": {
//     "S": "usr#011"
//   },
//   "priceVND": {
//     "N": "9500000000"
//   },
//   "province": {
//     "S": "Thành phố Hà Nội"
//   },
//   "status": {
//     "S": "Đang bán"
//   },
//   "title": {
//     "S": "Nhà liền kề KĐT Splendora"
//   },
//   "type": {
//     "S": "Nhà phố"
//   },
//   "updatedAt": {
//     "S": "2025-10-05T04:30:00Z"
//   },
//   "ward": {
//     "S": "Xã An Khánh"
//   }
// }
// `

const groupBy = (arr, key) =>
    arr.reduce((acc, cur) => ((acc[cur[key]] = acc[cur[key]] || []).push(cur), acc), {});
const avgCoords = (arr) => {
    const sum = arr.reduce((s, p) => [s[0] + p.coords[0], s[1] + p.coords[1]], [0, 0]);
    return [sum[0] / arr.length, sum[1] / arr.length];
};

export default function PropertyMapWithFilters() {debugger
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const mapObjRef = useRef(null);
    
    const [selected, setSelected] = useState(null);
    const [stack, setStack] = useState([]);
    const [level, setLevel] = useState('country');
    
    const [provinceList, setProvinceList] = useState([]);
    const [provinceCodeByName, setProvinceCodeByName] = useState({});

    const [wardList, setWardList] = useState([]);
    
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
        (async () => {
            const res = await PropertyServices.getAllProperties();
            setProperties(res.data);
        })();
    }, []);

    
    useEffect(() => {
        (async () => {
            const data = await LocationService.getProvinces();
            setProvinceList(
            data.map(p => ({ value: p.name, label: p.name }))
            );
            setProvinceCodeByName(
            data.reduce((acc, p) => {
                acc[p.name] = p.id;
                return acc;
            }, {})
            );
        })();
    }, []);

    
    useEffect(() => {
        if (!filters.province) {
            setWardList([]);
            return;
        }
        (async () => {
            const provinceCode = provinceCodeByName[filters.province];
            if (!provinceCode) {
            setWardList([]);
            return;
            }
            const data = await LocationService.getWardsByProvince(provinceCode);
            setWardList(
            data.map(w => ({ value: w.name, label: w.name }))
            );
        })();
    }, [filters.province, provinceCodeByName]);

    
    const filteredProps = useMemo(() => {
        const min = filters.priceMin ? Number(filters.priceMin) : -Infinity;
        const max = filters.priceMax ? Number(filters.priceMax) : Infinity;
        return properties.filter(p => {
            if (filters.province && p.province !== filters.province) return false;
            if (filters.ward && p.ward !== filters.ward) return false;
            if (filters.types.length && !filters.types.includes(p.type)) return false;
            if (filters.statuses.length && !filters.statuses.includes(p.status)) return false;
            if (!(p.priceVND >= min && p.priceVND <= max)) return false;
            return true;
        });
    }, [filters, properties]);
    
    const NATIONAL_VIEW = { center: [106.8, 10.8], zoom: 5 };
    
    useEffect(() => {
        let cancelled = false;
        (async () => {
            const authHelper = await withIdentityPoolId(IDENTITY_POOL_ID, { region: REGION });
            const authOpts = authHelper.getMapAuthenticationOptions();
            const signed = authOpts.transformRequest(STYLE_URL, 'Style');
            const ok = await fetch(signed.url, { headers: signed.headers }).then(r => r.ok).catch(() => false);
            if (!ok || cancelled || !mapRef.current) return;
            
            const map = new maplibregl.Map({
                container: mapRef.current,
                style: STYLE_URL,
                ...NATIONAL_VIEW,
                ...authOpts
            });
            mapObjRef.current = map;
            
            await new Promise(res => map.once('load', res));
            if (cancelled) return;
            
            drawProvinceMarkers();
        })();
        
        return () => {
            cancelled = true;
            clearMarkers();
            if (mapObjRef.current) try { mapObjRef.current.remove(); } catch {}
            mapObjRef.current = null;
        };
    }, []);
    
    const clearMarkers = () => {
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
    };
    
    const drawProvinceMarkers = () => {
        if (!mapObjRef.current) return;
        const map = mapObjRef.current;
        clearMarkers();
        setLevel('country');
        
        const provincesGrouped = groupBy(filteredProps, 'province');
        Object.entries(provincesGrouped).forEach(([provinceCode, props]) => {
            const coords = avgCoords(props);
            const marker = new maplibregl.Marker().setLngLat(coords).addTo(map);
            marker.getElement().style.cursor = 'pointer';
            marker.getElement().addEventListener('click', () => {
                const provinceName = provinceList.find(x => x.id === provinceCode)?.name || provinceCode;
                setSelected({
                    title: provinceName,
                    scope: 'province',
                    props,
                    coords,
                    actions: [{
                        label: 'Xem chi tiết',
                        callback: () => {
                            setStack(s => [...s, { fn: drawProvinceMarkers, prevFilters: { ...filters } }]);
                            setFilters(f => ({ ...f, province: provinceCode, ward: '' }));
                            map.flyTo({ center: coords, zoom: 11 });
                            setTimeout(() => drawWardMarkers(provinceCode), 0);
                        }
                    }]
                });
            });
            markersRef.current.push(marker);
        });
    };
    
    const drawWardMarkers = (provinceCode) => {
        if (!mapObjRef.current) return;
        const map = mapObjRef.current;
        clearMarkers();
        setLevel('province');
        
        const base = filteredProps.filter(p => p.province === provinceCode);
        const wardsGrouped = groupBy(base, 'ward');
        
        Object.entries(wardsGrouped).forEach(([wardCode, props]) => {
            const coords = avgCoords(props);
            const wardName = wardList.find(x => x.id === wardCode)?.name || wardCode;
            const marker = new maplibregl.Marker().setLngLat(coords).addTo(map);
            marker.getElement().style.cursor = 'pointer';
            marker.getElement().addEventListener('click', () => {
                setSelected({
                    title: wardName,
                    scope: 'ward',
                    props,
                    coords,
                    actions: [{
                        label: 'Xem chi tiết',
                        callback: () => {
                            setStack(s => [...s, { fn: () => drawWardMarkers(provinceCode), prevFilters: { ...filters } }]);
                            setFilters(f => ({ ...f, province: provinceCode, ward: wardCode }));
                            map.flyTo({ center: coords, zoom: 14 });
                            setTimeout(() => drawPropertyMarkers(props), 0);
                        }
                    }]
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
        
        props.forEach(p => {
            const marker = new maplibregl.Marker().setLngLat(p.coords).addTo(map);
            marker.getElement().style.cursor = 'pointer';
            marker.getElement().addEventListener('click', () => setSelected({ title: p.title, ...p, scope: 'property' }));
            markersRef.current.push(marker);
        });
    };
    
    useEffect(() => {
        if (!mapObjRef.current) return;
        if (level === 'country') drawProvinceMarkers();
        else if (level === 'province') drawWardMarkers(filters.province || '');
        else if (level === 'ward') {
            const base = filteredProps.filter(
                p => (!filters.province || p.province === filters.province) &&
                (!filters.ward || p.ward === filters.ward)
            );
            drawPropertyMarkers(base);
        }
    }, [filteredProps]);
    
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
        
        const base = properties.filter(p => p.province === filters.province);
        if (base.length) {
            const center = avgCoords(base);
            map.flyTo({ center, zoom: filters.ward ? 14 : 11 });
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
        const base = filteredProps.filter(p => p.province === filters.province && p.ward === filters.ward);
        if (base.length) {
            const center = avgCoords(base);
            map.flyTo({ center, zoom: 14 });
        }
        setLevel('ward');
        setStack([]);
        setSelected(null);
        drawPropertyMarkers(base);
    }, [filters.ward]);
    
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
        <div style={{ position: 'relative', height: window.innerHeight - 100 + 'px', width: '100%' }}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
        
        <div style={{ position: 'absolute', top: 16, right: 16, width: 360, background: 'white', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Bộ lọc</h3>
        <button onClick={resetFilters} style={{ border: 'none', background: '#eef2ff', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Xoá lọc</button>
        </div>
        
        <label style={{ fontSize: 12, color: '#6b7280' }}>Tỉnh/TP</label>
        <CustomSelect
            value={filters.province}
            onChange={(val) => setFilters(f => ({ ...f, province: val, ward: '' }))}
            placeholder="-- Tất cả --"
            options={provinceList}
        />
        
        <label style={{ fontSize: 12, color: '#6b7280' }}>Phường/Xã</label>
        <CustomSelect
            value={filters.ward}
            onChange={(val) => setFilters(f => ({ ...f, ward: val }))}
            placeholder="-- Tất cả --"
            options={wardList}
        />
        
        <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Loại BĐS</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {TYPES.map(t => {
            const active = filters.types.includes(t);
            return (
                <button
                key={t}
                onClick={() => setFilters(f => ({
                    ...f,
                    types: active ? f.types.filter(x => x !== t) : [...f.types, t]
                }))}
                style={{
                    padding: '6px 10px', borderRadius: 999, border: '1px solid #e5e7eb', cursor: 'pointer',
                    background: active ? '#111827' : 'white', color: active ? 'white' : '#111827'
                }}
                >{t}</button>
            );
        })}
        </div>
        </div>
        
        <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>Tình trạng</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {STATUSES.map(s => {
            const active = filters.statuses.includes(s);
            return (
                <button
                key={s}
                onClick={() => setFilters(f => ({
                    ...f,
                    statuses: active ? f.statuses.filter(x => x !== s) : [...f.statuses, s]
                }))}
                style={{
                    padding: '6px 10px', borderRadius: 999, border: '1px solid #e5e7eb', cursor: 'pointer',
                    background: active ? '#111827' : 'white', color: active ? 'white' : '#111827'
                }}
                >{s}</button>
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
        onChange={(e) => setFilters(f => ({ ...f, priceMin: e.target.value }))}
        style={{ padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <input
        type="number"
        placeholder="Tối đa"
        value={filters.priceMax}
        onChange={(e) => setFilters(f => ({ ...f, priceMax: e.target.value }))}
        style={{ padding: '8px', borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        </div>
        </div>
        
        <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
        Kết quả: <b>{filteredProps.length}</b> bất động sản phù hợp
        </div>
        </div>
        
        {selected && (
            <div style={{ position: 'absolute', left: 16, bottom: 16, width: 360, background: 'white', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0 }}>{selected.title}</h3>
            <button onClick={() => setSelected(null)} style={{ border: 'none', background: '#eee', borderRadius: 8, padding: '6px 10px' }}>Đóng</button>
            </div>
            
            {selected.scope !== 'property' ? (
                <>
                <div style={{ marginTop: 6, fontSize: 14 }}>Tổng BĐS: {selected.props.length}</div>
                <div style={{ marginTop: 6, fontSize: 14 }}>
                Giá trị tổng: {Intl.NumberFormat('vi-VN').format(selected.props.reduce((s, p) => s + p.priceVND, 0))} đ
                </div>
                <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {selected.actions?.map((a, i) => (
                    <button key={i} onClick={a.callback} style={{ flex: 1, background: '#111827', color: 'white', border: 'none', borderRadius: 10, padding: '10px 12px', cursor: 'pointer' }}>{a.label}</button>
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
                <div style={{ fontWeight: 700, color: '#065f46' }}>{Intl.NumberFormat('vi-VN').format(selected.priceVND)} đ</div>
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
            <button onClick={goBack} style={{ position: 'absolute', top: 16, left: 16, background: 'white', border: '1px solid #ccc', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>Quay lại</button>
        )}
        </div>
    );
}
