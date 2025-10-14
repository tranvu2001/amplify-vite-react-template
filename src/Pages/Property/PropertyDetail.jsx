import { useParams } from "react-router-dom";
import Header from "../../Components/Header/Header";
import { Card, Flex, Heading, View, Text } from "@aws-amplify/ui-react";
import PropertyServices from "../../axios/PropertyServices";
import { useEffect, useState } from "react";

const PropertyDetail = () => {

    const { propertyId } = useParams();
    const [property, setProperty] = useState("")
    console.log(propertyId);

    useEffect(() => {
        PropertyServices.getPropertyById(propertyId).then(res => {
            console.log("Dữ liệu người dùng:", res.data); // Kiểm tra dữ liệu trả về
            setProperty(res.data);
        })
    }, [])
    console.log(property)

    return (
        <>
            <Header />
            <View padding="20px" style={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
                <Heading level={1} fontWeight={700} marginBottom="20px" style={{ textAlign: "center", color: "#333" }}>
                    Thông tin chi tiết bất động sản
                </Heading>
                <Card variation="outlined" padding="20px" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}>
                    <Flex direction="column" gap="16px">
                        <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                            <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Tên</Text>
                            <Text fontSize={16} style={{ color: "#333" }}>{property.title}</Text>
                        </Flex>
                        <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                            <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Địa chỉ</Text>
                            <Text fontSize={16} style={{ color: "#333" }}>{property.address + ', ' + property.district + ', ' + property.city}</Text>
                        </Flex>
                        <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                            <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Giá</Text>
                            <Text fontSize={16} style={{ color: "#333" }}>{new Intl.NumberFormat('vi-VN').format(property?.price) + ' ' + property.currency}</Text>
                        </Flex>
                        <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                            <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Trạng thái</Text>
                            <Text fontSize={16} style={{ color: "#333" }}>{property.status}</Text>
                        </Flex>
                        <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                            <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Kiểu bất động sản</Text>
                            <Text fontSize={16} style={{ color: "#333" }}>{property.type}</Text>
                        </Flex>
                        <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                            <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Danh mục</Text>
                            <Text fontSize={16} style={{ color: "#333" }}>{property.listingType}</Text>
                        </Flex>
                        <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                            <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Ngày đăng</Text>
                            <Text fontSize={16} style={{ color: "#333" }}>{property.createdAt ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(property?.createdAt)) : "Không có dữ liệu"}</Text>
                        </Flex>
                        <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                            <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Ngày chỉnh sửa</Text>
                            <Text fontSize={16} style={{ color: "#333" }}>{property.updatedAt ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(property?.updatedAt)) : "Không có dữ liệu"}</Text>
                        </Flex>

                        <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                            <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Người rao bán</Text>
                            <Text fontSize={16} style={{ color: "#333" }}>{property.ownerId}</Text>
                        </Flex>

                    </Flex>
                </Card>
            </View>
        </>
    )
}
export default PropertyDetail