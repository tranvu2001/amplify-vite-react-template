export default class FormSchema {
    constructor() {
        this.groups = [];
    }

    addGroup(legend) {
        const group = { legend, fields: [] };
        this.groups.push(group);
        return group;
    }
    
    addField(group, { type, name, label, options = [], width, isMultiple }) {
        group.fields.push({
            type,
            name,
            label,
            options,
            isMultiple: isMultiple || false,
            width: width || '200px'
        });
        return this;
    }
    
    addButton(group, { name, label, variation = 'primary', onClick }) {
        group.fields.push({
            type: 'button',
            name,
            label,
            variation,
            onClick
        });
        return this;
    }
    
    addTable(group, { name, columns = [], rows = [] }) {
        group.fields.push({
            type: 'table',
            name,
            columns,
            rows
        });
        return this;
    }
}
