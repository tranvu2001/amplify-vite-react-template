import { Flex } from '@aws-amplify/ui-react';
import FormSchema from '../../Components/Form/FormSchema';
import FormRenderer from '../../Components/Form/FormRenderer';
import { runWithBlocking } from '../../Components/Form/FormBlocking';
import { FormGlobal } from '../../Components/Form/FormGlobal';
import PropertyServices from "../../axios/PropertyServices";
import UserServices from "../../axios/UserServices";
import React from 'react';
import libXls from '../../lib/lib_xls';

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
    form.addAgGrid(resultGroup, {
        name: 'rentalItems',
        columns: [
            { key: 'id',        label: 'ID',      dataType: 'number', editable: false, width: 80,  format: { minimumFractionDigits: 0, maximumFractionDigits: 0 } },
            { key: 'itemCode',  label: 'Code',    dataType: 'string', editable: true,  width: 140 },
            { key: 'itemName',  label: 'Name',    dataType: 'string', editable: true,  width: 240 },
            { key: 'qty',       label: 'Qty',     dataType: 'number', editable: true,  width: 120, format: { minimumFractionDigits: 0, maximumFractionDigits: 0 } },
            { key: 'price',     label: 'Price',   dataType: 'number', editable: true,  width: 140, format: { minimumFractionDigits: 0, maximumFractionDigits: 2 } },
            { key: 'total',     label: 'Total',   dataType: 'number', editable: false, width: 160, flex: 1, format: { minimumFractionDigits: 0, maximumFractionDigits: 2 } }
        ],
        rows: [],
        options: { height: 320, pagination: true }
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
        let params = form.getParameter;
        let [properties, users] = await Promise.all([
            PropertyServices.getAllProperties(),
            UserServices.getAllUser()
        ]);
        
        form.setTableRows('result', [
            { rentalId: 'R001', tenant: 'Nguyễn Văn A', rentalDate: '2025-01-10' },
            { rentalId: 'R002', tenant: 'Trần Thị B', rentalDate: '2025-01-12', ngayTra: '2025-01-12' }
        ]);

        form.setDataAgGrid('rentalItems', [
            { id: 1, itemCode: 'RM-001', itemName: 'Room A', qty: 1, price: 2500000, total: 2500000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
            { id: 2, itemCode: 'RM-002', itemName: 'Room B', qty: 2, price: 2000000, total: 4000000 },
        ]);

        if(isExport == "T"){
            await onExportExcel(properties, params);
        }

    }, 'Loading…');
}

const onExportExcel = async(results) => {
    let workbook = new ExcelJS.Workbook();
    let curSheet = workbook.addWorksheet('Sheet1');

    let col_end = 8;
    let idxRowData  = 6;

    curSheet.mergeCells('A1:'+ `${curSheet.getRow(1).getCell(col_end).address}`);
    Object.assign(curSheet.getCell('A1'), {
        value: `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM`,
        font: { name: 'Calibri', size: 12},
        alignment: { horizontal: 'center', vertical: 'middle' }
    });

    curSheet.mergeCells('A2:'+ `${curSheet.getRow(2).getCell(col_end).address}`);
    Object.assign(curSheet.getCell('A2'), {
        value: `Độc lập - Tự do - Hạnh phúc`,
        font: { size: 12},
        alignment: { horizontal: 'center', vertical: 'middle' }
    });

    // for(let i = 0; i < results.length; i++){
    //     let objRes = results[i];
    //     let idxCurRow = i + idxRowData;
    //     let dataRow = objHeader.arrColHeader.map(obj => {
    //         return objRes[obj.dataField];
    //     });

    //     curSheet.insertRow(idxCurRow, dataRow);
    //     objHeader.arrColNumFmt.forEach(e=>{
    //         curSheet.getCell(idxCurRow, e.idxCol).numFmt = e.numFmt;
    //     })

    //     libXls.syncStyleRangeWithRowGrid(curSheet, {row: idxCurRow, col: 1}, {row: idxCurRow, col: col_end}, objRes);
    // }

    libXls.createBorderWithRange(curSheet,
        {row: idxRowData, col: 1},
        {row: results.length + idxRowData - 1, col: col_end},
        "thin",
        {rowStyle: "dotted", colStyle: "thin"}
    );

    await libXls.saveWorkbook(workbook, "Bảng kê chứng từ thanh toán.xlsx");

}
