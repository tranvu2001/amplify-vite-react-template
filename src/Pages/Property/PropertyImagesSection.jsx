import { useState, useMemo } from "react";
import { View, Flex, Heading, Image, Text } from "@aws-amplify/ui-react";

const S3_BASE_URL = "https://bds-image-prod.s3.ap-southeast-1.amazonaws.com/";

function getImageUrl(keyOrUrl: string) {
    if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
        return keyOrUrl;
    }
    return S3_BASE_URL + keyOrUrl.replace(/^\/+/, "");
}

function PropertyImagesSection({ images, isEditMode }: { images?: string[]; isEditMode: boolean }) {
    const list = images ?? [];
    const [activeIndex, setActiveIndex] = useState(0);

    const activeUrl = useMemo(
        () => (list.length ? getImageUrl(list[Math.min(activeIndex, list.length - 1)]) : ""),
        [list, activeIndex]
    );

    return (
        <View
            marginTop="8px"
            paddingTop="16px"
            style={{ borderTop: "1px solid #e5e7eb" }}
        >
            <Heading
                level={4}
                fontSize={16}
                fontWeight={700}
                color="#111827"
                marginBottom="12px"
            >
                Hình ảnh
            </Heading>

            {/* Không có ảnh */}
            {!list.length && (
                <View
                    height="220px"
                    borderRadius="16px"
                    backgroundColor="#f3f4f6"
                    border="1px dashed #d1d5db"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Text color="#9ca3af" fontSize={14}>
                        Chưa có hình ảnh cho bất động sản này
                    </Text>
                </View>
            )}

            {/* Có ảnh */}
            {list.length > 0 && (
                <Flex direction="column" gap="12px">
                    {/* Ảnh chính */}
                    <View
                        height={{ base: "220px", large: "320px" }}
                        borderRadius="16px"
                        overflow="hidden"
                        backgroundColor="#f3f4f6"
                        boxShadow="0 10px 25px rgba(0,0,0,0.05)"
                    >
                        <Image
                            src={activeUrl}
                            alt={`Ảnh ${activeIndex + 1} / ${list.length}`}
                            width="100%"
                            height="100%"
                            objectFit="cover"
                        />
                    </View>

                    {/* Dãy thumbnail nếu có >1 ảnh */}
                    {list.length > 1 && (
                        <Flex
                            direction="row"
                            gap="8px"
                            overflowX="auto"
                            paddingBottom="4px"
                        >
                            {list.map((img, idx) => {
                                const url = getImageUrl(img);
                                const isActive = idx === activeIndex;
                                return (
                                    <View
                                        key={url + idx}
                                        width="80px"
                                        height="64px"
                                        borderRadius="12px"
                                        overflow="hidden"
                                        flexShrink={0}
                                        style={{
                                            cursor: "pointer",
                                            border: isActive
                                                ? "2px solid #2563eb"
                                                : "1px solid #e5e7eb",
                                            boxShadow: isActive
                                                ? "0 0 0 1px rgba(37,99,235,0.2)"
                                                : "none",
                                        }}
                                        onClick={() => setActiveIndex(idx)}
                                    >
                                        <Image
                                            src={url}
                                            alt={`Thumbnail ${idx + 1}`}
                                            width="100%"
                                            height="100%"
                                            objectFit="cover"
                                        />
                                    </View>
                                );
                            })}
                        </Flex>
                    )}

                    {isEditMode && (
                        <Text fontSize={12} color="#6b7280">
                            (Sau này có thể bổ sung nút upload / xoá ảnh trong phần này.)
                        </Text>
                    )}
                </Flex>
            )}
        </View>
    );
}
