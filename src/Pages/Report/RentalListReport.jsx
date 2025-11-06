import { Flex } from '@aws-amplify/ui-react';
import FormSchema from '../../Components/Form/FormSchema';
import FormRenderer from '../../Components/Form/FormRenderer';
import { runWithBlocking } from '../../Components/Form/FormBlocking';
import { FormGlobal } from '../../Components/Form/FormGlobal';
import PropertyServices from "../../axios/PropertyServices";
import TransactionServices from "../../axios/TransactionServices";
import React from 'react';
import libXls from '../../lib/lib_xls';

export default () => {
    const form = React.useMemo(() => new FormSchema(), []);
    FormGlobal.form = form;

    let infoDate = getInfoDate();
    
    let filterGroup = form.addGroup('Filters');
    form.addField(filterGroup, { type: 'multiselect', name: 'propertyIds', label: 'Tài sản', options: [] });
    form.addField(filterGroup, { type: 'multiselect', name: 'transactionType', label: 'Loại giao dịch', options: [
        { id: 'RENT',  name: 'RENT' },
        { id: 'PAYMENT',  name: 'PAYMENT' },
        { id: 'MAINTENANCE',  name: 'MAINTENANCE' }
    ] });
    form.addField(filterGroup, { type: 'date', name: 'fromDate', label: 'Từ ngày', defaultValue: infoDate.firstDayOfMonth });
    form.addField(filterGroup, { type: 'date', name: 'toDate',   label: 'Đến ngày', defaultValue: infoDate.firstDayOfMonth });
    
    let actionGroup = form.addGroup('Action');
    form.addButton(actionGroup, {
        name: 'exportBtn', label: 'Export', variation: 'primary', onClick: () => onSearchResult('T')
    });
    form.addButton(actionGroup, {
        name: 'searchBtn', label: 'Tìm kiếm', variation: 'success', onClick: () => onSearchResult()
    });
    
    let resultGroup = form.addGroup('Results');
    form.addAgGrid(resultGroup, {
        name: 'agGrid',
        columns: [
            { key: 'date', label: 'Date', dataType: 'string', editable: false, width: 100 },
            { key: 'totalRevenue', label: 'Tổng doanh thu (VND)', dataType: 'number', editable: false, width: 180, format: { minimumFractionDigits: 0, maximumFractionDigits: 0 } },
            { key: 'totalCost', label: 'Tổng chi phí (VND)', dataType: 'number', editable: false, width: 160, format: { minimumFractionDigits: 0, maximumFractionDigits: 0 } },
            { key: 'netRevenue', label: 'Doanh thu ròng (VND)', dataType: 'number', editable: false, width: 180, format: { minimumFractionDigits: 0, maximumFractionDigits: 0 } },
            { key: 'profitRate', label: 'Hiệu suất lợi nhuận (%)', dataType: 'number', editable: false, width: 200, format: { minimumFractionDigits: 2, maximumFractionDigits: 2 } },
            { key: 'propertyCount', label: 'Số lượng tài sản', dataType: 'number', editable: false, width: 150 },
            { key: 'txnCount', label: 'Số lượng giao dịch', dataType: 'number', editable: false, width: 200 },
            { key: 'avgRevenue', label: 'Doanh thu TB / tài sản', dataType: 'number', editable: false, width: 200, format: { minimumFractionDigits: 0, maximumFractionDigits: 0 } },
            { key: 'maxRevenue', label: 'Doanh thu cao nhất', dataType: 'number', editable: false, width: 180, format: { minimumFractionDigits: 0, maximumFractionDigits: 0 } },
            { key: 'minRevenue', label: 'Doanh thu thấp nhất', dataType: 'number', editable: false, width: 180, format: { minimumFractionDigits: 0, maximumFractionDigits: 0 } },
            { key: 'topProperty', label: 'Tài sản có doanh thu cao nhất', dataType: 'string', editable: false, width: 260, flex: 1 },
        ],
        rows: [],
        options: { height: 380, pagination: true }
    });
    
    React.useEffect(() => {
        const loadProperties = async () => {
            let resProperty = await PropertyServices.getAllProperties();
            let properties = resProperty.data.map(p => ({
                id: p.propertyId,
                name: p.title
            }));
            
            form.updateSourceField('propertyIds', {
                options: properties,
                placeholder: 'Chọn tài sản'
            });

            FormGlobal.form.setDataAgGrid('agGrid', []);
        };
        
        loadProperties();
    }, [form]);
    
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

        let params = form.getParameter();
        // if (!params.fromDate || !params.fromDate) {
        //     alert("Chưa nhập đủ from date và to date")
        //     return;
        // }

        let [resProperty, resTransaction] = await Promise.all([
            PropertyServices.getAllProperties(),
            TransactionServices.getAllTransactions()
        ]);
        
        let results = getDataResultMapped(resProperty.data, resTransaction.data, params);
        
        form.setDataAgGrid('agGrid', results);
        
        if(isExport == "T"){
            await onExportExcel(results, params);
        }
        
    }, 'Loading…');
}

