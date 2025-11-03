import {
    Flex, Grid, Fieldset, TextField, SelectField, Button,
    Table, TableBody, TableCell, TableHead, TableRow
} from '@aws-amplify/ui-react';

export default function FormRenderer({ schema }) {
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
                        while (i < fs.length && fs[i].type === 'button') {
                            btns.push(fs[i]);
                            i++;
                        }
                        i--;
                        out.push(
                            <Flex key={`btnrow-${i}`} alignItems="flex-end" gap="0.5rem">
                            {btns.map((b, idx) => (
                                <Button
                                key={`${b.name || b.label}-${idx}`}
                                variation={b.variation}
                                size="small"
                                onClick={b.onClick}
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
                            />
                        );
                        break;
                        
                        case 'date':
                        out.push(
                            <TextField
                            key={`date-${i}`}
                            label={field.label}
                            name={field.name}
                            type="date"
                            size="small"
                            width="100%"
                            />
                        );
                        break;
                        
                        case 'select':
                        case 'multiselect':
                        out.push(
                            <SelectField
                            key={`sel-${i}`}
                            label={field.label}
                            name={field.name}
                            isMultiple={field.isMultiple || false}
                            size="small"
                            width="100%"
                            >
                            {field.options.map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                            </SelectField>
                        );
                        break;
                        
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
