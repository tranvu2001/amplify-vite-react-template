import { useState } from "react";
import {
  View,
  Flex,
  Text,
  Button,
  TextField,
  RadioGroupField,
  Radio,
  Heading,
} from "@aws-amplify/ui-react";

export default function PriceFilter({ onApply, onClose }) {
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(60000); // tính theo triệu
  const [rangeOption, setRangeOption] = useState("all");

  const resetFilter = () => {
    setMin(0);
    setMax(60000);
    setRangeOption("all");
  };

  const handleApply = () => {
    onApply({ min, max, rangeOption });
  };

  return (
    <View
      backgroundColor="white"
      padding="1rem"
      borderRadius="medium"
      maxWidth="400px"
      boxShadow="medium"
    >
      {/* Header */}
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={5}>Khoảng giá</Heading>
        <Button variation="link" onClick={onClose}>
          ✕
        </Button>
      </Flex>

      {/* Min - Max input */}
      <Flex direction="row" alignItems="center" gap="0.5rem">
        <TextField
          label="Từ"
          labelHidden
          type="number"
          value={min}
          onChange={(e) => setMin(Number(e.target.value))}
          width="100%"
        />
        <Text fontSize="large">→</Text>
        <TextField
          label="Đến"
          labelHidden
          type="number"
          value={max}
          onChange={(e) => setMax(Number(e.target.value))}
          width="100%"
        />
      </Flex>

      {/* Options */}
      <RadioGroupField
        legend="Chọn nhanh"
        value={rangeOption}
        onChange={(e) => setRangeOption(e.target.value)}
        marginTop="1rem"
      >
        <Radio value="all">Tất cả khoảng giá</Radio>
        <Radio value="duoi500">Dưới 500 triệu</Radio>
        <Radio value="500-800">500 - 800 triệu</Radio>
        <Radio value="800-1000">800 triệu - 1 tỷ</Radio>
      </RadioGroupField>

      {/* Footer buttons */}
      <Flex justifyContent="space-between" marginTop="1rem">
        <Button variation="link" onClick={resetFilter}>
          Đặt lại
        </Button>
        <Button variation="primary" onClick={handleApply}>
          Áp dụng
        </Button>
      </Flex>
    </View>
  );
}
