import React from "react";
import { View, Flex, Card, Heading, Button } from "@aws-amplify/ui-react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";


export default function DashboardLayout({ user, signOut }) {
  return (
    <Flex height="100vh" backgroundColor="var(--amplify-colors-neutral-10)">
      {/* Sidebar cố định */}
      <Sidebar />

      {/* Khu vực chính */}
      <View flex="1" padding="1.5rem" overflow="auto">
        {/* Header */}
        <Card variation="outlined" marginBottom="1rem" padding="1rem">
          <Flex justifyContent="space-between" alignItems="center">
            <Heading level={3}>Xin chào, {user?.attributes?.name || user?.username} 👋</Heading>
          </Flex>
        </Card>

        {/* Nội dung động */}
        <Outlet />
      </View>
    </Flex>
  );
}
