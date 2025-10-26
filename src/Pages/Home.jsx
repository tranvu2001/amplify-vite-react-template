import { Link as RouterLink } from "react-router";
import Header from "../Components/Header/Header.jsx";
import Banner from "../Components/Banner/Banner";
import ProductCard from "../Components/Card/ProductCard.jsx";
import { Flex, Heading, View, Text, Link, Grid } from "@aws-amplify/ui-react";
import Swiper from "../Components/Swiper/Swiper.jsx";
import BannerMiddle from "../Components/Banner/BannerMiddle.jsx";



function Home() {
    return (
        <>
            {/* <Header /> */}
            <Banner />
            <View className="section-for-you" margin={"40px 141px"}>
                <Flex alignItems={"center"} justifyContent={"space-between"}>
                    <Heading level={2} marginBottom={"24px"} fontWeight={600} >Bất động sản dành cho bạn</Heading>
                    {/* <Text fontSize={14} color={"#2c2c2c"} className="section-for-you-more">Xem thêm</Text> */}
                    <Link fontSize={14} color={"#2c2c2c"} style={{ marginRight: "12px" }} className="section-for-you-more" as={RouterLink} to="/san-pham">Xem thêm</Link>
                </Flex>
                <Flex wrap={"wrap"} >
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                </Flex>
            </View>

            <View className="content-introduce" margin={"40px 141px"}>
                <Text fontSize={14} lineHeight={2} marginTop={20}>
                Batdongsan.com.vn là nền tảng bất động sản uy tín tại Việt Nam dành cho những người đang tìm kiếm bất động sản để ở hoặc đầu tư. Chúng tôi cung cấp dữ liệu tin rao lớn với đa dạng loại hình bất động sản giúp bạn có những lựa chọn phù hợp với nhu cầu của mình.
                </Text>
            
                <Text fontSize={14} lineHeight={2} marginTop={20}>Ở phân khúc nhà đất bán, các loại hình nổi bật gồm bán căn hộ chung cư, bán nhà riêng, nhà mặt tiền, biệt thự và liền kề, bán đất, đất nền dự án và một số loại hình đang được nhà đầu tư quan tâm như bán condotel, shophouse và khu nghỉ dưỡng. Ngoài ra, người dùng quan tâm đến bất động sản cho thuê có nhiều cơ hội để tìm thấy nhà đất ưng ý với danh sách tin rao được cập nhật liên tục tại các danh mục cho thuê nhà nguyên căn, thuê phòng trọ giá rẻ, thuê văn phòng, mặt bằng kinh doanh.</Text>

                <Text fontSize={14} lineHeight={2} marginTop={20}>Với bộ lọc chi tiết dựa theo khoảng giá, vị trí, diện tích,... bạn có thể dễ dàng chọn lọc bất động sản phù hợp trong hàng ngàn tin rao bán và cho thuê được cập nhật liên tục mỗi ngày. Lượng tin rao chính chủ lớn đáp ứng nhu cầu của những người tìm nhà không qua môi giới.</Text>

                <Text fontSize={14} lineHeight={2} marginTop={20}>Batdongsan.com.vn cũng cung cấp thông tin toàn diện nhất về các dự án căn hộ chung cư, những đánh giá dự án từ góc nhìn chuyên gia giúp bạn ra quyết định đúng đắn. Ở chuyên mục Wiki BĐS có thể tìm thấy các thông tin đánh giá thị trường, những kiến thức, kinh nghiệm mua bán, cho thuê bất động sản để đồng hành cùng bạn trong hành trình tìm nhà.</Text>

                <Text fontSize={14} lineHeight={2} marginTop={20}>Truy cập Batdongsan.com.vn để được cung cấp giải pháp hiệu quả trong lĩnh vực mua bán bất động sản cũng như cho thuê nhà đất tại Việt Nam.</Text>
            </View>
            <View className="section-noi-bat" margin={"40px 141px 0 141px"} height={392}>
                <Heading level={2} marginBottom={"24px"} fontWeight={600}>Dự án bất động sản nổi bật</Heading>
                <Swiper />
            </View>

            <BannerMiddle />

            <View className="bds-theo-dia-diem" height={500} margin={"40px 141px 0 141px"}>
                {/* <Grid 
                     templateColumns={{ base: "1fr", large: "2fr 1fr 1fr" }}
                     templateRows={{ base: "auto", large: "1fr 1fr" }}
                     gap="1rem"
                >
                    <Link
                        style={{ backgroundImage: "url('	https://thietkecanva.vn/wp-content/uploads/2024/10/Canva-bat-dong-san-hinh-anh-bat-dong-san-1.jpg)" }}
                        gridColumn={{ base: "1", large: "1" }}
                        gridRow={{ base: "1", large: "1 / span 2" }}
                    >
                        <Text fontSize={18}>TP Hồ Chí Minh</Text>
                        <br />
                        <Text fontSize={14}>1000 tin đăng</Text>
                    </Link>
                    <Link style={{ backgroundImage: "url('	https://thietkecanva.vn/wp-content/uploads/2024/10/Canva-bat-dong-san-hinh-anh-bat-dong-san-1.jpg)" }}>
                        <Text fontSize={18}>TP Hồ Chí Minh</Text>
                        <br />
                        <Text fontSize={14}>1000 tin đăng</Text>
                    </Link>
                    <Link style={{ backgroundImage: "url('	https://thietkecanva.vn/wp-content/uploads/2024/10/Canva-bat-dong-san-hinh-anh-bat-dong-san-1.jpg)" }}>
                        <Text fontSize={18}>TP Hồ Chí Minh</Text>
                        <br />
                        <Text fontSize={14}>1000 tin đăng</Text>
                    </Link>
                    <Link style={{ backgroundImage: "url('	https://thietkecanva.vn/wp-content/uploads/2024/10/Canva-bat-dong-san-hinh-anh-bat-dong-san-1.jpg)" }}>
                        <Text fontSize={18}>TP Hồ Chí Minh</Text>
                        <br />
                        <Text fontSize={14}>1000 tin đăng</Text>
                    </Link>
                    <Link style={{ backgroundImage: "url('	https://thietkecanva.vn/wp-content/uploads/2024/10/Canva-bat-dong-san-hinh-anh-bat-dong-san-1.jpg)" }}>
                        <Text fontSize={18}>TP Hồ Chí Minh</Text>
                        <br />
                        <Text fontSize={14}>1000 tin đăng</Text>
                    </Link>
                </Grid> */}
                <Heading level={2} marginBottom={"24px"} fontWeight={600}>Bất động sản theo địa điểm</Heading>
                <Grid
                    templateColumns={{ base: "1fr", large: "2fr 1fr 1fr " }}
                    templateRows={{ base: "auto", large: "1fr 1fr" }}
                    gap="10px"
                    height={"100%"}
                >
                    {/* TP.HCM - ô lớn */}
                    <Link
                        rowStart={1}
                        rowEnd={3}
                        style={{
                            backgroundImage:
                                "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRphNk1LiuufRUoqnU6lR7D6V0DH1m88k35Og&s')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "12px",
                            
                        }}
                    >

                        <View style={{ position: "relative", zIndex: 2 }}>
                            <Text fontSize="18px" fontWeight="700" color={"#fff"} position={"absolute"} left={"2%"} top={"20%"}>
                                TP. Hồ Chí Minh
                            </Text>
                            <br />
                            <br />
                            <Text fontSize="14px" fontWeight="600" color={"#fff"} position={"absolute"} left={"2%"} >
                                79.300 tin đăng
                            </Text>
                        </View>
                    </Link>

                    {/* Hà Nội */}
                    <Link
                        style={{
                            backgroundImage:
                                "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRphNk1LiuufRUoqnU6lR7D6V0DH1m88k35Og&s')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "12px",

                        }}
                    >

                        <View style={{ position: "relative", zIndex: 2 }}>
                            <Text fontSize="18px" fontWeight="700" color={"#fff"} position={"absolute"} left={"2%"} top={"20%"}>
                                TP. Hồ Chí Minh
                            </Text>
                            <br />
                            <br />
                            <Text fontSize="14px" fontWeight="600" color={"#fff"} position={"absolute"} left={"2%"} >
                                79.300 tin đăng
                            </Text>
                        </View>
                    </Link>

                    {/* Đà Nẵng */}
                    <Link
                        style={{
                            backgroundImage:
                                "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRphNk1LiuufRUoqnU6lR7D6V0DH1m88k35Og&s')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "12px",

                        }}
                    >

                        <View style={{ position: "relative", zIndex: 2 }}>
                            <Text fontSize="18px" fontWeight="700" color={"#fff"} position={"absolute"} left={"2%"} top={"20%"}>
                                TP. Hồ Chí Minh
                            </Text>
                            <br />
                            <br />
                            <Text fontSize="14px" fontWeight="600" color={"#fff"} position={"absolute"} left={"2%"} >
                                79.300 tin đăng
                            </Text>
                        </View>
                    </Link>

                    {/* Bình Dương */}
                    <Link
                        style={{
                            backgroundImage:
                                "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRphNk1LiuufRUoqnU6lR7D6V0DH1m88k35Og&s')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "12px",

                        }}
                    >

                        <View style={{ position: "relative", zIndex: 2 }}>
                            <Text fontSize="18px" fontWeight="700" color={"#fff"} position={"absolute"} left={"2%"} top={"20%"}>
                                TP. Hồ Chí Minh
                            </Text>
                            <br />
                            <br />
                            <Text fontSize="14px" fontWeight="600" color={"#fff"} position={"absolute"} left={"2%"} >
                                79.300 tin đăng
                            </Text>
                        </View>
                    </Link>

                    {/* Đồng Nai */}
                    <Link
                        style={{
                            backgroundImage:
                                "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRphNk1LiuufRUoqnU6lR7D6V0DH1m88k35Og&s')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "12px",

                        }}
                    >


                        <View style={{ position: "relative", zIndex: 2 }}>
                            <Text fontSize="18px" fontWeight="700" color={"#fff"} position={"absolute"} left={"2%"} top={"20%"}>
                                TP. Hồ Chí Minh
                            </Text>
                            <br />
                            <br />
                            <Text fontSize="14px" fontWeight="600" color={"#fff"} position={"absolute"} left={"2%"} >
                                79.300 tin đăng
                            </Text>
                        </View>
                    </Link>
                </Grid>
            </View>

            {/* <Outlet /> */}
        </>
    )
}

export default Home;