let getDataResultMapped = (properties, transactions, params) => {
    let arrGrpMonth = [], results = [];
    let fromYYYYMM  = getInfoDate(params.fromDate);
    let toYYYYMM = getInfoDate(params.toDate);

    if (params.propertyIds) {
        let propertyIds = params.propertyIds.split(',');

        transactions = transactions.filter(e => propertyIds.includes(e.propertyId))
    }
    
    if (params.transactionType) {
        let types  = params.transactionType.split(',');

        transactions = transactions.filter(e => types.includes(e.transactionType))
    }
    
    transactions.forEach(obj => {
        let info = getInfoDate(obj.createdAt);
        let yyyymm = info.YYYYMM;
        let ymDash = info['YYYY-MM'];
        
        obj['YYYY-MM'] = ymDash;

        if (yyyymm >= fromYYYYMM && yyyymm <= toYYYYMM) {
            if (!arrGrpMonth.includes(ymDash)) arrGrpMonth.push(ymDash);
        }
    });
    
    for (let i = 0; i < arrGrpMonth.length; i++) {
        let key = arrGrpMonth[i];
        
        let objRes = {
            date: key,
            totalRevenue: 0,
            totalCost: 0,
            netRevenue: 0,
            profitRate: 0,
            propertyCount: 0,
            txnCount: 0,
            avgRevenue: 0,
            maxRevenue: 0,
            minRevenue: 0,
            topProperty: '',
            remark: ''
        };
        
        let arrTran = transactions.filter(e => e.YYYYMM === key);
        let revenueByProp = {};
        let propSeen = {};
        let maxRev = 0;
        let minRev = 0;
        
        arrTran.forEach(t => {
            let type = (t.transactionType || '').toUpperCase();
            let amount = +t.amount || 0;
            let cost = +t.cost || 0;
            
            if (type === 'RENT' || type === 'PAYMENT') {
                objRes.totalRevenue += amount;
                let pid = t.propertyId || '';
                revenueByProp[pid] = (revenueByProp[pid] || 0) + amount;
            } else if (type === 'MAINTENANCE') {
                objRes.totalCost += cost;
            }
            
            if (t.propertyId) propSeen[t.propertyId] = true;
            objRes.txnCount += 1;
        });
        
        objRes.netRevenue = objRes.totalRevenue - objRes.totalCost;
        objRes.profitRate = objRes.totalRevenue > 0
        ? Math.round((objRes.netRevenue / objRes.totalRevenue) * 10000) / 100
        : 0;
        
        let revVals = Object.values(revenueByProp);
        if (revVals.length > 0) {
            let sum = 0;
            maxRev = revVals[0];
            minRev = revVals[0];
            for (let j = 0; j < revVals.length; j++) {
                let v = +revVals[j] || 0;
                sum += v;
                if (v > maxRev) maxRev = v;
                if (v < minRev) minRev = v;
            }
            objRes.avgRevenue = Math.round(sum / revVals.length);
            objRes.maxRevenue = maxRev;
            objRes.minRevenue = minRev;
            
            let topId = '';
            let topVal = -1;
            for (let pid in revenueByProp) {
                if (revenueByProp[pid] > topVal) {
                    topVal = revenueByProp[pid];
                    topId = pid;
                }
            }
            
            let topName = topId;
            if (properties && properties.length) {
                for (let k = 0; k < properties.length; k++) {
                    let p = properties[k];
                    if (p && p.propertyId === topId) {
                        topName = p.title
                        break;
                    }
                }
            }
            objRes.topProperty = topName + ' (' + Math.round(topVal).toLocaleString('vi-VN') + ' VND)';
        } else {
            objRes.avgRevenue = 0;
            objRes.maxRevenue = 0;
            objRes.minRevenue = 0;
            objRes.topProperty = '';
        }
        
        objRes.propertyCount = Object.keys(propSeen).length;
        results.push(objRes);
    }
    
    results.sort((a, b) => (a.date < b.date ? 1 : -1));
    return results;
};

const getInfoDate = (strDate) => {
    let curDate = strDate ? new Date(strDate) : new Date();
    let objRes = {};

    objRes.YYYY = curDate.getFullYear();
    objRes.MM = (curDate.getMonth() + 1).toString().padStart(2, '0');
    objRes.YYYYMM = (objRes.YYYY + objRes.MM)*1;
    objRes['YYYY-MM'] = objRes.YYYY + '-' + objRes.MM;
    objRes.firstDayOfMonth = new Date(objRes.YYYY, curDate.getMonth(), 1);
    objRes.lastDayOfMonth  = new Date(objRes.YYYY, curDate.getMonth() + 1, 0);

    return objRes
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
