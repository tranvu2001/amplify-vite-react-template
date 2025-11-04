export default class FormSchema {
    constructor() {
        this.groups = [];
        this.getParameter = null;
        this._invalidate = null;
    }
    
    addGroup(legend) {
        const group = { legend, fields: [] };
        this.groups.push(group);
        return group;
    }
    
    addField(group, { type, name, label, options = [], width, isMultiple }) {
        group.fields.push({
            type, name, label, options,
            isMultiple: !!isMultiple,
            width: width || '200px'
        });
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
}
