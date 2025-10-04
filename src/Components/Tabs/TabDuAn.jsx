import { Flex, SearchField, SelectField, View } from "@aws-amplify/ui-react";
import PriceFilter from "./PriceFilter";

function TabDuAn() {
    return (
        <View as={"div"} width={"945px"} marginTop={"10px"} left={"calc(50% - 504.5px)"}>
        <SearchField size="large" label="Nhập tỉnh thành" placeholder="Nhập tỉnh thành"/>
        <Flex justifyContent={"space-between"}>
            {/* <SelectField   descriptiveText="Chọn tỉnh thành">
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
            </SelectField> */}
            
            <SelectField width={"300px"}   descriptiveText="Loại nhà đất">
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
            </SelectField>
            <SelectField width={"300px"}   descriptiveText="Khoảng giá">
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
            </SelectField>
            <SelectField width={"300px"}  descriptiveText="Diện tích">
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
                <option value={"hcm"}>Thành phố Hồ Chí Minh</option>
            </SelectField>
            {/* <PriceFilter /> */}
            </Flex>
        </View>
    )
}

export default TabDuAn;