import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ value, onChange, options, placeholder }) {
    const [open, setOpen] = useState(false);
    const ref = useRef();
    
    useEffect(() => {
        const handler = (e) => {
            if (!ref.current?.contains(e.target)) setOpen(false);
        };
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, []);
    
    const selectedLabel =
    options.find(o => o.value === value)?.label || placeholder;
    
    return (
        <div ref={ref} style={{ position: 'relative' }}>
        <div
        onClick={() => setOpen(!open)}
        style={{
            padding: '8px 10px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            cursor: 'pointer',
            background: 'white'
        }}
        >
        {selectedLabel}
        </div>
        
        {open && (
            <div
            style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                width: '100%',
                maxHeight: 200,
                overflowY: 'auto',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                zIndex: 50,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
            >
            <div
            onClick={() => {
                onChange('');
                setOpen(false);
            }}
            style={{
                padding: '8px',
                cursor: 'pointer',
                borderBottom: '1px solid #eee'
            }}
            >
            -- Tất cả --
            </div>
            
            {options.map((o) => (
                <div
                key={o.value}
                onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                }}
                style={{
                    padding: '8px',
                    cursor: 'pointer'
                }}
                >
                {o.label}
                </div>
            ))}
            </div>
        )}
        </div>
    );
}
