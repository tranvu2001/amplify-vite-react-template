import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
    Card,
    Flex,
    Heading,
    View,
    TextField,
    Button,
    Loader,
    Text,
} from "@aws-amplify/ui-react";

import TenantServices from "../../axios/TenantServices";
import CustomSelect from "../../Components/Select/Select";

const TenantDetail = () => {
    const { tenantId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const isCreate = tenantId === "new";
    const isEditMode = isCreate || searchParams.get("mode") === "edit";

    const [formData, setFormData] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const updateField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName?.trim()) newErrors.fullName = "Tên người thuê là bắt buộc.";
        if (!formData.email?.trim()) newErrors.email = "Email là bắt buộc.";
        else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) newErrors.email = "Email không hợp lệ.";
        }

        if (!formData.gender) newErrors.gender = "Giới tính là bắt buộc.";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Ngày sinh là bắt buộc.";

        if (!formData.phone?.trim()) newErrors.phone = "Số điện thoại là bắt buộc.";
        else {
            const phoneRegex = /^0\d{9,10}$/;
            if (!phoneRegex.test(formData.phone)) newErrors.phone = "Số điện thoại không hợp lệ.";
        }

        if (!formData.address?.trim()) newErrors.address = "Địa chỉ là bắt buộc.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (!tenantId || isCreate) {
            setFormData({
                fullName: "",
                email: "",
                gender: "",
                address: "",
                dateOfBirth: "",
                phone: "",
                nationalId: "",
                status: "ACTIVE",
                note: "",
            });
            setLoading(false);
            return;
        }

        setLoading(true);
        TenantServices.getUserById(tenantId)
            .then((res) => {
                const t = res.data || {};
                setFormData({
                    fullName: t.fullName || "",
                    email: t.email || "",
                    gender: t.gender || "",
                    address: t.address || "",
                    dateOfBirth: t.dateOfBirth || "",
                    phone: t.phone || "",
                    nationalId: t.nationalId || "",
                    status: t.status || "ACTIVE",
                    note: t.note || "",
                    createdAt: t.createdAt,
                    updatedAt: t.updatedAt,
                    tenantId: t.tenantId,
                });
            })
            .finally(() => setLoading(false));
    }, [tenantId, isCreate]);

    const handleSave = async () => {
        if (!formData) return;
        if (!validateForm()) return;

        setSaving(true);
        try {
            const payload = { ...formData };
            delete payload.createdAt;
            delete payload.updatedAt;
            delete payload.tenantId;

            let res;
            if (isCreate) {
                res = await TenantServices.createUser(payload);
            } else {
                res = await TenantServices.updateUser(payload, tenantId);
            }

            const t = res.data;
            setFormData({
                fullName: t.fullName || "",
                email: t.email || "",
                gender: t.gender || "",
                address: t.address || "",
                dateOfBirth: t.dateOfBirth || "",
                phone: t.phone || "",
                nationalId: t.nationalId || "",
                status: t.status || "ACTIVE",
                note: t.note || "",
                createdAt: t.createdAt,
                updatedAt: t.updatedAt,
                tenantId: t.tenantId,
            });

            const id = t.tenantId || tenantId;
            navigate(`/list-tenant/${id}`);
        } catch (err) {
            console.error(err);
            alert(isCreate ? "Lỗi khi tạo người thuê." : "Lỗi khi lưu người thuê.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!tenantId) return;
        if (!window.confirm("Bạn có chắc muốn xóa người thuê này?")) return;

        setDeleting(true);
        try {
            await TenantServices.deleteUser(tenantId);
            navigate("/list-tenant");
        } catch (err) {
            console.error(err);
            alert("Lỗi khi xóa người thuê.");
        } finally {
            setDeleting(false);
        }
    };

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

    const renderError = (field) =>
        errors[field] ? (
            <Text color="red" fontSize={12} marginTop="4px">
                {errors[field]}
            </Text>
        ) : null;

    return (
        <View
            padding="24px"
            backgroundColor="#f3f4f6"
            minHeight="100vh"
            style={{ boxSizing: "border-box" }}
        >
            <View maxWidth="960px" margin="0 auto">
                <Flex justifyContent="space-between" alignItems="center" marginBottom="16px">
                    <Heading level={2} fontWeight={700} textAlign="left" color="#111827">
                        {isCreate
                            ? "Thêm người thuê"
                            : isEditMode
                            ? "Chỉnh sửa người thuê"
                            : "Chi tiết người thuê"}
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
                                    navigate(`/list-tenant/${tenantId}?mode=edit`)
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
                        <Flex direction={{ base: "column", large: "row" }} gap="24px">
                            <View flex="1">
                                <TextField
                                    label="Tên người thuê"
                                    value={formData.fullName}
                                    isDisabled={!isEditMode}
                                    onChange={(e) => updateField("fullName", e.target.value)}
                                />
                                {renderError("fullName")}
                            </View>

                            <View flex="1">
                                <TextField
                                    label="Email"
                                    value={formData.email}
                                    isDisabled={!isEditMode}
                                    onChange={(e) => updateField("email", e.target.value)}
                                />
                                {renderError("email")}
                            </View>
                        </Flex>

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
                                    Giới tính
                                </label>
                                <CustomSelect
                                    value={formData.gender}
                                    onChange={(v) => updateField("gender", v)}
                                    placeholder="Chọn giới tính"
                                    options={[
                                        { value: "MALE", label: "Nam" },
                                        { value: "FEMALE", label: "Nữ" },
                                        { value: "OTHER", label: "Khác" },
                                    ]}
                                    isDisabled={!isEditMode}
                                />
                                {renderError("gender")}
                            </View>

                            <View flex="1">
                                <TextField
                                    label="Ngày sinh"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    isDisabled={!isEditMode}
                                    onChange={(e) => updateField("dateOfBirth", e.target.value)}
                                />
                                {renderError("dateOfBirth")}
                            </View>
                        </Flex>

                        <Flex direction={{ base: "column", large: "row" }} gap="16px">
                            <View flex="1">
                                <TextField
                                    label="Số điện thoại"
                                    value={formData.phone}
                                    isDisabled={!isEditMode}
                                    onChange={(e) => updateField("phone", e.target.value)}
                                />
                                {renderError("phone")}
                            </View>

                            <View flex="1">
                                <TextField
                                    label="CMND/CCCD"
                                    value={formData.nationalId}
                                    isDisabled={!isEditMode}
                                    onChange={(e) => updateField("nationalId", e.target.value)}
                                />
                            </View>
                        </Flex>

                        <View>
                            <TextField
                                label="Địa chỉ"
                                value={formData.address}
                                isDisabled={!isEditMode}
                                onChange={(e) => updateField("address", e.target.value)}
                            />
                            {renderError("address")}
                        </View>

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
                                    Trạng thái
                                </label>
                                <CustomSelect
                                    value={formData.status}
                                    onChange={(v) => updateField("status", v)}
                                    placeholder="Chọn trạng thái"
                                    options={[
                                        { value: "ACTIVE", label: "Đang thuê/đang hoạt động" },
                                        { value: "INACTIVE", label: "Ngưng hoạt động" },
                                        { value: "TERMINATED", label: "Đã kết thúc hợp đồng" },
                                    ]}
                                    isDisabled={!isEditMode}
                                />
                            </View>

                            <View flex="1">
                                <TextField
                                    label="Ghi chú"
                                    value={formData.note}
                                    isDisabled={!isEditMode}
                                    onChange={(e) => updateField("note", e.target.value)}
                                />
                            </View>
                        </Flex>

                        {formData.createdAt && (
                            <Text fontSize={12} color="#6b7280">
                                Tạo lúc: {formData.createdAt} | Cập nhật: {formData.updatedAt}
                            </Text>
                        )}
                    </Flex>
                </Card>
            </View>
        </View>
    );
};

export default TenantDetail;
