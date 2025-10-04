import { Link as RouterLink } from "react-router";
import { Link, Flex, Button, Image } from '@aws-amplify/ui-react';
import './Header.css'

function Header() {
  return (
    <div className="header">
      
      <Flex justifyContent={"space-between"} height={"100%"}>
        
      <div className="header-logo">
          <Image width={"90%"} height={"90%"} src="https://staticfile.batdongsan.com.vn/images/logo/standard/red/logo.svg"/>
        </div>
      
      <Flex justifyContent={"space-around"} alignItems={"center"} flex={"1"}  >
        <Link className="header-nav-link" as={RouterLink} to="/about">Nhà đất</Link>
        <Link className="header-nav-link" as={RouterLink} to="/contact">Nhà cho thuê</Link>
        <Link className="header-nav-link" as={RouterLink} to="/contact">Dự án</Link>
        <Link className="header-nav-link" as={RouterLink} to="/contact">Tin tức</Link>
      </Flex>

      <Flex justifyContent={"flex-end"} alignItems={"center"} flex={"1"}>
        <Link className="header-nav-link" as={RouterLink} to="/login">Đăng nhập</Link>
        <Link className="header-nav-link" as={RouterLink} to="/register">Đăng kí</Link>
        <Button size="large">Đăng tin</Button>
      </Flex>
      </Flex>
    </div>
  );
}

export default Header;