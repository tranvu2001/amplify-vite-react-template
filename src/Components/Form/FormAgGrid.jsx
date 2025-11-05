import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';


export default function AgGridField({ field, onChange }) {
    const { name, label, columns = [], rows = [], options = {} } = field;
    const [rowData, setRowData] = useState(rows);
    
    useEffect(() => { setRowData(rows || []); }, [rows]);
    
    const colDefs = useMemo(() => columns.map(c => ({
        field: c.key,
        headerName: c.label ?? c.name ?? c.key,
        editable: c.editable ?? true,
        width: c.width || 100,
        minWidth: c.width || 100,
        flex: c.flex,
        valueFormatter: c.dataType === 'number'
        ? (p) => {
            if (p.value == null || p.value === '') return '';
            const fmt = c.format || { locale: 'vi-VN', minimumFractionDigits: 0, maximumFractionDigits: 2 };
            return new Intl.NumberFormat(fmt.locale, fmt).format(Number(p.value));
        }
        : undefined,
        valueParser: c.dataType === 'number'
        ? (p) => {
            const v = String(p.newValue ?? '').replace(/[^\d.-]/g, '');
            const n = Number(v);
            return isNaN(n) ? null : n;
        }
        : undefined
    })), [columns]);
    
    const onCellValueChanged = useCallback(() => {
        onChange?.(name, rowData);
    }, [name, onChange, rowData]);
    
    return (
        <div style={{ gridColumn: '1 / -1', marginBottom: 12 }}>
        {label && <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>}
        <div className="ag-theme-quartz" style={{ height: options.height || 360, width: '100%' }}>
        <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        onCellValueChanged={onCellValueChanged}
        onRowDataUpdated={onCellValueChanged}
        onRowDataChanged={onCellValueChanged}
        pagination={options.pagination ?? true}
        rowSelection="multiple"
        suppressRowClickSelection
        stopEditingWhenCellsLoseFocus
        onGridReady={() => onChange?.(name, rowData)}
        />
        </div>
        </div>
    );
}
