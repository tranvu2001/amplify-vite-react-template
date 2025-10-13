import { Card, Flex, Heading, View, Text } from '@aws-amplify/ui-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UserServices from '../../axios/UserServices';
import Header from '../../Components/Header/Header';

const UserDetail = () => {
    const { userId } = useParams();
    // Mock user data (replace with API call or state management)
    const [user, setUser] = useState("")
    
    useEffect(() => {
        // Gọi user theo userId
        UserServices.getUserById(userId).then(res => {
            console.log("Dữ liệu người dùng:", res.data); // Kiểm tra dữ liệu trả về
            setUser(res.data);
        });
    }, [])
    
    console.log(userId)
    return (
        <>
        <Header />
        <View padding="20px" style={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
    <Heading level={1} fontWeight={700} marginBottom="20px" style={{ textAlign: "center", color: "#333" }}>
        Thông tin chi tiết người dùng
    </Heading>
    <Card variation="outlined" padding="20px" style={{ boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", borderRadius: "8px" }}>
        <Flex direction="column" gap="16px">
            <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>ID:</Text>
                <Text fontSize={16} style={{ color: "#333" }}>{user.userId}</Text>
            </Flex>
            <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Tên:</Text>
                <Text fontSize={16} style={{ color: "#333" }}>{user.name}</Text>
            </Flex>
            <Flex justifyContent="space-between" style={{ borderBottom: "1px solid #ddd", paddingBottom: "8px" }}>
                <Text fontSize={16} fontWeight="bold" style={{ color: "#555" }}>Email:</Text>
                <Text fontSize={16} style={{ color: "#333" }}>{user.email}</Text>
            </Flex>
            
        </Flex>
    </Card>
</View>
        </>
    );
};

export default UserDetail;