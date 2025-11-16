import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
    Card,
    Flex,
    Heading,
    View,
    Text,
    TextField,
    Button,
    Loader,
    Image,
} from "@aws-amplify/ui-react";

import PropertyServices from "../../axios/PropertyServices";
import LocationService from "../../axios/LocationService";
import CustomSelect from "../../Components/Select/Select";

const PropertyDetail = () => {
    const { propertyId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const isCreate = propertyId === "new";
    const isEditMode = isCreate || searchParams.get("mode") === "edit";

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
        province: "",
        ward: "",
        types: [],
        statuses: [],
        priceMin: "",
        priceMax: "",
    });
    const [newImageFiles, setNewImageFiles] = useState([]);

    // ================== LOAD PROPERTY / INIT FORM ==================
    useEffect(() => {
        if (!propertyId || isCreate) {
            setProperty(null);
            setFormData({
                title: "",
                price: "",
                price_display: "",
                currency: "VND",
                listingType: "SALE",
                type: "HOUSE",
                status: "",
                userName: "",
                address: "",
                province: "",
                ward: "",
                lat: "",
                lng: "",
                images: [],
            });
            setFilters((f) => ({
                ...f,
                province: "",
                ward: "",
            }));
            setLoading(false);
            return;
        }

        setLoading(true);
        PropertyServices.getPropertyById(propertyId)
            .then((res) => {
                const p = res.data;
                setProperty(p);
                setFormData({
                    title: p.title || "",
                    price: p.price ?? "",
                    price_display: p.price_display ?? "",
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
                    images: Array.isArray(p.images) ? p.images : [],
                });
                setFilters((f) => ({
                    ...f,
                    province: p.province || "",
                    ward: p.ward || "",
                }));
            })
            .finally(() => setLoading(false));
    }, [propertyId, isCreate]);

    // ================== LOAD PROVINCE / WARD ==================
    useEffect(() => {
        (async () => {
            const data = await LocationService.getProvinces();
            setProvinceList(data.map((p) => ({ value: p.name, label: p.name })));
            const codeMap = data.reduce((acc, p) => {
                acc[p.name] = p.id;
                return acc;
            }, {});
            setProvinceCodeByName(codeMap);
        })();
    }, []);

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
            setWardList(data.map((w) => ({ value: w.name, label: w.name })));
        })();
    }, [filters.province, provinceCodeByName]);

    const selectedProvinceName = formData?.province || "";
    const selectedWardName = formData?.ward || "";

    // ================== COMMON HELPERS ==================
    const updateField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const formatNumber = (value) => {
        if (value === "" || value === null || value === undefined) return "";
        return Number(value).toLocaleString("vi-VN");
    };

    // ================== GEO ==================
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

    // ================== IMAGE HANDLING ==================
    const handleSelectImages = (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const mapped = files.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));

        setNewImageFiles((prev) => [...prev, ...mapped]);

        setFormData((prev) => ({
            ...prev,
            images: [
                ...(prev?.images || []),
                ...mapped.map((m) => m.previewUrl),
            ],
        }));
        
        e.target.value = "";
    };

    const handleRemoveImage = (url) => {
        setFormData((prev) => ({
            ...prev,
            images: (prev?.images || []).filter((u) => u !== url),
        }));

        if (url.startsWith("blob:")) {
            setNewImageFiles((prev) => prev.filter((i) => i.previewUrl !== url));
        }
    };

    const imagesList = formData?.images || [];
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        if (activeImageIndex >= imagesList.length) {
            setActiveImageIndex(imagesList.length > 0 ? imagesList.length - 1 : 0);
        }
    }, [imagesList.length, activeImageIndex]);

    const activeImageUrl = useMemo(() => {
        if (!imagesList.length) return "";
        return imagesList[activeImageIndex];
    }, [imagesList, activeImageIndex]);

    // ================== SAVE / DELETE ==================
    const handleSave = async () => {
        if (!formData) return;

        setSaving(true);
        try {
            const allImages = formData.images || [];
            const existingImages = allImages.filter((u) => !u.startsWith("blob:"));
            const filesToUpload = newImageFiles.map((i) => i.file);

            if (isCreate) {
                const baseCreatePayload = {
                    ...formData,
                    images: [],
                    price: Number(formData.price) || 0
                };

                const resCreate = await PropertyServices.createProperty(baseCreatePayload);
                const created = resCreate.data;
                const newId = created.propertyId;

                let finalImages = existingImages;

                if (filesToUpload.length) {
                    const filesMeta = filesToUpload.map((f) => ({
                        fileName: f.name,
                        contentType: f.type || "application/octet-stream"
                    }));

                    const resUrls = await PropertyServices.getImageUploadUrls(newId, filesMeta);
                    const urlItems = resUrls.data.urls || [];

                    await Promise.all(
                        urlItems.map((u, idx) =>
                            fetch(u.uploadUrl, {
                                method: "PUT",
                                headers: { "Content-Type": filesMeta[idx].contentType },
                                body: filesToUpload[idx]
                            })
                        )
                    );

                    const uploadedUrls = urlItems.map((u) => u.fileUrl);
                    finalImages = [...existingImages, ...uploadedUrls];

                    if (finalImages.length) {
                        const updatePayload = {
                            ...created,
                            images: finalImages
                        };
                        delete updatePayload.propertyId;

                        const resUpdate = await PropertyServices.updateProperty(newId, updatePayload);
                        const updated = resUpdate.data;

                        setProperty(updated);
                        setFormData({
                            ...updated,
                            images: updated.images || []
                        });
                    } else {
                        setProperty(created);
                        setFormData({
                            ...created,
                            images: created.images || []
                        });
                    }
                } else {
                    setProperty(created);
                    setFormData({
                        ...created,
                        images: created.images || []
                    });
                }

                setNewImageFiles([]);
                navigate(`/list-properties/${newId}`);
                return;
            }

            let finalImages = existingImages;

            if (filesToUpload.length) {
                const filesMeta = filesToUpload.map((f) => ({
                    fileName: f.name,
                    contentType: f.type || "application/octet-stream"
                }));

                const resUrls = await PropertyServices.getImageUploadUrls(propertyId, filesMeta);
                const urlItems = resUrls.data.urls || [];

                await Promise.all(
                    urlItems.map((u, idx) =>
                        fetch(u.uploadUrl, {
                            method: "PUT",
                            headers: { "Content-Type": filesMeta[idx].contentType },
                            body: filesToUpload[idx]
                        })
                    )
                );

                const uploadedUrls = urlItems.map((u) => u.fileUrl);
                finalImages = [...existingImages, ...uploadedUrls];
            }

            const basePayload = {
                ...formData,
                images: finalImages,
                price: Number(formData.price) || 0
            };

            if (!property) {
                alert("Không tìm thấy dữ liệu bất động sản để cập nhật.");
                setSaving(false);
                return;
            }

            const payload = {
                ...property,
                ...basePayload
            };
            delete payload.propertyId;

            const res = await PropertyServices.updateProperty(propertyId, payload);
            const updated = res.data;

            setProperty(updated);
            setFormData({
                ...updated,
                images: updated.images || []
            });
            setNewImageFiles([]);
            navigate(`/list-properties/${propertyId}`);
        } catch (err) {
            console.error(err);
            alert(isCreate ? "Lỗi khi tạo bất động sản." : "Lỗi khi lưu bất động sản.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa bất động sản này?")) return;

        setDeleting(true);
        try {
            await PropertyServices.deleteProperty(propertyId);
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi xóa bất động sản.");
        } finally {
            setDeleting(false);
        }
    };

    // ================== LOADING OVERLAY ==================
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

    // ================== RENDER ==================
    return (
        <View
            padding="24px"
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
                        {isCreate
                            ? "Thêm bất động sản"
                            : isEditMode
                            ? "Chỉnh sửa bất động sản"
                            : "Chi tiết bất động sản"}
                    </Heading>

                    <Flex gap="8px">
                        <Button onClick={() => navigate(-1)} size="small">
                            Quay lại
                        </Button>

                        {!isCreate && !isEditMode && (
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

                        {isEditMode && (
                            <>
                                {!isCreate && (
                                    <Button
                                        size="small"
                                        variation="destructive"
                                        isLoading={deleting}
                                        onClick={handleDelete}
                                    >
                                        Xóa
                                    </Button>
                                )}
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
                        {/* Tên & Giá */}
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
                                    type="text"
                                    inputMode="decimal"
                                    value={
                                        formData.price_display ??
                                        (formData.price === "" ||
                                        formData.price === null ||
                                        formData.price === undefined
                                            ? ""
                                            : formatNumber(formData.price))
                                    }
                                    isDisabled={!isEditMode}
                                    onChange={(e) => {
                                        const raw = e.target.value.replace(/[^\d]/g, "");
                                        updateField("price", raw === "" ? "" : Number(raw));
                                        updateField(
                                            "price_display",
                                            raw === "" ? "" : formatNumber(raw)
                                        );
                                    }}
                                    onBlur={() => {
                                        if (
                                            formData.price !== "" &&
                                            formData.price !== null &&
                                            formData.price !== undefined
                                        ) {
                                            updateField(
                                                "price_display",
                                                formatNumber(formData.price)
                                            );
                                        }
                                    }}
                                />
                            </View>
                        </Flex>

                        {/* Danh mục / Loại / Trạng thái */}
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
                                        {
                                            id: "DEPOSIT HAS BEEN REACHED",
                                            name: "Đã đặt cọc",
                                        },
                                    ]}
                                    isDisabled={!isEditMode}
                                />
                            </View>
                        </Flex>

                        {/* Info thêm */}
                        {!isCreate && property && (
                            <Flex
                                direction={{ base: "column", large: "row" }}
                                gap="16px"
                            >
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
                        )}

                        {/* ========== HÌNH ẢNH ========== */}
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
                            {!imagesList.length && (
                                <View
                                    height="220px"
                                    borderRadius="16px"
                                    backgroundColor="#f9fafb"
                                    border="1px dashed #d1d5db"
                                    display="flex"
                                    justifyContent="center"
                                    alignItems="center"
                                    marginBottom="12px"
                                >
                                    <Text color="#9ca3af" fontSize={14}>
                                        Chưa có hình ảnh cho bất động sản này
                                    </Text>
                                </View>
                            )}

                            {/* Có ảnh */}
                            {imagesList.length > 0 && (
                                <Flex direction="column" gap="12px">
                                    <View
                                        height={{ base: "220px", large: "320px" }}
                                        borderRadius="16px"
                                        overflow="hidden"
                                        backgroundColor="#f3f4f6"
                                        style={{
                                            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
                                            position: "relative",
                                        }}
                                    >
                                        <Image
                                            src={activeImageUrl}
                                            alt={`Ảnh ${
                                                activeImageIndex + 1
                                            } / ${imagesList.length}`}
                                            width="100%"
                                            height="100%"
                                            objectFit="cover"
                                        />
                                        {isEditMode && (
                                            <Button
                                                size="small"
                                                variation="destructive"
                                                style={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                }}
                                                onClick={() =>
                                                    handleRemoveImage(activeImageUrl)
                                                }
                                            >
                                                Xóa ảnh này
                                            </Button>
                                        )}
                                    </View>

                                    {imagesList.length > 1 && (
                                        <Flex
                                            direction="row"
                                            gap="8px"
                                            overflowX="auto"
                                            paddingBottom="4px"
                                        >
                                            {imagesList.map((url, idx) => {
                                                const isActive =
                                                    idx === activeImageIndex;
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
                                                        }}
                                                        onClick={() =>
                                                            setActiveImageIndex(idx)
                                                        }
                                                    >
                                                        <Image
                                                            src={url}
                                                            alt={`Thumbnail ${
                                                                idx + 1
                                                            }`}
                                                            width="100%"
                                                            height="100%"
                                                            objectFit="cover"
                                                        />
                                                    </View>
                                                );
                                            })}
                                        </Flex>
                                    )}
                                </Flex>
                            )}

                            {/* Nút thêm ảnh */}
                            {isEditMode && (
                                <View marginTop="12px">
                                    <label
                                        style={{
                                            display: "inline-block",
                                            padding: "6px 12px",
                                            borderRadius: 8,
                                            border: "1px solid #2563eb",
                                            color: "#2563eb",
                                            fontSize: 13,
                                            cursor: "pointer",
                                        }}
                                    >
                                        + Thêm ảnh
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            style={{ display: "none" }}
                                            onChange={handleSelectImages}
                                        />
                                    </label>
                                    <Text
                                        as="span"
                                        fontSize={12}
                                        color="#6b7280"
                                        marginLeft="8px"
                                    >
                                        (Có thể chọn nhiều ảnh, xem trước ngay. Khi lưu
                                        sẽ upload lên S3.)
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* ========== ĐỊA CHỈ & TỌA ĐỘ ========== */}
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

                                <Flex
                                    direction={{ base: "column", large: "row" }}
                                    gap="16px"
                                >
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
                                            onChange={(val) => {
                                                setFilters((f) => ({
                                                    ...f,
                                                    province: val,
                                                    ward: "",
                                                }));
                                                updateField("province", val);
                                                updateField("ward", "");
                                            }}
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
                                            onChange={(val) => {
                                                setFilters((f) => ({
                                                    ...f,
                                                    ward: val,
                                                }));
                                                updateField("ward", val);
                                            }}
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
