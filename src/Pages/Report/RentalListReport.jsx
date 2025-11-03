import { Flex } from '@aws-amplify/ui-react';
import FormSchema from '../../Components/Form/FormSchema';
import FormRenderer from '../../Components/Form/FormRenderer';

export default () => {
    const schema = new FormSchema();
    
    let filterGroup = schema.addGroup('Filters');
    schema.addField(filterGroup, { type: 'date', name: 'fromDate', label: 'Từ ngày' });
    schema.addField(filterGroup, { type: 'date', name: 'toDate',   label: 'Đến ngày' });
    schema.addField(filterGroup, { type: 'text', name: 'tenant', label: 'Khách thuê' });
    schema.addField(filterGroup, { type: 'select', name: 'status', label: 'Trạng thái', options: ['Hoạt động', 'Đã hủy'] });
    
    let actionGroup = schema.addGroup('Action');
    schema.addButton(actionGroup, {
        name: 'exportBtn', label: 'Export', variation: 'primary', onClick: () => alert('Export clicked')
    });
    schema.addButton(actionGroup, {
        name: 'searchBtn', label: 'Tìm kiếm', variation: 'success', onClick: () => console.log('Search clicked')
    });
    
    let resultGroup = schema.addGroup('Results');
    schema.addTable(resultGroup, {
        name: 'rentalList',
        columns: [
            { label: 'Mã Thuê', name: 'rentalId' },
            { label: 'Khách thuê', name: 'tenant' },
            { label: 'Ngày thuê', name: 'rentalDate' },
            { label: 'Ngày trả', name: 'ngayTra' }
        ],
        rows: [
            { rentalId: 'R001', tenant: 'Nguyễn Văn A', rentalDate: '2025-01-10' },
            { rentalId: 'R002', tenant: 'Trần Thị B', rentalDate: '2025-01-12', ngayTra: '2025-01-12' }
        ]
    });

    return (
        <Flex direction="column" padding="1rem">
        <h2>Rental List Report</h2>
        <FormRenderer schema={schema} />
        </Flex>
    );
}
