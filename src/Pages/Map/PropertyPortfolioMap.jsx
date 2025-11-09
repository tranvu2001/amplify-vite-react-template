import React from 'react';
import { Flex } from '@aws-amplify/ui-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import FormSchema from '../../Components/Form/FormSchema';
import FormRenderer from '../../Components/Form/FormRenderer';
import { FormGlobal } from '../../Components/Form/FormGlobal';
import LocationService from '../../axios/LocationService';
import PropertyServices from '../../axios/PropertyServices';
// import StaffServices from '@/axios/StaffServices';
// import PropertyTypeServices from '@/axios/PropertyTypeServices';

export default function PropertyMap() {
    const form = React.useMemo(() => new FormSchema(), []);
    FormGlobal.form = form;

    let filterGroup = form.addGroup('Bộ lọc bản đồ');
    form.addField(filterGroup, { type: 'select', name: 'province', label: 'Tỉnh/TP', startRow: true, options: [] });
    form.addField(filterGroup, { type: 'select', name: 'district', label: 'Quận/Huyện', options: [] });
    form.addField(filterGroup, { type: 'multiselect', name: 'propertyTypeIds', label: 'Loại bất động sản', startRow: true, options: [] });
    form.addField(filterGroup, { type: 'multiselect', name: 'staffIds', label: 'Nhân viên phụ trách', options: [] });
    
    let actionGroup = form.addGroup('Action');
    form.addButton(actionGroup, { name: 'btnSearch', label: 'Tìm kiếm', variation: 'primary', onClick: () => onSearchResult() });
    
    let resultGroup = form.addGroup('Results');
    form.addField(resultGroup, { type: 'custom', name: 'mapSlot', render: () => null, fullRow: true });
    
    const districtCacheRef = React.useRef(new Map());
    const wardCacheRef = React.useRef(new Map());
    const mapRef = React.useRef(null);
    const mapObjRef = React.useRef(null);
    const markersRef = React.useRef([]);
    const allPropsRef = React.useRef([]);
    
    React.useEffect(() => {
        const ac = new AbortController();
        (async () => {
            const provinces = await LocationService.getProvinces({ signal: ac.signal });
            form.updateSourceField('province', { options: [
                { id:'province_all', name: 'Chọn Tỉnh/ TP' }, ...provinces
            ]});
            
            form._invalidate?.();
        })().catch(() => {});
        return () => ac.abort();
    }, [form]);
    
    React.useEffect(() => {
        const ac = new AbortController();
        (async () => {
            const res = await PropertyServices.getAllProperties({ signal: ac.signal });
            const list = (res.data ?? res)
            .filter(p => p.longitude && p.latitude)
            .map(p => ({
                id: p.propertyId,
                title: p.title,
                typeId: p.propertyTypeId,
                staffId: p.staffId,
                provinceCode: String(p.provinceCode ?? ''),
                districtCode: String(p.districtCode ?? ''),
                wardCode: String(p.wardCode ?? ''),
                lng: Number(p.longitude),
                lat: Number(p.latitude),
            }));
            allPropsRef.current = list;
            
            if (!mapObjRef.current && mapRef.current) {
                const map = new maplibregl.Map({
                    container: mapRef.current,
                    style: 'https://demotiles.maplibre.org/style.json',
                    center: [106.700981, 10.776889],
                    zoom: 10,
                });
                mapObjRef.current = map;
                drawMarkers(list);
            }
        })().catch(() => {});
        return () => ac.abort();
    }, []);
    
    const handlers = React.useMemo(() => ({
        async onFieldChange(name, value) {debugger
            if (name === 'province') {
                form.setFieldValue?.('district', '');
                form.updateSourceField('district', { options: [] });

                if (!value) return form._invalidate?.();

                let districts = districtCacheRef.current.get(value);
                if (!districts) {
                    districts = await LocationService.getDistrictsByProvince(value);
                    districtCacheRef.current.set(value, districts);
                }

                form.updateSourceField('district', { options: [
                    { id: 'district_all', name: 'Chọn Quận/ Huyện'}, ...districts
                ] });
                form._invalidate?.();
            }
        }
    }), [form]);
    
    return (
        <Flex direction="column" padding="1rem" gap="1rem">
        <h1>Bản đồ tài sản theo bộ lọc</h1>
        <FormRenderer schema={form} handlers={handlers} />
        <div style={{ height: 520, borderRadius: 12, overflow: 'hidden', border: '1px solid #e5e7eb', background: '#f8fafc' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        </div>
        </Flex>
    );
}

const onSearchResult = () => {
    const form = FormGlobal.form;
    let params = form.getParameter();
}


    
    // const onSearch = React.useCallback(() => {
    //     const province = String(form.getFieldValue?.('province') ?? '');
    //     const district = String(form.getFieldValue?.('district') ?? '');
    //     const ward = String(form.getFieldValue?.('ward') ?? '');
    //     const typeIds = form.getFieldValue?.('propertyTypeIds') || [];
    //     const staffIds = form.getFieldValue?.('staffIds') || [];
    //     let list = allPropsRef.current;
    //     if (province) list = list.filter(p => p.provinceCode === province);
    //     if (district) list = list.filter(p => p.districtCode === district);
    //     if (ward) list = list.filter(p => p.wardCode === ward);
    //     if (typeIds.length) list = list.filter(p => typeIds.includes(p.typeId));
    //     if (staffIds.length) list = list.filter(p => staffIds.includes(p.staffId));
    //     drawMarkers(list);
    // }, [form]);
    
    // function clearMarkers() {
    //     markersRef.current.forEach(m => m.remove());
    //     markersRef.current = [];
    // }
    
    // function drawMarkers(list) {
    //     const map = mapObjRef.current;
    //     if (!map) return;
    //     clearMarkers();
    //     if (!list.length) return;
    //     const bounds = new maplibregl.LngLatBounds();
    //     list.forEach(p => {
    //         const el = document.createElement('div');
    //         el.style.width = '14px';
    //         el.style.height = '14px';
    //         el.style.borderRadius = '50%';
    //         el.style.background = '#2563eb';
    //         el.style.boxShadow = '0 0 0 2px #fff';
    //         const marker = new maplibregl.Marker({ element: el })
    //         .setLngLat([p.lng, p.lat])
    //         .setPopup(new maplibregl.Popup({ offset: 12 }).setHTML(`<div style="font-size:12px"><b>${p.title}</b><br/>Type: ${p.typeId ?? '-'}<br/>Staff: ${p.staffId ?? '-'}</div>`))
    //         .addTo(map);
    //         markersRef.current.push(marker);
    //         bounds.extend([p.lng, p.lat]);
    //     });
    //     if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 44, duration: 400 });
    // }
