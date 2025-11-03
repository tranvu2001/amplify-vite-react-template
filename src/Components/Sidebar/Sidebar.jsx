import React from "react";
import { View, Flex, Button, Text } from "@aws-amplify/ui-react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
    const linkStyle = ({ isActive }) => ({
        display: "block",
        padding: "10px 16px",
        borderRadius: "8px",
        color: isActive ? "#F15A29" : "#F5F6FA",
        fontWeight: isActive ? "600" : "400",
        textDecoration: "none",
        transition: "all 0.2s ease-in-out",
      });


    return (
        <View
        width="240px"
        backgroundColor="#2E4057"
        color="white"
        padding="1.5rem 1rem"
        height="100vh"
        fontFamily="'Inter', sans-serif"
        boxShadow="2px 0 6px rgba(0,0,0,0.1)"
        fontSize={"14px"}
        marginTop={"-19px"}
        >
            <Text fontSize="14px" color={"white"} fontWeight="bold" marginBottom="2rem">
                Dashboard
            </Text>

            <Flex direction="column" gap="1rem">
                <NavLink to="/list-user" style={linkStyle}>
                    Quản lý người dùng
                </NavLink>

                <NavLink to="/list-properties" style={linkStyle}>
                    Quản lý bất động sản
                </NavLink>
                
                <NavLink to="/report/RentalListReport" style={linkStyle}>
                    Rental List Report
                </NavLink>

                {/* <NavLink to="/list-transaction" style={linkStyle}>
                    Quản lý giao dịch
                </NavLink> */}
            </Flex>
        </View>
    );
}
