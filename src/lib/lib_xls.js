if (!window.ExcelJS)
  	await loadScript('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.3.0/exceljs.min.js');
if (!window.JSZip)
  	await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
if (!window.saveAs)
  	await loadScript('https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js');

async function loadScript(src) {
	if (document.querySelector(`script[src="${src}"]`)) return;
	await new Promise((res, rej) => {
		const s = document.createElement('script');
		s.src = src; s.async = true;
		s.onload = res; s.onerror = rej;
		document.head.appendChild(s);
	});
}

const NUMBER_FORMAT = {
	ACCOUNTING: "_(#,##0_);_( (#,##0);_( \\-\\ ??_);_(@_)",
	ACCOUNTING_PRECISION_2: "_(#,##0.00_);_(\ \(#,##0.00\);_(\ \-\ ??_);_(@_)",
	ACCOUNTING_PRECISION_6: "_(#,##0.00000000_);_(\ \(#,##0.00000000\);_(\ \-\ ??_);_(@_)",
}
const loadWorkbookFromUrl = async (_urlFile, _callbackSucc) => {
	let workbook = null;
	await fetch(_urlFile).then(res => res.blob())
	.then(async blob => {
		let buf = await blob.arrayBuffer();
		workbook = new ExcelJS.Workbook();
		await workbook.xlsx.load(buf);
		if(typeof _callbackSucc == "function"){
			_callbackSucc(workbook);
		}
	})
	return workbook;
}
const saveWorkbook = async (_workbook, _name) => {
	_workbook.xlsx.writeBuffer().then(function(buffer) {
		saveAs(new Blob([buffer]), _name);
	});
}
const syncRangeMergeAfterInsertRow = (_ws, _rowStartInsert, _numLineInserted) =>{
	let arrRangeMerge = _ws.model.merges;
	let arrRangeMergeFinal = [];
	for(let i = 0; i < arrRangeMerge.length; i++){
		let address_range = arrRangeMerge[i];
		let address_cell_start = getPositionCell(_ws, address_range.split(":")[0]);
		let address_cell_end = getPositionCell(_ws, address_range.split(":")[1]);
		
		if(address_cell_start.row >= _rowStartInsert){
			_ws.unMergeCells(address_range);
			arrRangeMergeFinal.push({
				row_start: address_cell_start.row + _numLineInserted,
				col_start: address_cell_start.col,
				row_end: address_cell_end.row + _numLineInserted,
				col_end: address_cell_end.col
			})
			
		}
	}
	
	for(let i = 0; i < arrRangeMergeFinal.length; i++){
		let objRangeMerge = arrRangeMergeFinal[i];
		_ws.mergeCells(objRangeMerge.row_start, objRangeMerge.col_start, objRangeMerge.row_end, objRangeMerge.col_end);
	}
}
const insertColumn = (_ws, _colStartInsert, _numColInserted) =>{
	let arrRangeMerge = _ws.model.merges;
	let arrRangeMergeFinal = [];
	for(let i = 0; i < arrRangeMerge.length; i++){
		let address_range = arrRangeMerge[i];
		let address_cell_start = getPositionCell(_ws, address_range.split(":")[0]);
		let address_cell_end = getPositionCell(_ws, address_range.split(":")[1]);
		
		let isUnMergeCell = false;
		if(address_cell_start.col >= _colStartInsert){
			isUnMergeCell = true;
			arrRangeMergeFinal.push({
				row_start: address_cell_start.row,
				col_start: address_cell_start.col + _numColInserted,
				row_end: address_cell_end.row,
				col_end: address_cell_end.col + _numColInserted,
				old_address: address_cell_start
			})
		}
		else if(address_cell_start.col <= _colStartInsert && address_cell_end.col >= _colStartInsert){
			isUnMergeCell = true;
			arrRangeMergeFinal.push({
				row_start: address_cell_start.row,
				col_start: address_cell_start.col,
				row_end: address_cell_end.row,
				col_end: address_cell_end.col + _numColInserted,
				old_address: address_cell_start
			})
		}
		if(isUnMergeCell){
			_ws.unMergeCells(address_range);
			let cellAddressOrg = {row: address_cell_start.row, col: address_cell_start.col};
			for(let idxRow = cellAddressOrg.row; idxRow <= address_cell_end.row; idxRow++){
				for(let idxCol = cellAddressOrg.col; idxCol <= address_cell_end.col; idxCol++){
					if(cellAddressOrg.row == idxRow && cellAddressOrg.col == idxCol){
						continue;
					}
					copyStyleCellToCell(_ws, cellAddressOrg, {row: idxRow, col: idxCol});
				}
			}
		}
	}
	let rowCount = _ws.rowCount;
	let colCount = _ws.columnCount;
	
	for(let idxCol = colCount; idxCol >= _colStartInsert; idxCol--){
		let oldColumn = _ws.getColumn(idxCol);
		let newColumn = _ws.getColumn(idxCol + _numColInserted);
		newColumn.width = oldColumn.width;
		for(let idxRow = 1; idxRow <= rowCount; idxRow++){
			copyStyleCellToCell(_ws, {row: idxRow, col: idxCol}, {row: idxRow, col: idxCol + _numColInserted});
			
			let oldCell = _ws.getCell(idxRow, idxCol);
			let newCell = _ws.getCell(idxRow, idxCol + _numColInserted);

			newCell.value = oldCell.value;
		
			oldCell.value = null;
		}
		
	}
	
	for(let i = 0; i < arrRangeMergeFinal.length; i++){
		let objRangeMerge = arrRangeMergeFinal[i];
		_ws.mergeCells(objRangeMerge.row_start, objRangeMerge.col_start, objRangeMerge.row_end, objRangeMerge.col_end);
	}
}
const getPositionCell = (_ws, _pos) => {
	let objPos = {row: 1, col: 1, address: "A1"};
	if(typeof _pos == "string"){
		objPos.address = _pos.toUpperCase();
		let cell_start = _ws.getCell(objPos.address);
		objPos.row = cell_start.row;
		objPos.col = cell_start.col;
	}
	else if(typeof _pos == "object"){
		objPos.row = _pos.row||1;
		objPos.col = _pos.col||1;
		let cell_start = _ws.getCell(objPos.row, objPos.col);
		objPos.address = cell_start._address;
	}
	return objPos;
}
const copyStyleCellToCells = (_ws, _posCellCopy, _arrPosCellPast) => {
	for(let i = 0; i < _arrPosCellPast.length; i++){
		copyStyleCellToCell(_ws, _posCellCopy, _arrPosCellPast[i]);
	}
}
const copyStyleCellToCell = (_ws, _posCellCopy, _posCellPast) => {
	let posCellCopy = getPositionCell(_ws, _posCellCopy);
	let posCellPast = getPositionCell(_ws, _posCellPast);
	let cellCopy = _ws.getCell(posCellCopy.address);
	let cellPast = _ws.getCell(posCellPast.address);
	if(cellCopy.numFmt != undefined){
		cellPast.numFmt = cellCopy.numFmt
	}
	if(cellCopy.font != undefined){
		cellPast.font = {...cellCopy.font}
	}
	if(cellCopy.alignment != undefined){
		cellPast.alignment = {...cellCopy.alignment}
	}
	if(cellCopy.border != undefined){
		cellPast.border = {...cellCopy.border}
	}
	if(cellCopy.fill != undefined){
		cellPast.fill = {...cellCopy.fill}
	}
}
const copyStyleRowToRows = (_ws, _rowNumCopy, _arrRowNumPast) => {
	for(let i = 0; i < _arrRowNumPast.length; i++){
		copyStyleCellToCell(_ws, _rowNumCopy, _arrRowNumPast[i]);
	}
}
const copyStyleRowToRow = (_ws, _rowNumCopy, _rowNumPast) => {
	let rowCopy = _ws.getRow(_rowNumCopy);
	let rowPast = _ws.getRow(_rowNumPast);
	let cellCount = rowCopy.cellCount < rowPast.cellCount ? rowPast.cellCount : rowCopy.cellCount;
	for(let i = 1; i <= cellCount; i++){
		rowPast.getCell(i).numFmt = rowCopy.getCell(i).numFmt;
	}
	
	if(rowCopy.font != undefined){
		rowPast.font = {...rowCopy.font}
	}
	if(rowCopy.alignment != undefined){
		rowPast.alignment = {...rowCopy.alignment}
	}
	if(rowCopy.border != undefined){
		rowPast.border = {...rowCopy.border}
	}
	if(rowCopy.fill != undefined){
		rowPast.fill = {...rowCopy.fill}
	}
}
const createNumFmtWithRange = (_ws, _posStart, _posEnd, _numFmt) => {
	let posStart = getPositionCell(_ws, _posStart);
	let posEnd = getPositionCell(_ws, _posEnd);
	for(let idxRow = posStart.row; idxRow <= posEnd.row; idxRow++){
		for (let idxCol = posStart.col; idxCol <= posEnd.col; idxCol++) {
			let curCell = _ws.getCell(idxRow, idxCol);
			curCell.numFmt = _numFmt;
		}
	}
}
const createFillWithRange = (_ws, _posStart, _posEnd, _objFill) => {
	_objFill = _objFill||{};
	let posStart = getPositionCell(_ws, _posStart);
	let posEnd = getPositionCell(_ws, _posEnd);
	
	for(let idxRow = posStart.row; idxRow <= posEnd.row; idxRow++){
		for (let idxCol = posStart.col; idxCol <= posEnd.col; idxCol++) {
			let curCell = _ws.getCell(idxRow, idxCol);
			
			let curFill = {...curCell.fill};
			Object.keys(_objFill).forEach(keyId =>{
				let tempValue = _objFill[keyId];
				if(tempValue != undefined){
					curFill[keyId] = tempValue;
				}
			})
			curCell.fill = curFill;
		}
	}
}
const createFontsWithRange = (_ws, _posStart, _posEnd, _objFont) => {
	_objFont = _objFont||{};
	let posStart = getPositionCell(_ws, _posStart);
	let posEnd = getPositionCell(_ws, _posEnd);
	for(let idxRow = posStart.row; idxRow <= posEnd.row; idxRow++){
		for (let idxCol = posStart.col; idxCol <= posEnd.col; idxCol++) {
			let curCell = _ws.getCell(idxRow, idxCol);
			
			let curFont = {...curCell.font};
			Object.keys(_objFont).forEach(keyId =>{
				let tempValue = _objFont[keyId];
				if(tempValue != undefined){
					curFont[keyId] = tempValue;
				}
			})
			curCell.font = curFont;
		}
	}
}
const createAlignmentWithRange = (_ws, _posStart, _posEnd, _objFont) => {
	_objFont = _objFont||{};
	let posStart = getPositionCell(_ws, _posStart);
	let posEnd = getPositionCell(_ws, _posEnd);
	for(let idxRow = posStart.row; idxRow <= posEnd.row; idxRow++){
		for (let idxCol = posStart.col; idxCol <= posEnd.col; idxCol++) {
			let curCell = _ws.getCell(idxRow, idxCol);
			
			let curAlignment = {...curCell.alignment};
			Object.keys(_objFont).forEach(keyId =>{
				let tempValue = _objFont[keyId];
				if(tempValue != undefined){
					curAlignment[keyId] = tempValue;
				}
			})
			curCell.alignment = curAlignment;
		}
	}
}
const createBorderWithRange = (_ws, _posStart, _posEnd, _borderOutside, _objBorderInside) => {
	_borderOutside = _borderOutside||"thin";
	_objBorderInside = _objBorderInside||{rowStyle: "", colStyle: ""};
	/* thin,dotted, dashDot, hair, dashDotDot, slantDashDot, mediumDashed, mediumDashDotDot, mediumDashDot
	medium, double, thick
	*/
	let styleBorderOutside = {
		style: _borderOutside
	};
	let posStart = getPositionCell(_ws,_posStart);
	let posEnd = getPositionCell(_ws,_posEnd);
	for (let i = posStart.row; i <= posEnd.row; i++) {
		let leftBorderCell = _ws.getCell(i, posStart.col);
		let rightBorderCell = _ws.getCell(i, posEnd.col);
		leftBorderCell.border = {
			...leftBorderCell.border,
			left: styleBorderOutside
		};
		rightBorderCell.border = {
			...rightBorderCell.border,
			right: styleBorderOutside
		};
	}

	for (let i = posStart.col; i <= posEnd.col; i++) {
		let topBorderCell = _ws.getCell(posStart.row, i);
		let botBorderCell = _ws.getCell(posEnd.row, i);
		topBorderCell.border = {
			...topBorderCell.border,
			top: styleBorderOutside
		};
		botBorderCell.border = {
			...botBorderCell.border,
			bottom: styleBorderOutside
		};
	}
	if(!!_objBorderInside.rowStyle || !!_objBorderInside.colStyle){
		for(let idxRow = posStart.row; idxRow <= posEnd.row; idxRow++){
			for (let idxCol = posStart.col; idxCol <= posEnd.col; idxCol++) {
				if(!!_objBorderInside.rowStyle && idxRow < posEnd.row){
					let botBorderCell = _ws.getCell(idxRow, idxCol);
					botBorderCell.border = {
						...botBorderCell.border,
						bottom: {style: _objBorderInside.rowStyle}
					};
				}
				
				if(!!_objBorderInside.colStyle && idxCol < posEnd.col){
					let rightBorderCell = _ws.getCell(idxRow, idxCol);
					rightBorderCell.border = {
						...rightBorderCell.border,
						right: {style: _objBorderInside.colStyle}
					};
				}
			}
		}
	}
};



const libXls = {
	NUMBER_FORMAT,
	loadWorkbookFromUrl,
	saveWorkbook,
	syncRangeMergeAfterInsertRow,
	getPositionCell,
	copyStyleCellToCell,
	copyStyleCellToCells,
	copyStyleRowToRows,
	copyStyleRowToRow,
	createNumFmtWithRange,
	createFillWithRange,
	createFontsWithRange,
	createBorderWithRange,
	createAlignmentWithRange,
	insertColumn,
};

export default libXls
