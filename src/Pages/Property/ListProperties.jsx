import { Flex, Heading, View, Button } from "@aws-amplify/ui-react";
import { AgGridReact } from "ag-grid-react";
import Header from "../../Components/Header/Header";
import PropertyServices from "../../axios/PropertyServices";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const ListProperties = () => {
    const [listProperties, setListProperties] = useState([]);

    // Định nghĩa các hàng dữ liệu
    const [rowData, setRowData] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        PropertyServices.getAllProperties().then((response) => {
            setListProperties(response.data);
            setRowData(response.data);
            console.log(response.data);
        })
    }, []);


    const [colDefs, setColDefs] = useState([
        { field: "title", headerName: "Tên", flex: 1, filter: true },
        { field: "address", headerName: "Địa chỉ", flex: 1, filter: true },
        { field: "district", headerName: "Quận", flex: 1, filter: true},
        { field: "city", headerName: "Thành phố", flex: 1, filter: true },
        { field: "price", headerName: "Giá", flex: 1, valueFormatter: params => {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.value);
        }, filter: true
        }, // Giá đã được format 
        {
            field: 'buttonAction',
            headerName: 'Thao tác',
            cellRenderer: (params) => (
                <Flex gap={8} margin={10}>
                    <Button
                        onClick={() => handlePropertyDetail(params.data)}
                    >
                        Xem
                    </Button>
                    <Button
                        

                    >
                        Sửa
                    </Button>
                    <Button
                        

                    >
                        Xóa
                    </Button>
                </Flex>
            )
        }  

    ])

    const handlePropertyDetail = (rowData) => {
        navigate(`/list-properties/${rowData.propertyId}`);
    }
    
    const pagination = true
    const paginationPageSize = 500
    const paginationPageSizeSelector = [10, 200, 500, 1000]

    const localeText = {
        // General
        page: 'Trang',
        more: 'Thêm',
        to: 'tới',
        of: 'của',
        next: 'Trang sau',
        previous: 'Trang trước',
        loadingOoo: 'Đang tải...',
        noRowsToShow: 'Không có dữ liệu hiển thị',

        // Filters
        selectAll: '(Chọn tất cả)',
        searchOoo: 'Tìm kiếm...',
        blanks: '(Trống)',
        filterOoo: 'Lọc...',
        applyFilter: 'Áp dụng',
        equals: 'Bằng',
        notEqual: 'Khác',
        lessThan: 'Nhỏ hơn',
        greaterThan: 'Lớn hơn',
        lessThanOrEqual: '≤',
        greaterThanOrEqual: '≥',
        inRange: 'Trong khoảng',
        contains: 'Chứa',
        notContains: 'Không chứa',
        startsWith: 'Bắt đầu bằng',
        endsWith: 'Kết thúc bằng',
        andCondition: 'Và',
        orCondition: 'Hoặc',
        clearFilter: 'Xóa lọc',
        resetFilter: 'Đặt lại',
        filterTitle: 'Lọc dữ liệu',

        //Pagination

        // Others
        selectAllSearchResults: 'Chọn tất cả kết quả tìm kiếm',
        searchResults: 'Kết quả tìm kiếm',
        group: 'Nhóm',
    };

    const customStyles = {
        overlay: {
            zIndex: 1050, // Đảm bảo giá trị cao hơn các modal khác
        },
        content: {
            // minHeight: "100%",
            

        },
    };

    

    return (
        <View>
            <Header />

            {/* Danh sách người dùng */}
            <View style={{ height: 500, margin: '20px 40px 0 40px' }}>
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                    <Heading level={1} fontWeight={700} marginBottom={10} >Danh sách bất động sản</Heading>
                    <Button >Thêm bất động sản</Button>
                </Flex>
                <AgGridReact
                    localeText={localeText}
                    rowData={rowData}
                    columnDefs={colDefs}
                    pagination={pagination}
                    paginationPageSize={paginationPageSize}
                    paginationPageSizeSelector={paginationPageSizeSelector}
                />
            </View>

            {/* Modal */}
            

        </View>
    )
}

export default ListProperties;