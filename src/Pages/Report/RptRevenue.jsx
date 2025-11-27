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
    form.addField(filterGroup, {
        type: 'date', name: 'fromDate', label: 'Từ ngày', defaultValue: infoDate.firstDayOfMonth, isMandatory: true
    });
    form.addField(filterGroup, {
        type: 'date', name: 'toDate',   label: 'Đến ngày', defaultValue: infoDate.lastDayOfMonth, isMandatory: true
    });
    form.addField(filterGroup, { type: 'multiselect', name: 'propertyIds', label: 'Tài sản', startRow: true, options: [] });
    form.addField(filterGroup, { type: 'multiselect', name: 'type', label: 'Loại giao dịch', options: [
        { id: 'RENT',  name: 'RENT' },
        { id: 'PAYMENT',  name: 'PAYMENT' },
        { id: 'MAINTENANCE',  name: 'MAINTENANCE' }
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
            { key: 'topProperty', label: 'Tài sản có doanh thu cao nhất', dataType: 'string', editable: false, width: 500, flex: 1 },
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
        <h1>Báo cáo Doanh thu</h1>
        <FormRenderer schema={form}/>
        </Flex>
    );
}

const onSearchResult = async (isExport) => {
    await runWithBlocking(async () => {
        const form = FormGlobal.form;

        let params = form.getParameter();
        if (!params.fromDate || !params.toDate) {
            alert("Vui lòng nhập from date và to date")
            return;
        }

        let [resProperty, resTransaction] = await Promise.all([
            PropertyServices.getAllProperties(),
            TransactionServices.getAllTransactions()
        ]);
        
        let results = getDataResultMapped(resProperty.data, resTransaction.data, params);
        
        form.setDataAgGrid('agGrid', results);
        
        if(isExport == "T"){
            let colExport = form.getGridColumns('agGrid');

            await onExportExcel(results, params, colExport);
        }
        
    }, 'Loading…');
}

let getDataResultMapped = (properties, transactions, params) => {
    let arrGrpMonth = buildMonthRange(params.fromDate, params.toDate);;
     let results = [];
    let fromYYYYMM  = getInfoDate(params.fromDate).YYYYMM;
    let toYYYYMM = getInfoDate(params.toDate).YYYYMM;

    if (params.propertyIds) {
        let propertyIds = params.propertyIds.split(',');

        transactions = transactions.filter(e => propertyIds.includes(e.propertyId))
    }
    
    if (params.type) {
        let types  = params.type.split(',');

        transactions = transactions.filter(e => types.includes(e.type))
    }
    
    transactions.forEach(obj => {
        let info = getInfoDate(obj.createdAt);
        let yyyymm = info.YYYYMM;
        let ymDash = info['YYYY-MM'];
        
        obj['YYYY-MM'] = ymDash;
        obj.__inRange = (yyyymm >= fromYYYYMM && yyyymm <= toYYYYMM);
        // if (yyyymm >= fromYYYYMM && yyyymm <= toYYYYMM) {
        //     if (!arrGrpMonth.includes(ymDash)) arrGrpMonth.push(ymDash);
        // }
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
        
        let arrTran = transactions.filter(e => e['YYYY-MM'] === key);
        let revenueByProp = {};
        let propSeen = {};
        let maxRev = 0;
        let minRev = 0;
        
        arrTran.forEach(t => {
            let type = (t.type || '').toUpperCase();
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
            objRes.topProperty = topName;
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

const buildMonthRange = (fromDate, toDate) => {
    const s = new Date(fromDate);
    const e = new Date(toDate);
    const start = new Date(s.getFullYear(), s.getMonth(), 1);
    const end   = new Date(e.getFullYear(), e.getMonth(), 1);

    const out = [];
    const d = new Date(start);
    while (d <= end) {
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        out.push(ym);
        d.setMonth(d.getMonth() + 1);
    }
    return out;
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

const onExportExcel = async(results, params, colExport) => {
    let workbook = new ExcelJS.Workbook();
    let curSheet = workbook.addWorksheet('Sheet1');
    let objHeader = libXls.renderHeaderExport(curSheet, 6, colExport);
    let col_end = objHeader.col_end;
    let idxRowData = 7;

    curSheet.pageSetup = {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 0,
        horizontalCentered: true,
        margins: {
            left: 0,
            right: 0,
            top: 0.59,
            bottom: 0.59,
            header: 0,
            footer: 0
        }
    };

    curSheet.mergeCells('A3:'+ `${curSheet.getRow(3).getCell(col_end).address}`);
    Object.assign(curSheet.getCell('A3'), {
        value: `BÁO CÁO DOANH THU`,
        font: { size: 12, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
    });
    
    curSheet.mergeCells('A4:'+ `${curSheet.getRow(4).getCell(col_end).address}`);
    Object.assign(curSheet.getCell('A4'), {
        value: `Từ ${getInfoDate(params.fromDate)['YYYY-MM']} đến ${getInfoDate(params.toDate)['YYYY-MM']}`,
        font: { size: 12, bold: true },
        alignment: { horizontal: 'center', vertical: 'middle' }
    });
    
    for (let i = 0; i < results.length; i++) {
        let objRes = results[i];
        let idxCurRow = i + idxRowData;
        let dataRow = objHeader.arrColHeader.map(obj => {
            return objRes[obj.key];
        });
    
        curSheet.insertRow(idxCurRow, dataRow);

        colExport.forEach((e, idxCol)=>{
            if (e.dataType == 'number') {
                curSheet.getCell(idxCurRow, idxCol+1).numFmt = libXls.NUMBER_FORMAT.ACCOUNTING;
            }
        })
    }
    
    libXls.createBorderWithRange(curSheet,
        {row: idxRowData, col: 1},
        {row: results.length + idxRowData - 1, col: col_end},
        "thin",
        {rowStyle: "dotted", colStyle: "thin"}
    );
    
    await libXls.saveWorkbook(workbook, "Báo cáo doanh thu.xlsx");
    
}
