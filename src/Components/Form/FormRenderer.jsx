import React from 'react';
import {
    Flex, Grid, Fieldset, TextField, SelectField, Button,
    Table, TableBody, TableCell, TableHead, TableRow
} from '@aws-amplify/ui-react';
import './FormStyle.css'
import AgGridField from './FormAgGrid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function FormRenderer({ schema }) {
    const [values, setValues] = React.useState({});
    const [, force] = React.useState(0);
    
    const toDate = (s) => {
        if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
        return new Date(`${s}T00:00:00`);
    };
    
    const toISO = (d) => (d instanceof Date && !isNaN(d) ? d.toISOString().slice(0, 10) : '');
    
    const DateInput = React.forwardRef(({ value, onClick, label, name, placeholder }, ref) => (
        <TextField
        ref={ref}
        label={label}
        name={name}
        value={value || ''}
        placeholder={placeholder || 'dd/mm/yyyy'}
        onClick={onClick}
        readOnly
        size="small"
        width="100%"
        />
    ));
    
    const setValue = (name, val) =>
        setValues(prev => ({ ...prev, [name]: val }));
    
    const normOptions = (opts = []) =>
        opts.map(o => (typeof o === 'string' ? { id: o, name: o } : o));
    
    React.useEffect(() => {
        
        const init = {};
        schema.groups.forEach(g => {
            g.fields.forEach(f => {
                if (['text', 'number', 'date'].includes(f.type)) {
                    init[f.name] = init[f.name] ?? (f.defaultValue ?? '');
                }
                
                if (f.type === 'select') {
                    const opts = normOptions(f.options);
                    const defId =
                    f.defaultValue ??
                    (opts[0]?.id ?? '');
                    init[f.name] = init[f.name] ?? defId;
                }
                
                if (f.type === 'multiselect') {
                    const defArr = Array.isArray(f.defaultValue) ? f.defaultValue : [];
                    init[f.name] = init[f.name] ?? defArr;
                }
                
                if (f.type === 'aggrid') {
                    init[f.name] = init[f.name] ?? (Array.isArray(f.rows) ? f.rows : []);
                }
            });
        });
        
        schema.setInvalidator(() => {
            const patch = {};
            schema.groups.forEach(g => {
                g.fields.forEach(f => {
                    if (f.type === 'aggrid') {
                        patch[f.name] = Array.isArray(f.rows) ? f.rows : [];
                    }
                });
            });
            setValues(prev => ({ ...prev, ...patch }));
            force(x => x + 1);
        });
        
        setValues(prev => ({ ...init, ...prev }));
    }, [schema]);
    
    React.useEffect(() => {
        schema.setParameterGetter(() => {
            const out = {};
            schema.groups.forEach(g => {
                g.fields.forEach(f => {
                    if (['text', 'number', 'date'].includes(f.type)) {
                        out[f.name] = values[f.name] ?? '';
                        return;
                    }
                    
                    if (f.type === 'select') {
                        const opts = normOptions(f.options);
                        const id = values[f.name] ?? '';
                        const label = opts.find(o => o.id === id)?.name ?? '';
                        out[f.name] = id;
                        out[`${f.name}_display`] = label;
                        return;
                    }
                    
                    if (f.type === 'multiselect') {
                        const opts = normOptions(f.options);
                        const ids = Array.isArray(values[f.name]) ? values[f.name] : [];
                        const labels = ids
                        .map(id => opts.find(o => o.id === id)?.name ?? '')
                        .filter(Boolean);
                        out[f.name] = ids.join(',');
                        out[`${f.name}_display`] = labels.join(',');
                        return;
                    }
                    
                });
            });
            return out;
        });
    }, [schema, values]);
    
    return (
        <form>
        {schema.groups.map((group, gi) => (
            <Fieldset key={gi} legend={group.legend} style={{ marginBottom: '1.25rem' }}>
            <Grid
            columnGap="1rem"
            rowGap="1rem"
            templateColumns={{ base: '1fr', medium: 'repeat(2, 1fr)', large: 'repeat(4, 1fr)' }}
            >
            {(() => {
                const out = [];
                const fs = group.fields;
                
                for (let i = 0; i < fs.length; i++) {
                    const field = fs[i];
                    
                    if (field.type === 'button') {
                        const btns = [];
                        while (i < fs.length && fs[i].type === 'button') { btns.push(fs[i]); i++; }
                        i--;
                        out.push(
                            <Flex key={`btnrow-${i}`} alignItems="flex-end" gap="0.5rem">
                            {btns.map((b, idx) => (
                                <Button
                                loadingText="Đang xử lý..."
                                key={`${b.name || b.label}-${idx}`}
                                variation={b.variation}
                                size="small"
                                onClick={(e) => {
                                    const ctx = { values: schema.getParameterGetter(), event: e, schema };
                                    if (b.onClick?.length > 0) b.onClick(ctx);
                                    else b.onClick?.();
                                }}
                                style={{ height: 20, minWidth: 80 }}
                                >
                                {b.label}
                                </Button>
                            ))}
                            </Flex>
                        );
                        continue;
                    }
                    
                    switch (field.type) {
                        case 'header':
                        out.push(
                            <h3 key={`hdr-${i}`} style={{ gridColumn: '1 / -1', margin: 0 }}>
                            {field.label}
                            </h3>
                        );
                        break;
                        
                        case 'text':
                        case 'number':
                        out.push(
                            <TextField
                            key={`txt-${i}`}
                            label={field.label}
                            name={field.name}
                            type={field.type === 'number' ? 'number' : 'text'}
                            size="small"
                            width="100%"
                            value={values[field.name] ?? ''}
                            onChange={(e) => setValue(field.name, e.target.value ?? '')}
                            />
                        );
                        break;
                        
                        case 'date':
                        out.push(
                            <DatePicker
                            key={`date-${i}`}
                            selected={toDate(values[field.name] ?? '')}
                            onChange={(d) => setValue(field.name, toISO(d))}
                            customInput={<DateInput label={field.label} name={field.name} />}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="dd/mm/yyyy"
                            isClearable
                            showPopperArrow={false}
                            popperPlacement="bottom-start"
                            portalId="root"
                            />
                        );
                        break;
                        
                        case 'select': {
                            const opts = normOptions(field.options);
                            out.push(
                                <SelectField
                                key={`sel-${i}`}
                                label={field.label}
                                name={field.name}
                                size="small"
                                width="100%"
                                value={values[field.name] ?? ''}
                                onChange={(e) => setValue(field.name, e.target.value ?? '')}
                                >
                                {opts.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                ))}
                                </SelectField>
                            );
                            break;
                        }
                        
                        case 'multiselect': {
                            const opts = normOptions(field.options);
                            const current = Array.isArray(values[field.name]) ? values[field.name] : [];
                            out.push(
                                <SelectField
                                className="msel"
                                key={`msel-${i}`}
                                label={field.label}
                                name={field.name}
                                isMultiple
                                selectSize={field.selectSize ?? 4}
                                width="100%"
                                value={current}
                                onChange={(e) => {
                                    const selectedIds = Array.from(e.target.selectedOptions || []).map(o => o.value);
                                    setValue(field.name, selectedIds);
                                }}
                                >
                                {opts.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                ))}
                                </SelectField>
                            );
                            break;
                        }
                        
                        case 'table':
                        out.push(
                            <div key={`tbl-${i}`} style={{ gridColumn: '1 / -1' }}>
                            <Table highlightOnHover size="small">
                            <TableHead>
                            <TableRow>
                            {field.columns.map((col) => (
                                <TableCell as="th" key={col.name}>{col.label}</TableCell>
                            ))}
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {field.rows.map((row, ri) => (
                                <TableRow key={ri}>
                                {field.columns.map((col) => (
                                    <TableCell key={col.name}>{row[col.name]}</TableCell>
                                ))}
                                </TableRow>
                            ))}
                            </TableBody>
                            </Table>
                            </div>
                        );
                        break;
                        case 'aggrid':
                        out.push(
                            <AgGridField
                            key={`ag-${i}`}
                            field={{
                                ...field,
                                rows: (Array.isArray(values[field.name]) ? values[field.name] : field.rows) || []
                            }}
                            onChange={(name, rows) => {
                                setValue(name, rows);
                                schema?.setDataGrid?.(name, rows, { silent: true });
                            }}
                            />
                        );
                        break;
                        default:
                        break;
                    }
                }
                
                
                return out;
            })()}
            </Grid>
            </Fieldset>
        ))}
        </form>
    );
}
