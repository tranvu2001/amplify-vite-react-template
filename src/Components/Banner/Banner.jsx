import { Image, View } from "@aws-amplify/ui-react";
import Swiper from "../Swiper/Swiper";
import SearchTab from "../Tabs/SearchTab";
import 'swiper/css';

function Banner() {
    return (
        <>
        {/* <View>
            <Swiper />

        </View> */}
        <View className="banner" >
            <Image width={"100%"} className="banner-img" src="https://treobangron.com.vn/wp-content/uploads/2023/07/bannerbatdongsan06-1.jpg"/>
            <SearchTab />
        </View>
        </>
    )
}

export default Banner;