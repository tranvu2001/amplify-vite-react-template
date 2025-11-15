import { useEffect, useState, useCallback } from "react";
import {
    fetchAuthSession,
    fetchUserAttributes,
    updateUserAttributes,
    updatePassword,
} from "aws-amplify/auth";
import {
    Card,
    Flex,
    Heading,
    Text,
    Button,
    TextField,
    Divider,
    Loader,
    Badge,
} from "@aws-amplify/ui-react";

export default function Profile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [user, setUser] = useState(null);
    const [groups, setGroups] = useState([]);

    const [form, setForm] = useState({
        given_name: "",
        family_name: "",
        preferred_username: "",
        name: "",
        email: "",
        phone_number: "",
        birthdate: "",
        address: "",
        website: "",
        department: "",
        job_title: "",
        employee_code: "",
        office_location: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [showChangePwd, setShowChangePwd] = useState(false);
    const [pwdSaving, setPwdSaving] = useState(false);
    const [pwdForm, setPwdForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [pwdError, setPwdError] = useState("");
    const [pwdMessage, setPwdMessage] = useState("");

    const handleFieldChange = (field) => (e) => {
        const value = e.target.value;
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handlePwdFieldChange = (field) => (e) => {
        const value = e.target.value;
        setPwdForm((prev) => ({ ...prev, [field]: value }));
    };

    const resetFormFromUser = useCallback((u) => {
        if (!u) return;
        setForm({
            given_name: u.given_name ?? "",
            family_name: u.family_name ?? "",
            preferred_username: u.preferred_username ?? "",
            name: u.name ?? "",
            email: u.email ?? "",
            phone_number: u.phone_number ?? "",
            birthdate: u.birthdate ?? "",
            address: u.address ?? "",
            website: u.website ?? "",
            department: u["custom:department"] ?? "",
            job_title: u["custom:job_title"] ?? "",
            employee_code: u["custom:employee_code"] ?? "",
            office_location: u["custom:office_location"] ?? "",
        });
    }, []);

    const loadUser = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            setMessage("");

            const session = await fetchAuthSession();
            const payload = session.tokens?.idToken?.payload ?? {};
            const attrs = await fetchUserAttributes();

            const merged = { ...payload, ...attrs };
            const tokenGroups = payload["cognito:groups"] ?? [];

            setUser(merged);
            setGroups(Array.isArray(tokenGroups) ? tokenGroups : [tokenGroups]);
            resetFormFromUser(merged);
        } catch (err) {
            console.error("Error fetching user", err);
            setError("Không lấy được thông tin người dùng.");
        } finally {
            setLoading(false);
        }
    }, [resetFormFromUser]);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const handleEdit = () => {
        setIsEditMode(true);
        setMessage("");
        setError("");
    };

    const handleCancel = () => {
        resetFormFromUser(user);
        setIsEditMode(false);
        setMessage("");
        setError("");
    };

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setMessage("");

        try {
            const output = await updateUserAttributes({
                userAttributes: {
                    given_name: form.given_name || undefined,
                    family_name: form.family_name || undefined,
                    preferred_username: form.preferred_username || undefined,
                    name: form.name || undefined,
                    email: form.email || undefined,
                    phone_number: form.phone_number || undefined,
                    birthdate: form.birthdate || undefined,
                    address: form.address || undefined,
                    website: form.website || undefined,
                    "custom:department": form.department || undefined,
                    "custom:job_title": form.job_title || undefined,
                    "custom:employee_code": form.employee_code || undefined,
                    "custom:office_location": form.office_location || undefined,
                },
            });

            const nextStep = output.nextStep;
            if (nextStep?.updateAttributeStep === "CONFIRM_ATTRIBUTE_WITH_CODE") {
                setMessage(
                    "Đã cập nhật, cần xác minh email/số điện thoại – vui lòng kiểm tra mã xác minh."
                );
            } else {
                setMessage("Cập nhật hồ sơ thành công.");
            }

            await loadUser();
            setIsEditMode(false);
        } catch (err) {
            console.error("Error updating attributes", err);
            setError(err.message || "Có lỗi khi cập nhật hồ sơ.");
        } finally {
            setSaving(false);
        }
    };

    const handleOpenChangePwd = () => {
        setShowChangePwd((prev) => !prev);
        setPwdError("");
        setPwdMessage("");
        setPwdForm({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
        });
    };

    const handleChangePassword = async () => {
        setPwdError("");
        setPwdMessage("");

        if (!pwdForm.oldPassword || !pwdForm.newPassword) {
            setPwdError("Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới.");
            return;
        }

        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            setPwdError("Mật khẩu mới và xác nhận mật khẩu không khớp.");
            return;
        }

        try {
            setPwdSaving(true);
            await updatePassword({
                oldPassword: pwdForm.oldPassword,
                newPassword: pwdForm.newPassword,
            });
            setPwdMessage("Đổi mật khẩu thành công.");
            setShowChangePwd(false);
            setPwdForm({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (err) {
            console.error("Error updating password", err);
            setPwdError(
                err.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại thông tin."
            );
        } finally {
            setPwdSaving(false);
        }
    };

    const getInitials = () => {
        if (!user) return "?";
        const full = user.name || user.preferred_username || user.email || "";
        if (!full) return "?";
        const parts = full.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (
            (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
        );
    };

    const emailVerified =
        user?.email_verified === true || user?.email_verified === "true";

    if (loading) {
        return (
            <Flex
                justifyContent="center"
                alignItems="center"
                height="60vh"
                backgroundColor="#f3f4f6"
            >
                <Loader size="large" />
            </Flex>
        );
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #e0f2fe 0%, #eef2ff 40%, #f9fafb 100%)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                padding: "20px 16px",
            }}
        >
            <Card
                variation="outlined"
                style={{
                    width: "100%",
                    maxWidth: "960px",
                    borderRadius: "24px",
                    boxShadow: "0 20px 40px rgba(15,23,42,0.15)",
                    padding: "0",
                    overflow: "hidden",
                    backgroundColor: "#ffffff",
                }}
            >
                <Flex direction={{ base: "column", medium: "row" }}>
                    <Flex
                        direction="column"
                        basis={{ base: "100%", medium: "32%" }}
                        padding="24px"
                        background="linear-gradient(160deg, #4f46e5, #0ea5e9)"
                        color="#f9fafb"
                        justifyContent="space-between"
                    >
                        <div>
                            <div
                                style={{
                                    width: "88px",
                                    height: "88px",
                                    borderRadius: "999px",
                                    backgroundColor: "rgba(15,23,42,0.15)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "32px",
                                    fontWeight: 700,
                                    marginBottom: "16px",
                                    border: "3px solid rgba(248,250,252,0.6)",
                                }}
                            >
                                {getInitials()}
                            </div>

                            <Heading
                                level={2}
                                style={{
                                    fontSize: "24px",
                                    fontWeight: 700,
                                    marginBottom: "4px",
                                }}
                            >
                                {user?.name ||
                                    user?.preferred_username ||
                                    user?.email ||
                                    "Người dùng"}
                            </Heading>

                            <Text
                                style={{
                                    fontSize: "14px",
                                    opacity: 0.9,
                                    marginBottom: "12px",
                                }}
                            >
                                {user?.email}
                            </Text>

                            <Badge
                                variation={emailVerified ? "success" : "warning"}
                                size="small"
                                style={{
                                    borderRadius: "999px",
                                    backgroundColor: "rgba(15,23,42,0.15)",
                                    border: "none",
                                }}
                            >
                                {emailVerified
                                    ? "Email đã xác minh"
                                    : "Email chưa xác minh"}
                            </Badge>

                            {groups && groups.length > 0 && (
                                <div style={{ marginTop: "16px" }}>
                                    <Text
                                        style={{
                                            fontSize: "13px",
                                            opacity: 0.95,
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Vai trò trong hệ thống
                                    </Text>
                                    <Flex wrap="wrap" gap="8px">
                                        {groups.map((g) => (
                                            <span
                                                key={g}
                                                style={{
                                                    padding: "4px 12px",
                                                    borderRadius: "999px",
                                                    backgroundColor:
                                                        g === "Admin"
                                                            ? "#eef2ff"
                                                            : "#dbeafe",
                                                    color: "#1d4ed8",
                                                    fontSize: "12px",
                                                    fontWeight: 700,
                                                    boxShadow:
                                                        "0 0 0 1px rgba(191,219,254,0.9)",
                                                }}
                                            >
                                                {g}
                                            </span>
                                        ))}
                                    </Flex>
                                </div>
                            )}
                        </div>

                        <Flex
                            marginTop="24px"
                            gap="8px"
                            justifyContent="flex-start"
                            wrap="wrap"
                        >
                            {!isEditMode ? (
                                <>
                                    <Button
                                        variation="primary"
                                        onClick={handleEdit}
                                        size="small"
                                    >
                                        Chỉnh sửa hồ sơ
                                    </Button>
                                    <Button
                                        variation="link"
                                        size="small"
                                        onClick={handleOpenChangePwd}
                                    >
                                        Đổi mật khẩu
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variation="primary"
                                        size="small"
                                        onClick={handleSave}
                                        isDisabled={saving}
                                    >
                                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </Button>
                                    <Button
                                        variation="link"
                                        size="small"
                                        onClick={handleCancel}
                                        isDisabled={saving}
                                        style={{ color: "#e0f2fe" }}
                                    >
                                        Hủy
                                    </Button>
                                </>
                            )}
                        </Flex>
                    </Flex>

                    <Flex
                        direction="column"
                        basis={{ base: "100%", medium: "68%" }}
                        padding="24px 28px 28px"
                        gap="20px"
                    >
                        <Heading
                            level={3}
                            style={{
                                fontSize: "18px",
                                fontWeight: 600,
                                color: "#0f172a",
                                marginBottom: "4px",
                            }}
                        >
                            Thông tin chi tiết
                        </Heading>
                        <Divider orientation="horizontal" />

                        <Flex gap="16px" wrap="wrap">
                            <Flex direction="column" flex="1 1 160px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Họ
                                </Text>
                                <TextField
                                    size="small"
                                    isDisabled={!isEditMode || saving}
                                    value={form.family_name}
                                    onChange={handleFieldChange("family_name")}
                                    placeholder="Nguyễn"
                                />
                            </Flex>

                            <Flex direction="column" flex="1 1 160px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Tên
                                </Text>
                                <TextField
                                    size="small"
                                    isDisabled={!isEditMode || saving}
                                    value={form.given_name}
                                    onChange={handleFieldChange("given_name")}
                                    placeholder="Văn A"
                                />
                            </Flex>

                            <Flex direction="column" flex="1 1 220px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Tên hiển thị
                                </Text>
                                <TextField
                                    size="small"
                                    isDisabled={!isEditMode || saving}
                                    value={form.preferred_username}
                                    onChange={handleFieldChange("preferred_username")}
                                    placeholder="khanh.dev"
                                />
                            </Flex>
                        </Flex>

                        <Flex gap="16px" wrap="wrap">
                            <Flex direction="column" flex="1 1 160px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Số điện thoại
                                </Text>
                                <TextField
                                    size="small"
                                    isDisabled={!isEditMode || saving}
                                    value={form.phone_number}
                                    onChange={handleFieldChange("phone_number")}
                                    placeholder="+8490xxxxxxx"
                                />
                            </Flex>

                            <Flex direction="column" flex="1 1 160px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Ngày sinh
                                </Text>
                                <TextField
                                    size="small"
                                    type="date"
                                    isDisabled={!isEditMode || saving}
                                    value={form.birthdate}
                                    onChange={handleFieldChange("birthdate")}
                                />
                            </Flex>

                            <Flex direction="column" flex="1 1 220px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Email đăng nhập
                                </Text>
                                <TextField
                                    size="small"
                                    type="email"
                                    isDisabled={!isEditMode || saving}
                                    value={form.email}
                                    onChange={handleFieldChange("email")}
                                    placeholder="you@example.com"
                                />
                            </Flex>
                        </Flex>

                        <Flex gap="16px" wrap="wrap">
                            <Flex direction="column" flex="2 1 340px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Địa chỉ
                                </Text>
                                <TextField
                                    size="small"
                                    isDisabled={!isEditMode || saving}
                                    value={form.address}
                                    onChange={handleFieldChange("address")}
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                                />
                            </Flex>

                            <Flex direction="column" flex="1 1 220px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Website / LinkedIn
                                </Text>
                                <TextField
                                    size="small"
                                    isDisabled={!isEditMode || saving}
                                    value={form.website}
                                    onChange={handleFieldChange("website")}
                                    placeholder="https://..."
                                />
                            </Flex>
                        </Flex>

                        <Heading
                            level={4}
                            style={{
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#0f172a",
                                marginTop: "4px",
                            }}
                        >
                            Thông tin công việc
                        </Heading>
                        <Divider orientation="horizontal" />

                        <Flex gap="16px" wrap="wrap">
                            <Flex direction="column" flex="1 1 200px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Phòng ban
                                </Text>
                                <TextField
                                    size="small"
                                    isDisabled={!isEditMode || saving}
                                    value={form.department}
                                    onChange={handleFieldChange("department")}
                                    placeholder="Phòng Kinh doanh, IT, ..."
                                />
                            </Flex>

                            <Flex direction="column" flex="1 1 200px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Chức vụ
                                </Text>
                                <TextField
                                    size="small"
                                    isDisabled={!isEditMode || saving}
                                    value={form.job_title}
                                    onChange={handleFieldChange("job_title")}
                                    placeholder="Trưởng phòng, Nhân viên, ..."
                                />
                            </Flex>
                        </Flex>

                        <Flex gap="16px" wrap="wrap">
                            <Flex direction="column" flex="1 1 200px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Mã nhân viên
                                </Text>
                                <TextField
                                    size="small"
                                    isDisabled={!isEditMode || saving}
                                    value={form.employee_code}
                                    onChange={handleFieldChange("employee_code")}
                                    placeholder="EMP001, NV0123..."
                                />
                            </Flex>

                            <Flex direction="column" flex="1 1 200px">
                                <Text
                                    style={{
                                        fontSize: "13px",
                                        color: "#6b7280",
                                        marginBottom: "4px",
                                    }}
                                >
                                    Văn phòng / Khu vực
                                </Text>
                                <TextField
                                    size="small"
                                    isDisabled={!isEditMode || saving}
                                    value={form.office_location}
                                    onChange={handleFieldChange("office_location")}
                                    placeholder="Hà Nội, HCM, Remote..."
                                />
                            </Flex>
                        </Flex>

                        {showChangePwd && (
                            <>
                                <Divider orientation="horizontal" />
                                <Heading
                                    level={4}
                                    style={{
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        color: "#0f172a",
                                        marginTop: "4px",
                                    }}
                                >
                                    Đổi mật khẩu
                                </Heading>

                                <Flex
                                    direction="column"
                                    gap="12px"
                                    style={{ maxWidth: "420px" }}
                                >
                                    <TextField
                                        size="small"
                                        type="password"
                                        label="Mật khẩu hiện tại"
                                        value={pwdForm.oldPassword}
                                        onChange={handlePwdFieldChange("oldPassword")}
                                        isDisabled={pwdSaving}
                                    />
                                    <TextField
                                        size="small"
                                        type="password"
                                        label="Mật khẩu mới"
                                        value={pwdForm.newPassword}
                                        onChange={handlePwdFieldChange("newPassword")}
                                        isDisabled={pwdSaving}
                                    />
                                    <TextField
                                        size="small"
                                        type="password"
                                        label="Xác nhận mật khẩu mới"
                                        value={pwdForm.confirmPassword}
                                        onChange={handlePwdFieldChange(
                                            "confirmPassword"
                                        )}
                                        isDisabled={pwdSaving}
                                    />

                                    {pwdError && (
                                        <div
                                            style={{
                                                marginTop: "4px",
                                                padding: "8px 10px",
                                                borderRadius: "10px",
                                                backgroundColor: "#fee2e2",
                                                color: "#b91c1c",
                                                fontSize: "13px",
                                            }}
                                        >
                                            {pwdError}
                                        </div>
                                    )}
                                    {pwdMessage && (
                                        <div
                                            style={{
                                                marginTop: "4px",
                                                padding: "8px 10px",
                                                borderRadius: "10px",
                                                backgroundColor: "#dcfce7",
                                                color: "#166534",
                                                fontSize: "13px",
                                            }}
                                        >
                                            {pwdMessage}
                                        </div>
                                    )}

                                    <Flex justifyContent="flex-end" gap="8px" marginTop="4px">
                                        <Button
                                            variation="secondary"
                                            size="small"
                                            onClick={() => setShowChangePwd(false)}
                                            isDisabled={pwdSaving}
                                        >
                                            Hủy
                                        </Button>
                                        <Button
                                            variation="primary"
                                            size="small"
                                            onClick={handleChangePassword}
                                            isDisabled={pwdSaving}
                                        >
                                            {pwdSaving ? "Đang đổi..." : "Đổi mật khẩu"}
                                        </Button>
                                    </Flex>
                                </Flex>
                            </>
                        )}

                        {error && (
                            <div
                                style={{
                                    marginTop: "8px",
                                    padding: "10px 12px",
                                    borderRadius: "12px",
                                    backgroundColor: "#fee2e2",
                                    color: "#b91c1c",
                                    fontSize: "13px",
                                }}
                            >
                                {error}
                            </div>
                        )}
                        {message && (
                            <div
                                style={{
                                    marginTop: "8px",
                                    padding: "10px 12px",
                                    borderRadius: "12px",
                                    backgroundColor: "#dcfce7",
                                    color: "#166534",
                                    fontSize: "13px",
                                }}
                            >
                                {message}
                            </div>
                        )}

                        <Flex
                            marginTop="8px"
                            justifyContent="flex-end"
                            gap="8px"
                            display={{ base: "flex", medium: "none" }}
                        >
                            {!isEditMode ? (
                                <Button
                                    variation="primary"
                                    size="small"
                                    onClick={handleEdit}
                                >
                                    Chỉnh sửa hồ sơ
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variation="primary"
                                        size="small"
                                        onClick={handleSave}
                                        isDisabled={saving}
                                    >
                                        {saving ? "Đang lưu..." : "Lưu"}
                                    </Button>
                                    <Button
                                        variation="outline"
                                        size="small"
                                        onClick={handleCancel}
                                        isDisabled={saving}
                                    >
                                        Hủy
                                    </Button>
                                </>
                            )}
                        </Flex>
                    </Flex>
                </Flex>
            </Card>
        </div>
    );
}
