import { Flex } from '@aws-amplify/ui-react';
import FormSchema from '../../Components/Form/FormSchema';
import FormRenderer from '../../Components/Form/FormRenderer';
import { runWithBlocking } from '../../Components/Form/FormBlocking';
import { FormGlobal } from '../../Components/Form/FormGlobal';
import PropertyServices from "../../axios/PropertyServices";
import UserServices from "../../axios/UserServices";
import React from 'react';


export default () => {
    const form = React.useMemo(() => new FormSchema(), []);
    FormGlobal.form = form;
    
    let filterGroup = form.addGroup('Filters');
    form.addField(filterGroup, { type: 'date', name: 'fromDate', label: 'Từ ngày' });
    form.addField(filterGroup, { type: 'date', name: 'toDate',   label: 'Đến ngày' });
    form.addField(filterGroup, { type: 'text', name: 'tenant', label: 'Khách thuê' });
    form.addField(filterGroup, { type: 'select', name: 'status', label: 'Trạng thái', defaultValue: 'ACTIVE',  options: [
        { id: 'ACTIVE',  name: 'Hoạt động' },
        { id: 'CANCEL',  name: 'Đã hủy' }
    ] });
    form.addField(filterGroup, { type: 'multiselect', name: 'statuss', label: 'Trạng thái', defaultValue: 'ACTIVE', options: [
        { id: 'ACTIVE',  name: 'Hoạt động' },
        { id: 'CANCEL',  name: 'Đã hủy' },
        { id: 'PAUSE',  name: 'Tạm ngưng' }
    ] });
    
    let actionGroup = form.addGroup('Action');
    form.addButton(actionGroup, {
        name: 'exportBtn', label: 'Export', variation: 'primary', onClick: () => onSearchResult('T')
    });
    form.addButton(actionGroup, {
        name: 'searchBtn', label: 'Tìm kiếm', variation: 'success', onClick: () => onSearchResult()
    });
    
    let resultGroup = form.addGroup('Results');
    form.addTable(resultGroup, {
        name: 'result',
        columns: [
            { label: 'Mã Thuê', name: 'rentalId' },
            { label: 'Khách thuê', name: 'tenant' },
            { label: 'Ngày thuê', name: 'rentalDate'},
            { label: 'Ngày trả', name: 'ngayTra' }
        ],
        rows: []
    });

    return (
        <Flex direction="column" padding="1rem">
        <h2>Rental List Report</h2>
        <FormRenderer schema={form}/>
        </Flex>
    );
}

const onSearchResult = async (isExport) => {
    await runWithBlocking(async () => {
        const form = FormGlobal.form;

        let [properties, users] = await Promise.all([
            PropertyServices.getAllProperties(),
            UserServices.getAllUser()
        ]);
        
        form.setTableRows('result', [
            { rentalId: 'R001', tenant: 'Nguyễn Văn A', rentalDate: '2025-01-10' },
            { rentalId: 'R002', tenant: 'Trần Thị B', rentalDate: '2025-01-12', ngayTra: '2025-01-12' }
        ]);

    }, 'Loading…');
}
