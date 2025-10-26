import { Link as RouterLink } from "react-router";
import { Link, Flex, Button, Image, Text } from '@aws-amplify/ui-react';
import './Header.css'
import { fetchAuthSession, fetchUserAttributes, signOut } from 'aws-amplify/auth';
import { useEffect, useState } from "react";

function Header() {

  // const {signOut, user} = props;
  const [check, setCheck] =  useState(null);

  useEffect(() => {
    fetchAuthSession().then(session => {
      console.log('Full user session:', session);
      // Trả về token, thời gian hết hạn, v.v.
      setCheck(session);
    });
  }, [])

    

  

  return (
    <div className="header">

      <Flex justifyContent={"space-between"} height={"100%"}>

        <div className="header-logo">
          <Image width={"90%"} height={"90%"} src="https://staticfile.batdongsan.com.vn/images/logo/standard/red/logo.svg" />
        </div>

        <Flex justifyContent={"space-around"} alignItems={"center"} flex={"1"}  >
          {/* <Link className="header-nav-link" as={RouterLink} to="/about">Nhà đất</Link> */}
          {/* <Link className="header-nav-link" as={RouterLink} to="/list-user">Danh sách người dùng</Link>
        <Link className="header-nav-link" as={RouterLink} to="/list-properties">Danh sách bất động sản</Link> */}
          {/* <Link className="header-nav-link" as={RouterLink} to="/contact">Tin tức</Link> */}
          {/* <Text variation="primary"
            as="p"
            lineHeight="1.5em"
            fontWeight={600}
            fontSize="14px"
            fontStyle="normal"
            textDecoration="none"
            textAlign={"center"}
            >Ứng dụng quản lý thông tin bất động sản</Text> */}
        </Flex>

        <Flex justifyContent={"flex-end"} alignItems={"center"} flex={"1"}>
          {/* <Link className="header-nav-link" as={RouterLink} to="/login">Đăng nhập</Link> */}
          {/* <Link className="header-nav-link" as={RouterLink} to="/register">Đăng kí</Link> */}
          {/* <Button size="large" onClick={userAttributes}>Đăng tin</Button> */}
          {/* <Button size="large" onClick={signOut}>Đăng xuất</Button> */}
          {check != null ? <Button size="large" onClick={signOut}>Đăng xuất</Button> : null}
        </Flex>
      </Flex>
    </div>
  );
}

export default Header;