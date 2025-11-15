import {
    View,
    Flex,
    Text,
    Heading,
    Button,
    TextField,
    Label,
} from "@aws-amplify/ui-react";

import { AgGridReact } from 'ag-grid-react';
import { themeBalham, themeQuartz, themeAlpine, themeMaterial } from 'ag-grid-community';
import ReactModal from "react-modal";

import { useEffect, useState, useMemo } from "react";
import UserServices from "../../axios/UserServices.js";

import Header from '../../Components/Header/Header.jsx'
import { useNavigate } from "react-router-dom";


function ListUser() {

    const navigate = useNavigate()

    const [listUser, setListUser] = useState([])
    const [listProperty, setListProperty] = useState([])
    // Row Data
    const [rowData, setRowData] = useState([])
    const [userId, setUserId] = useState(null)
    // Input state
    const [input, setInput] = useState({
        name: "",
        email: ""
    })

    const handleChange = (e) => {
        setInput((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmitAddUser = (e) => {
        e.preventDefault();
        // Validate các trường


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex kiểm tra định dạng email
        if (!emailRegex.test(input.email)) {
            alert("Email không hợp lệ!");
            return;
        }
        console.log("Form submitted:", input);
        UserServices.createUser(input).then(res => {
            console.log("User created successfully:", res.data);
            setIsOpen(false);
            // Tải lại danh sách người dùng sau khi thêm mới
            UserServices.getAllUser().then(res => {
                setListUser(res.data)
                setRowData(res.data)
            })
        }).catch(err => {
            console.error("Error creating user:", err);
        });

    }

    const handleSubmitUpdateUser = (e) => {
        e.preventDefault();
        //Validate các trường


        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Regex kiểm tra định dạng email
        if (!emailRegex.test(input.email)) {
            alert("Email không hợp lệ!");
            return;
        }
        console.log("Form submitted:", input);
        UserServices.updateUser(input, userId).then(res => {
            console.log("User updated successfully:", res.data);
            setIsOpen(false);
            // Tải lại danh sách người dùng sau khi thêm mới
            UserServices.getAllUser().then(res => {
                setListUser(res.data)
                setRowData(res.data)
            })
        }).catch(err => {
            console.error("Error updating user:", err);
        });
        console.log(userId)

    }

    // Fetch data from API
    useEffect(() => {
        UserServices.getAllUser().then(res => {
            console.log(res.data)

            setListUser(res.data)
            setRowData(res.data)
        })
    }, [])


    // Định nghĩa các cột cho Ag-Grid
    const [colDefs, setColDefs] = useState([
        { headerName: "Id", field: "userId", flex:1 },
        { headerName: "Tên", field: "name", flex:1 },
        { headerName: "Email", field: "email", flex:1 },
        
        {
            field: 'buttonAction',
            headerName: 'Thao tác',
            cellRenderer: (params) => (
                <Flex gap={8} margin={10}>
                    <Button
                        onClick={() => handleUserDetail(params.data)}
                    >
                        Xem
                    </Button>
                    <Button
                        onClick={() => handleUpdateUser(params.data)}

                    >
                        Sửa
                    </Button>
                    {/* <Button
                        onClick={() => handleDeleteUser(params.data)}

                    >
                        Xóa
                    </Button> */}
                </Flex>
            )
        }
    ]);

    const [typeModal, setTypeModal] = useState("");
    const handleUserDetail = (rowData) => {
        console.log("Xem chi tiết người dùng", rowData);
        navigate(`/list-user/${rowData.userId}?mode=view`);
    };

    const handleUpdateUser = (rowData) => {
        // console.log("Cập nhật thông tin người dùng", rowData);
        // setInput({name: rowData.name, email: rowData.email})// Điền dữ liệu vào form
        // setTypeModal("update"); // Cập nhật loại modal
        // setIsOpen(true);
        // setUserId(rowData.userId);
        navigate(`/list-user/${rowData.userId}?mode=edit`);
    };

    const handleDeleteUser = (rowData) => {
        console.log("Xóa người dùng", rowData);
        if (window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${rowData.name}?`)) {
            UserServices.deleteUser(rowData.userId).then(res => {
                console.log("User deleted successfully:", res.data);
                // Tải lại danh sách người dùng sau khi xóa thành công
                UserServices.getAllUser().then(res => {
                    setListUser(res.data)
                    setRowData(res.data)
                })
            }).catch(err => {
                console.error("Error deleting user:", err);
            });
        }

    };

    // Tick từng hàng/nhiều hàng
    const rowSelection = useMemo(() => {
        return {
            mode: 'multiRow',
            // mode: 'singleRow'

        };
    }, []);

    const pagination = true
    const paginationPageSize = 500
    const paginationPageSizeSelector = [200, 500, 1000]

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

    const renderContentModal = (type) => {
        switch (type) {
            case "create":
                return <><Flex gap={16} justifyContent={"space-between"} alignItems={"center"} marginBottom={20}>
                    <Heading level={2} ref={(_subtitle) => (subtitle = _subtitle)}>Thêm người dùng</Heading>
                    <Button onClick={closeModal}>Đóng</Button>
                </Flex>
                    <form onSubmit={handleSubmitAddUser}>
                        <Flex  gap={16}>
                       
                            <View flex={1}>
                                <Label htmlFor="name" style={{ fontSize: "20px" }}>Tên</Label>
                                <TextField
                                    size="large" id="name" name="name"
                                    placeholder="Nhập tên" required
                                    value={input.name}
                                    onChange={handleChange}
                                />
                            </View>
                            <View flex={1}>
                                <Label htmlFor="email" style={{ fontSize: "20px" }}>Email</Label>
                                <TextField
                                    size="large" id="email" name="email"
                                    placeholder="Nhập email" type="email" required
                                    value={input.email}
                                    onChange={handleChange}
                                />
                            </View>
                        </Flex>
                        <Button type="submit" style={{ marginTop: "20px" }}>Thêm</Button>
                    </form></>
                
            case "update":
                return <><Flex gap={16} justifyContent={"space-between"} alignItems={"center"} marginBottom={20}>
                    <Heading level={2} ref={(_subtitle) => (subtitle = _subtitle)}>Sửa người dùng</Heading>
                    <Button onClick={closeModal}>Đóng</Button>
                </Flex>
                    <form onSubmit={handleSubmitUpdateUser}>
                        <Flex gap={16}>
                            <View flex={1}>
                                <Label htmlFor="name" style={{ fontSize: "20px" }}>Tên</Label>
                                <TextField
                                    size="large" id="name" name="name"
                                    placeholder="Nhập tên" required
                                    value={input.name}
                                    onChange={handleChange}
                                />
                            </View>
                            <View flex={1}>
                                <Label htmlFor="email" style={{ fontSize: "20px" }}>Email</Label>
                                <TextField
                                    size="large" id="email" name="email"
                                    placeholder="Nhập email" type="email" required
                                    value={input.email}
                                    onChange={handleChange}
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
        <View id="about">
            {/* <Header /> */}

            {/* Danh sách người dùng */}
            <View style={{ height: 500, margin: '20px 40px 0 40px' }}>
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                    <Heading level={1} fontWeight={700} marginBottom={10} >Danh sách người dùng</Heading>
                    <Button onClick={() => {
                        // setTypeModal("create"); // Đặt loại modal là "create"
                        // setInput({ name: "", email: "" }); // Reset các trường input
                        // setIsOpen(true); // Mở modal
                        navigate("/list-user/new");
                     }}>Thêm người dùng</Button>
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

export default ListUser;