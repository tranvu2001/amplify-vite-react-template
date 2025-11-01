import { useNavigate } from "react-router-dom";
import { Flex, Heading, View, Button, Label, TextField, SelectField } from "@aws-amplify/ui-react";
import { AgGridReact } from "ag-grid-react";
import { useState, useEffect, useMemo } from "react";

import ReactModal from "react-modal";
import { use } from "react";
import TransactionServices from "../../axios/TransactionServices";
const ListTransaction = () => {
    
    const navigate = useNavigate();
    const [rowData, setRowData] = useState([])

    const [input, setInput] = useState({})

    useEffect(() => {
        TransactionServices.getAllTransactions().then((response) => {
            console.log(response.data);
            setRowData(response.data);
        })  
    }, [])

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
                        onClick={() => handleTransactionDetail(params.data)}
                    >
                        Xem
                    </Button>
                    {/* <Button
                        onClick={() => handleUpdateProperty(params.data)}

                    >
                        Sửa
                    </Button>
                    <Button
                        onClick={() => handleDeleteProperty(params.data)}

                    >
                        Xóa
                    </Button> */}
                </Flex>
            )
        }

    ])

    const handleTransactionDetail = (rowData) => {
        console.log("Transaction Detail");
        navigate(`/list-transaction/${rowData.txnId}`)
    }

    const handlePropertyDetail = (rowData) => {
        
    }

    const handleDeleteProperty = (rowData) => {
        

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

    const handleChange = (e) => {
        setInput((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))

    }

    const handleSubmitAddProperty = (e) => {
        
    }

    const handleSubmitUpdateProperty = (e) => {
        
    }

    const handleUpdateProperty = (rowData) => {
        
    }

    const renderContentModal = (type) => {
        switch (type) {
            case "create":
                return <>
                    <Flex gap={16} justifyContent={"space-between"} alignItems={"center"} marginBottom={20}>
                        <Heading level={2}>Thêm bất động sản</Heading>
                        <Button onClick={closeModal}>Đóng</Button>
                    </Flex>
                    <form onSubmit={handleSubmitAddProperty}>
                        <Flex direction="column" gap={16}>
                            <View>
                                <Label htmlFor="title" style={{ fontSize: "20px" }}>Tên</Label>
                                <TextField
                                    id="title"
                                    name="title"
                                    placeholder="Nhập tên tài sản"
                                    value={input.title}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="address" style={{ fontSize: "20px" }}>Địa chỉ</Label>
                                <TextField
                                    id="address"
                                    name="address"
                                    placeholder="Nhập địa chỉ"
                                    value={input.address}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="district" style={{ fontSize: "20px" }}>Quận</Label>
                                <TextField
                                    id="district"
                                    name="district"
                                    placeholder="Nhập quận"
                                    value={input.district}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="city" style={{ fontSize: "20px" }}>Thành phố</Label>
                                <TextField
                                    id="city"
                                    name="city"
                                    placeholder="Nhập thành phố"
                                    value={input.city}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="price" style={{ fontSize: "20px" }}>Giá</Label>
                                <TextField
                                    id="price"
                                    name="price"
                                    type="number"
                                    placeholder="Nhập giá"
                                    value={input.price}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="currency" style={{ fontSize: "20px" }}>Đơn vị tiền tệ</Label>
                                <TextField
                                    id="currency"
                                    name="currency"
                                    placeholder="Nhập đơn vị tiền tệ (VD: VND)"
                                    value={input.currency}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="listingType" style={{ fontSize: "20px" }}>Loại danh mục</Label>
                                <SelectField
                                    id="listingType"
                                    name="listingType"
                                    value={input.listingType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="SALE">Bán</option>
                                    <option value="RENT">Cho thuê</option>
                                </SelectField>
                            </View>
                            <View>
                                <Label htmlFor="type" style={{ fontSize: "20px" }}>Loại tài sản</Label>
                                <SelectField
                                    id="type"
                                    name="type"
                                    value={input.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Nhà">Nhà</option>
                                    <option value="Căn Hộ">Căn hộ</option>
                                    <option value="Đất">Đất</option>
                                    <option value="Chung cư">Chung cư</option>
                                </SelectField>
                            </View>
                            <View>
                                <Label htmlFor="status" style={{ fontSize: "20px" }}>Trạng thái</Label>
                                <SelectField
                                    id="status"
                                    name="status"
                                    value={input.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Đã đăng">Đã đăng</option>
                                    <option value="Thương lượng">Thương lượng</option>
                                    <option value="Đã đặt cọc">Đã đặt cọc</option>
                                </SelectField>
                            </View>
                            <View>
                                <Label htmlFor="ownerName" style={{ fontSize: "20px" }}>Tên chủ sở hữu</Label>
                                <SelectField
                                    id="ownerName"
                                    name="ownerName"
                                    value={input.status}
                                    onChange={handleChange}
                                    required
                                >
                                    {listUser.map((user) => (
                                        <option key={user.userId} value={user.name}>{user.name} </option>
                                    ))}

                                </SelectField>
                            </View>
                        </Flex>
                        <Button type="submit" style={{ marginTop: "20px" }}>Thêm</Button>
                    </form>
                </>

            case "update":
                return <>
                    <Flex gap={16} justifyContent={"space-between"} alignItems={"center"} marginBottom={20}>
                        <Heading level={2}>Sửa bất động sản</Heading>
                        <Button onClick={closeModal}>Đóng</Button>
                    </Flex>
                    <form onSubmit={handleSubmitUpdateProperty}>
                        <Flex direction="column" gap={16}>
                            <View>
                                <Label htmlFor="title" style={{ fontSize: "20px" }}>Tên</Label>
                                <TextField
                                    id="title"
                                    name="title"
                                    placeholder="Nhập tên tài sản"
                                    value={input.title}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="address" style={{ fontSize: "20px" }}>Địa chỉ</Label>
                                <TextField
                                    id="address"
                                    name="address"
                                    placeholder="Nhập địa chỉ"
                                    value={input.address}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="district" style={{ fontSize: "20px" }}>Quận</Label>
                                <TextField
                                    id="district"
                                    name="district"
                                    placeholder="Nhập quận"
                                    value={input.district}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="city" style={{ fontSize: "20px" }}>Thành phố</Label>
                                <TextField
                                    id="city"
                                    name="city"
                                    placeholder="Nhập thành phố"
                                    value={input.city}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="price" style={{ fontSize: "20px" }}>Giá</Label>
                                <TextField
                                    id="price"
                                    name="price"
                                    type="number"
                                    placeholder="Nhập giá"
                                    value={input.price}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="currency" style={{ fontSize: "20px" }}>Đơn vị tiền tệ</Label>
                                <TextField
                                    id="currency"
                                    name="currency"
                                    placeholder="Nhập đơn vị tiền tệ (VD: VND)"
                                    value={input.currency}
                                    onChange={handleChange}
                                    required
                                />
                            </View>
                            <View>
                                <Label htmlFor="listingType" style={{ fontSize: "20px" }}>Loại danh mục</Label>
                                <SelectField
                                    id="listingType"
                                    name="listingType"
                                    value={input.listingType}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Bán">Bán</option>
                                    <option value="Cho thuê">Cho thuê</option>
                                </SelectField>
                            </View>
                            <View>
                                <Label htmlFor="type" style={{ fontSize: "20px" }}>Loại tài sản</Label>
                                <SelectField
                                    id="type"
                                    name="type"
                                    value={input.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="HOUSE">Nhà</option>
                                    <option value="APARTMENT">Căn hộ</option>
                                    <option value="LAND">Đất</option>
                                </SelectField>
                            </View>
                            <View>
                                <Label htmlFor="status" style={{ fontSize: "20px" }}>Trạng thái</Label>
                                <SelectField
                                    id="status"
                                    name="status"
                                    value={input.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Đã đăng">Đã đăng</option>
                                    <option value="Thương lượng">Thương lượng</option>
                                    <option value="Đã đặt cọc">Đã đặt cọc</option>
                                </SelectField>
                            </View>
                            <View>
                                <Label htmlFor="ownerName" style={{ fontSize: "20px" }}>Tên chủ sở hữu</Label>
                                <SelectField
                                    id="ownerName"
                                    name="ownerName"
                                    value={input.status}
                                    onChange={handleChange}
                                    required
                                >
                                    {listUser.map((user) => (
                                        <option key={user.userId} value={user.name}>{user.name} </option>
                                    ))}

                                </SelectField>
                            </View>
                        </Flex>
                        <Button type="submit" style={{ marginTop: "20px" }}>Cập nhật</Button>
                    </form>
                </>;

            case "detail":
                return <div>User Detail Information</div>

            default:
                return <div>Default Modal Content</div>
        }
    }

    return (
        <View id="about">
            {/* <Header /> */}

            {/* Danh sách người dùng */}
            <View style={{ height: 500, margin: '20px 40px 0 40px' }}>
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                    <Heading level={1} fontWeight={700} marginBottom={10} >Danh sách giao dịch</Heading>
                    <Button onClick={() => {
                        setTypeModal("create"); // Đặt loại modal là "create"
                        setIsOpen(true); // Mở modal
                        userAttributes();
                    }}>Thêm giao dịch</Button>
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

export default ListTransaction;