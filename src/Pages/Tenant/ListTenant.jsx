import { View, Flex, Heading, Button } from "@aws-amplify/ui-react";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import TenantServices from "../../axios/TenantServices.js";

function ListTenant() {
    const navigate = useNavigate();
    const [rowData, setRowData] = useState([]);

    useEffect(() => {
        TenantServices.getAllUser().then((res) => {
            setRowData(res.data || []);
        });
    }, []);

    const handleTenantDetail = (row) => {
        navigate(`/list-tenant/${row.tenantId}?mode=view`);
    };

    const handleUpdateTenant = (row) => {
        navigate(`/list-tenant/${row.tenantId}?mode=edit`);
    };

    const [colDefs] = useState([
        { headerName: "Id", field: "tenantId", flex: 0.7 },
        { headerName: "Tên người thuê", field: "fullName", flex: 1.2 },
        { headerName: "Email", field: "email", flex: 1.4 },
        { headerName: "Số điện thoại", field: "phone", flex: 1 },
        {
            headerName: "Trạng thái",
            field: "status",
            flex: 0.9,
        },
        {
            field: "actions",
            headerName: "Thao tác",
            flex: 1,
            cellRenderer: (params) => (
                <Flex gap={8} margin={10}>
                    <Button onClick={() => handleTenantDetail(params.data)}>Xem</Button>
                    <Button onClick={() => handleUpdateTenant(params.data)}>Sửa</Button>
                </Flex>
            ),
        },
    ]);

    const rowSelection = useMemo(
        () => ({
            mode: "multiRow",
        }),
        []
    );

    const pagination = true;
    const paginationPageSize = 500;
    const paginationPageSizeSelector = [200, 500, 1000];

    const localeText = {
        page: "Trang",
        more: "Thêm",
        to: "tới",
        of: "của",
        next: "Trang sau",
        previous: "Trang trước",
        loadingOoo: "Đang tải...",
        noRowsToShow: "Không có dữ liệu hiển thị",
        selectAll: "(Chọn tất cả)",
        searchOoo: "Tìm kiếm...",
        blanks: "(Trống)",
        filterOoo: "Lọc...",
        applyFilter: "Áp dụng",
        equals: "Bằng",
        notEqual: "Khác",
        lessThan: "Nhỏ hơn",
        greaterThan: "Lớn hơn",
        lessThanOrEqual: "≤",
        greaterThanOrEqual: "≥",
        inRange: "Trong khoảng",
        contains: "Chứa",
        notContains: "Không chứa",
        startsWith: "Bắt đầu bằng",
        endsWith: "Kết thúc bằng",
        andCondition: "Và",
        orCondition: "Hoặc",
        clearFilter: "Xóa lọc",
        resetFilter: "Đặt lại",
        filterTitle: "Lọc dữ liệu",
        selectAllSearchResults: "Chọn tất cả kết quả tìm kiếm",
        searchResults: "Kết quả tìm kiếm",
        group: "Nhóm",
    };

    return (
        <View id="list-tenant">
            <View style={{ height: 500, margin: "20px 40px 0 40px" }}>
                <Flex alignItems="center" justifyContent="space-between">
                    <Heading level={1} fontWeight={700} marginBottom={10}>
                        Danh sách người thuê
                    </Heading>
                    <Button onClick={() => navigate("/list-tenant/new")}>
                        Thêm người thuê
                    </Button>
                </Flex>

                <AgGridReact
                    localeText={localeText}
                    rowData={rowData}
                    rowSelection={rowSelection}
                    columnDefs={colDefs}
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                />
            </View>
        </View>
    );
}

export default ListTenant;
