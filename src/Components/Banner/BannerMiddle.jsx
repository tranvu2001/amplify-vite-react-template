import { Image, View } from "@aws-amplify/ui-react";


function BannerMiddle() {
    return (
        <>
        {/* <View>
            <Swiper />

        </View> */}
        <View className="banner-middle" width={"70%"} margin={"0 auto"}>
            <Image  className="banner-middle-img" src="https://tpc.googlesyndication.com/simgad/3790554707409648925"/>
        </View>
        </>
    )
}

export default BannerMiddle;