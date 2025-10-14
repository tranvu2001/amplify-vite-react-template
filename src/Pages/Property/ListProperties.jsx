import { Flex, Heading, View, Button, Label, TextField } from "@aws-amplify/ui-react";
import { AgGridReact } from "ag-grid-react";
import Header from "../../Components/Header/Header";
import PropertyServices from "../../axios/PropertyServices";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactModal from "react-modal";

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
        { field: "district", headerName: "Quận", flex: 1, filter: true },
        { field: "city", headerName: "Thành phố", flex: 1, filter: true },
        {
            field: "price", headerName: "Giá", flex: 1, valueFormatter: params => {
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

    const [typeModal, setTypeModal] = useState("");

    let subtitle;
    const [isOpen, setIsOpen] = useState(false);

    function openModal() {
        setIsOpen(true);
    }

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
        subtitle.style.color = '#f00';
    }

    function closeModal() {
        setIsOpen(false);
    }

    const handleSubmitAddProperty = (e) => {
        e.preventDefault();
        closeModal();
    }

    const handleUpdateProperty = (rowData) => {
        console.log("Cập nhật thông tin bất động sản", rowData);
        setTypeModal("update"); // Cập nhật loại modal
        setIsOpen(true);
    }

    const renderContentModal = (type) => {
        switch (type) {
            case "create":
                return <><Flex gap={16} justifyContent={"space-between"} alignItems={"center"} marginBottom={20}>
                    <Heading level={2} ref={(_subtitle) => (subtitle = _subtitle)}>Thêm bất động sản</Heading>
                    <Button onClick={closeModal}>close</Button>
                </Flex>
                    <form onSubmit={handleSubmitAddProperty}>
                        <Flex direction="column" gap={16}>
                            <View>
                                <Label htmlFor="name" style={{ fontSize: "20px" }}>Tên</Label>
                                <TextField
                                    
                                />
                            </View>
                            <View>
                                <Label htmlFor="email" style={{ fontSize: "20px" }}>Email</Label>
                                <TextField
                                    
                                />
                            </View>
                        </Flex>
                        <Button type="submit" style={{ marginTop: "20px" }}>Thêm</Button>
                    </form></>

            case "update":
                return <><Flex gap={16} justifyContent={"space-between"} alignItems={"center"} marginBottom={20}>
                    <Heading level={2} ref={(_subtitle) => (subtitle = _subtitle)}>Sửa bất động sản</Heading>
                    <Button onClick={closeModal}>close</Button>
                </Flex>
                    <form onSubmit={handleSubmitAddProperty}>
                        <Flex direction="column" gap={16}>
                            <View>
                                <Label htmlFor="name" style={{ fontSize: "20px" }}>Tên</Label>
                                <TextField
                                    
                                />
                            </View>
                            <View>
                                <Label htmlFor="email" style={{ fontSize: "20px" }}>Email</Label>
                                <TextField
                                   
                                />
                            </View>
                        </Flex>
                        <Button type="submit" style={{ marginTop: "20px" }}>Cập nhật</Button>
                    </form></>

            case "detail":
                return <div>User Detail Information</div>

            default:
                return <div>Default Modal Content</div>
        }
    }

    return (
        <View>
            <Header />

            {/* Danh sách người dùng */}
            <View style={{ height: 500, margin: '20px 40px 0 40px' }}>
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                    <Heading level={1} fontWeight={700} marginBottom={10} >Danh sách bất động sản</Heading>
                    <Button onClick={() => {
                        setTypeModal("create"); // Đặt loại modal là "create"
                        setIsOpen(true); // Mở modal
                     }}>Thêm bất động sản</Button>
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
            <ReactModal
                isOpen={isOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Example Modal"
            >
                {renderContentModal(typeModal)}


            </ReactModal>

        </View>
    )
}

export default ListProperties;