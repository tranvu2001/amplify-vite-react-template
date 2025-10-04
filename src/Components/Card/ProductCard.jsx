import { Card, Flex, Heading, Image, Text, View, Icon } from "@aws-amplify/ui-react"
import './productCard.css'

const ProductCard = () => {
  return (
    <Card className="product-card" >
      <Flex direction={"column"}>
        <View className="product-card-top">
          <Image className="product-card-img" src="https://file4.batdongsan.com.vn/crop/393x222/2025/10/03/20251003121757-dff0_wm.jpg" />
        </View>

        <View className="product-card-bottom" padding={"4px"}>
          <View className="product-card-info">
            <Heading level={4} className="product-card-info-name">
              BIỆT THỰ HỒ BƠI VŨNG TÀU
            </Heading>

            <Text className="product-card-info-price">
              16 Tỷ - 130m2
            </Text>

            <Flex alignItems={"center"}>

              

              <Text className="product-card-info-address">
                Vũng Tàu, Bà Rịa Vũng Tàu
              </Text>

            </Flex>
          </View>
        </View>
      </Flex>
    </Card>
  )
}

export default ProductCard