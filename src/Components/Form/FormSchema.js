export default class FormSchema {
    constructor() {
        this.groups = [];
        this.getParameter = null;
        this._invalidate = null;
        this._fieldIndex = new Map();
    }
    
    addGroup(legend) {
        const group = { legend, fields: [] };
        this.groups.push(group);
        return group;
    }

    addField(group, { type, name, label, options = [], width = '200px', isMultiple, ...rest }) {
        group.fields.push({ type, name, label, options, width, isMultiple: !!isMultiple, ...rest });
        return this;
    }

    addButton(group, { name, label, variation = 'primary', onClick }) {
        group.fields.push({ type: 'button', name, label, variation, onClick });
        return this;
    }
    
    addTable(group, { name, columns = [], rows = [] }) {
        group.fields.push({ type: 'table', name, columns, rows });
        return this;
    }
    
    setInvalidator(fn) { this._invalidate = fn; }
    
    setTableRows(name, rows) {
        for (const g of this.groups) {
            for (const f of g.fields) {
                if (f.type === 'table' && f.name === name) {
                    f.rows = Array.isArray(rows) ? [...rows] : [];
                    this._invalidate?.();
                    return this;
                }
            }
        }
        return this;
    }
    
    setParameterGetter(fn) {
        this.getParameter = fn;
    }
    
    getParameterGetter() {
        return typeof this.getParameter === 'function'
        ? this.getParameter()
        : {};
    }

    _indexField(name, group) {
        if (!name) return;
        const groupIdx = this.groups.indexOf(group);
        const fieldIdx = group.fields.length - 1;
        this._fieldIndex.set(name, { groupIdx, fieldIdx });
    }

    _getFieldRef(name) {
        const ptr = this._fieldIndex.get(name);
        if (!ptr) return null;
        const grp = this.groups[ptr.groupIdx];
        if (!grp) return null;
        return grp.fields[ptr.fieldIdx] || null;
    }

    addAgGrid(group, { name, label, columns = [], rows = [], options = {} }) {
        group.fields.push({
            type: 'aggrid',
            name, label, columns, rows, options
        });
        this._indexField?.(name, group);
        return this;
    }

    setDataAgGrid(name, rows, { append = false, silent = false } = {}) {
        const fld = this._getFieldRef(name);
        if (!fld || fld.type !== 'aggrid') return this;
        const next = Array.isArray(rows) ? rows : [];
        fld.rows = append ? [ ...(fld.rows || []), ...next ] : next;
        if (!silent) this._invalidate?.();
        return this;
    }

    getDataAgGrid(name) {
        const fld = this._getFieldRef(name);
        if (!fld || fld.type !== 'aggrid') return [];
        return Array.isArray(fld.rows) ? fld.rows : [];
    }
    
    getField(name) {
        for (const g of this.groups) {
            const found = g.fields.find(f => f.name === name);
            if (found) return found;
        }
        return null;
    }

    getGridColumns(name) {
        return this.getField(name)?.columns ?? [];
    }
    
    updateSourceField(name, props) {
        for (let g of this.groups) {
            for (let i = 0; i < g.fields.length; i++) {
                if (g.fields[i].name === name) {
                    g.fields[i] = { ...g.fields[i], ...props };
                    return g.fields[i];
                }
            }
        }
        return null;
    }

}
