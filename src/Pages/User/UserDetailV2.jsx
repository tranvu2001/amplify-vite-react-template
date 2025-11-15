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
    Text
} from "@aws-amplify/ui-react";

import UserServices from "../../axios/UserServices";
import CustomSelect from "../../Components/Select/Select";

const UserDetailV2 = () => {
    const { userId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const isCreate = userId === "new";
    const isEditMode = isCreate || searchParams.get("mode") === "edit";

    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState(null);
    const [errors, setErrors] = useState({}); // Lưu lỗi của từng field

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const updateField = (name, value) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" })); // Xóa lỗi khi người dùng chỉnh sửa
    };

    // Validate form, trả về true/false
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name?.trim()) newErrors.name = "Tên người dùng là bắt buộc.";
        if (!formData.email?.trim()) newErrors.email = "Email là bắt buộc.";
        else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) newErrors.email = "Email không hợp lệ.";
        }
        if (!formData.gender) newErrors.gender = "Giới tính là bắt buộc.";
        if (!formData.dateOfBirth) newErrors.dateOfBirth = "Ngày sinh là bắt buộc.";
        if (!formData.phoneNumber?.trim()) newErrors.phoneNumber = "Số điện thoại là bắt buộc.";
        else {
            const phoneRegex = /^0\d{9,10}$/;
            if (!phoneRegex.test(formData.phoneNumber)) newErrors.phoneNumber = "Số điện thoại không hợp lệ.";
        }
        if (!formData.address?.trim()) newErrors.address = "Địa chỉ là bắt buộc.";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (!userId || isCreate) {
            setUser(null);
            setFormData({
                name: "",
                email: "",
                gender: "",
                address: "",
                dateOfBirth: "",
                phoneNumber: "",
            });
            setLoading(false);
            return;
        }

        setLoading(true);
        UserServices.getUserById(userId)
            .then((res) => {
                const u = res.data;
                setUser(u);
                setFormData({
                    name: u.name || "",
                    email: u.email || "",
                    gender: u.gender || "",
                    address: u.address || "",
                    dateOfBirth: u.dateOfBirth || "",
                    phoneNumber: u.phoneNumber || "",
                });
            })
            .finally(() => setLoading(false));
    }, [userId, isCreate]);

    const handleSave = async () => {
        if (!formData) return;

        if (!validateForm()) return; // Không save nếu form lỗi

        setSaving(true);
        try {
            let res;
            const payload = { ...formData };

            if (isCreate) {
                res = await UserServices.createUser(payload);
            } else {
                res = await UserServices.updateUser(payload, userId);
            }

            setUser(res.data);
            setFormData(res.data);
            navigate(isCreate ? `/list-user/${res.data.userId}` : `/list-user/${userId}`);
        } catch (err) {
            console.error(err);
            alert(isCreate ? "Lỗi khi tạo người dùng." : "Lỗi khi lưu người dùng.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;

        setDeleting(true);
        try {
            await UserServices.deleteUser(userId);
            navigate("/list-user");
        } catch (err) {
            console.error(err);
            alert("Lỗi khi xóa người dùng.");
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
                            ? "Thêm người dùng"
                            : isEditMode
                            ? "Chỉnh sửa người dùng"
                            : "Chi tiết người dùng"}
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
                                    navigate(`/list-user/${userId}?mode=edit`)
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
                                    label="Tên người dùng"
                                    value={formData.name}
                                    isDisabled={!isEditMode}
                                    onChange={(e) => updateField("name", e.target.value)}
                                />
                                {renderError("name")}
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

                        <View>
                            <TextField
                                label="Địa chỉ"
                                value={formData.address}
                                isDisabled={!isEditMode}
                                onChange={(e) => updateField("address", e.target.value)}
                            />
                            {renderError("address")}
                        </View>

                        <View>
                            <TextField
                                label="Số điện thoại"
                                value={formData.phoneNumber}
                                isDisabled={!isEditMode}
                                onChange={(e) => updateField("phoneNumber", e.target.value)}
                            />
                            {renderError("phoneNumber")}
                        </View>
                    </Flex>
                </Card>
            </View>
        </View>
    );
};

export default UserDetailV2;
