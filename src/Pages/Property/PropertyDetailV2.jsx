import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import {
    Card,
    Flex,
    Heading,
    View,
    Text,
    TextField,
    Button,
    Loader,
} from "@aws-amplify/ui-react";

import PropertyServices from "../../axios/PropertyServices";
import LocationService from "../../axios/LocationService";
import CustomSelect from "../../Components/Select/Select"

const PropertyDetail = () => {
    const { propertyId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    
    const searchParams = new URLSearchParams(location.search);
    const isEditMode = searchParams.get("mode") === "edit";
    
    const [property, setProperty] = useState(null);
    const [formData, setFormData] = useState(null);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [savingCoord, setSavingCoord] = useState(false);
    
    const [provinceList, setProvinceList] = useState([]);
    const [provinceCodeByName, setProvinceCodeByName] = useState({});
    
    const [wardList, setWardList] = useState([]);
    
    const [filters, setFilters] = useState({
        province: '',
        ward: '',
        types: [],
        statuses: [],
        priceMin: '',
        priceMax: ''
    });
    // ===== Load property =====
    useEffect(() => {
        if (!propertyId) return;
        setLoading(true);
        
        PropertyServices.getPropertyById(propertyId)
        .then((res) => {
            const p = res.data;
            setProperty(p);
            
            setFormData({
                title: p.title || "",
                price: p.price ?? "",
                currency: p.currency || "VND",
                listingType: p.listingType || "SALE",
                type: p.type || "HOUSE",
                status: p.status || "",
                userName: p.userName || "",
                address: p.address || "",
                province: p.province || "",
                ward: p.ward || "",
                lat: p.lat ?? "",
                lng: p.lng ?? "",
            });

            setFilters(f => ({
                ...f,
                province: p.province || "",
                ward: p.ward || "",
            }));
        })
        .finally(() => setLoading(false));
    }, [propertyId]);
    
    // ===== Load provinces =====
    useEffect(() => {
        (async () => {
            const data = await LocationService.getProvinces();
            setProvinceList(
                data.map(p => ({ value: p.name, label: p.name }))
            );
            setProvinceCodeByName(
            data.reduce((acc, p) => {
                acc[p.name] = p.id;
                return acc;
            }, {})
            );
        })();
    }, []);
    
    // Map provinceCode theo tên nếu DB chưa lưu code
    useEffect(() => {
        if (!filters.province) {
            setWardList([]);
            return;
        }
        (async () => {
            const provinceCode = provinceCodeByName[filters.province];
            if (!provinceCode) {
            setWardList([]);
            return;
            }
            const data = await LocationService.getWardsByProvince(provinceCode);
            setWardList(
            data.map(w => ({ value: w.name, label: w.name }))
            );
        })();
    }, [filters.province, provinceCodeByName]);
    
    const selectedProvinceName = formData?.province || "";
    const selectedWardName = formData?.ward || "";
    
    // ===== Handler: thay đổi field chung =====
    const updateField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    
    // ===== Handler: cập nhật tọa độ (client) =====
    const handleUpdateCoordinates = async () => {
        if (!formData?.address || !formData?.province || !formData?.ward) {
            alert("Vui lòng nhập địa chỉ, chọn Tỉnh/TP và Phường/Xã trước.");
            return;
        }
        
        const provinceName = selectedProvinceName;
        const wardName = selectedWardName;
        
        setSavingCoord(true);
        try {
            const geo = await LocationService.geocodeAddress({
                address: formData.address,
                wardName,
                provinceName,
            });
            
            if (!geo) {
                alert("Không tìm được tọa độ phù hợp cho địa chỉ này.");
                return;
            }
            
            setFormData((prev) => ({
                ...prev,
                lat: geo.lat,
                lng: geo.lng,
            }));
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lấy tọa độ. Kiểm tra lại config Amazon Location / Cognito.");
        } finally {
            setSavingCoord(false);
        }
    };
    
    // ===== Handler: Save (cập nhật DB) =====
    const handleSave = async () => {
        if (!formData || !property) return;
        
        setSaving(true);
        try {
            const payload = {
                ...property,
                ...formData,
                price: Number(formData.price) || 0,
            };

            delete payload.propertyId;console.log(payload)

            const res = await PropertyServices.updateProperty(propertyId, payload);
            setProperty(res.data);
            setFormData(res.data);

            alert("Đã lưu bất động sản.");
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lưu bất động sản.");
        } finally {
            setSaving(false);
        }
    };

    
    // ===== Handler: Delete =====
    const handleDelete = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa bất động sản này?")) return;
        
        setDeleting(true);
        try {
            await PropertyServices.deleteProperty(propertyId);
            alert("Đã xóa bất động sản.");
            navigate(-1); // hoặc navigate('/properties');
        } catch (err) {
            console.error(err);
            alert("Lỗi khi xóa bất động sản.");
        } finally {
            setDeleting(false);
        }
    };
    
    // ===== Loading / error =====
    if (loading || !formData) {
        return (
            <View
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: "rgba(155, 150, 150, 0.3)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
            >
            <Loader size="large" />
            </View>
        );
    }
    
    if (!property) {
        return <Text>Không tìm thấy bất động sản.</Text>;
    }
    
    // ===== UI =====
    return (
        <View
        padding="24px"
        backgroundColor="#f3f4f6"
        minHeight="100vh"
        style={{ boxSizing: "border-box" }}
        >
        <View maxWidth="960px" margin="0 auto">
        <Flex
        justifyContent="space-between"
        alignItems="center"
        marginBottom="16px"
        >
        <Heading
        level={2}
        fontWeight={700}
        textAlign="left"
        color="#111827"
        >
        {isEditMode ? "Chỉnh sửa bất động sản" : "Chi tiết bất động sản"}
        </Heading>
        
        <Flex gap="8px">
        {/* Nút quay lại: luôn có */}
        <Button onClick={() => navigate(-1)} size="small">
        Quay lại
        </Button>
        
        {/* View mode: có nút Sửa */}
        {!isEditMode && (
            <Button
            size="small"
            variation="primary"
            onClick={() =>
                navigate(`/list-properties/${propertyId}?mode=edit`)
            }
            >
            Sửa
            </Button>
        )}
        
        {/* Edit mode: có Xóa + Lưu */}
        {isEditMode && (
            <>
            <Button
            size="small"
            variation="destructive"
            isLoading={deleting}
            onClick={handleDelete}
            >
            Xóa
            </Button>
            <Button
            size="small"
            variation="primary"
            isLoading={saving}
            onClick={handleSave}
            >
            Lưu
            </Button>
            </>
        )}
        </Flex>
        </Flex>
        
        <Card
        variation="outlined"
        padding="24px"
        style={{
            borderRadius: "12px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
            backgroundColor: "white",
        }}
        >
        <Flex direction="column" gap="24px">
        {/* Tổng quan */}
        <Flex direction={{ base: "column", large: "row" }} gap="24px">
        <View flex="1">
        <TextField
        label="Tên bất động sản"
        value={formData.title}
        isDisabled={!isEditMode}
        onChange={(e) => updateField("title", e.target.value)}
        />
        </View>
        
        <View flex="1">
        <TextField
        label="Giá"
        value={formData.price}
        isDisabled={!isEditMode}
        onChange={(e) => updateField("price", e.target.value)}
        />
        </View>
        </Flex>
        
        {/* Loại / danh mục / trạng thái */}
        <Flex direction={{ base: "column", large: "row" }} gap="16px">
        <View flex="1">
        <label
        style={{
            fontSize: 12,
            color: "#6b7280",
            marginBottom: 4,
            display: "block",
        }}
        >
        Danh mục
        </label>
        <CustomSelect
        value={formData.listingType}
        onChange={(val) => updateField("listingType", val)}
        placeholder="Chọn danh mục"
        options={[
            { id: "SALE", name: "Bán" },
            { id: "RENT", name: "Cho thuê" },
        ]}
        isDisabled={!isEditMode}
        />
        </View>
        
        <View flex="1">
        <label
        style={{
            fontSize: 12,
            color: "#6b7280",
            marginBottom: 4,
            display: "block",
        }}
        >
        Kiểu bất động sản
        </label>
        <CustomSelect
        value={formData.type}
        onChange={(val) => updateField("type", val)}
        placeholder="Chọn loại"
        options={[
            { id: "HOUSE", name: "Nhà" },
            { id: "APARTMENT", name: "Căn hộ" },
            { id: "LAND", name: "Đất" },
        ]}
        isDisabled={!isEditMode}
        />
        </View>
        
        <View flex="1">
        <label
        style={{
            fontSize: 12,
            color: "#6b7280",
            marginBottom: 4,
            display: "block",
        }}
        >
        Trạng thái
        </label>
        <CustomSelect
        value={formData.status}
        onChange={(val) => updateField("status", val)}
        placeholder="Chọn trạng thái"
        options={[
            { id: "PUBLISHED", name: "Đã đăng" },
            { id: "NEGOTIATE", name: "Thương lượng" },
            { id: "DEPOSIT HAS BEEN REACHED", name: "Đã đặt cọc" },
        ]}
        isDisabled={!isEditMode}
        />
        </View>
        </Flex>
        
        {/* Thời gian & người đăng (read-only) */}
        <Flex direction={{ base: "column", large: "row" }} gap="16px">
        <View flex="1">
        <Text fontSize={13} color="#6b7280">
        Ngày đăng
        </Text>
        <Text fontSize={15}>
        {property.createdAt
            ? new Intl.DateTimeFormat("vi-VN", {
                dateStyle: "medium",
                timeStyle: "short",
            }).format(new Date(property.createdAt))
            : ""}
            </Text>
            </View>
            
            <View flex="1">
            <Text fontSize={13} color="#6b7280">
            Ngày chỉnh sửa
            </Text>
            <Text fontSize={15}>
            {property.updatedAt
                ? new Intl.DateTimeFormat("vi-VN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                }).format(new Date(property.updatedAt))
                : property.createdAt
                ? new Intl.DateTimeFormat("vi-VN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                }).format(new Date(property.createdAt))
                : ""}
                </Text>
                </View>
                
                <View flex="1">
                <Text fontSize={13} color="#6b7280">
                Người rao bán
                </Text>
                <Text fontSize={15}>{property.userName}</Text>
                </View>
                </Flex>
                
                {/* Địa chỉ & tọa độ */}
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
                Địa chỉ & tọa độ
                </Heading>
                
                <Flex direction="column" gap="12px">
                <TextField
                label="Địa chỉ chi tiết"
                value={formData.address}
                isDisabled={!isEditMode}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Ví dụ: KĐT Splendora Bắc An Khánh"
                />
                
                <Flex direction={{ base: "column", large: "row" }} gap="16px">
                <View flex="1">
                <label
                style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                    display: "block",
                }}
                >
                Tỉnh / Thành phố
                </label>
                <CustomSelect
                value={filters.province}
                onChange={(val) => setFilters(f => ({ ...f, province: val, ward: '' }))}
                placeholder="-- Chọn Tỉnh/TP --"
                options={provinceList}
                isDisabled={!isEditMode}
                />
                </View>
                
                <View flex="1">
                <label
                style={{
                    fontSize: 12,
                    color: "#6b7280",
                    marginBottom: 4,
                    display: "block",
                }}
                >
                Phường / Xã
                </label>
                <CustomSelect
                value={filters.ward}
                onChange={(val) => setFilters(f => ({ ...f, ward: val }))}
                placeholder="-- Chọn Phường/Xã --"
                options={wardList}
                isDisabled={!isEditMode}
                />
                </View>
                </Flex>
                
                <Flex
                direction={{ base: "column", large: "row" }}
                gap="16px"
                alignItems="flex-end"
                >
                <View flex="1">
                <TextField
                label="Vĩ độ (lat)"
                value={formData.lat}
                isDisabled={true}
                />
                </View>
                <View flex="1">
                <TextField
                label="Kinh độ (lng)"
                value={formData.lng}
                isDisabled={true}
                />
                </View>
                
                {isEditMode && (
                    <View>
                    <Button
                    variation="primary"
                    isLoading={savingCoord}
                    onClick={handleUpdateCoordinates}
                    >
                    Cập nhật tọa độ
                    </Button>
                    </View>
                )}
                </Flex>
                </Flex>
                </View>
                </Flex>
                </Card>
                </View>
                </View>
            );
        };
        
        export default PropertyDetail;
        