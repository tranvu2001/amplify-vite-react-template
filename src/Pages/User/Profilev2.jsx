// import { useEffect, useState } from "react";
// import { Auth, Amplify } from "aws-amplify";
// import { Heading, Text, Button, TextField, Alert, Flex } from "@aws-amplify/ui-react";



// export default function Profile() {
//   const [user, setUser] = useState(null);

//   // State chỉnh sửa hồ sơ
//   const [showEditProfile, setShowEditProfile] = useState(false);
//   const [name, setName] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [birthdate, setBirthdate] = useState("");

//   // State đổi mật khẩu
//   const [showChangePassword, setShowChangePassword] = useState(false);
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   // Thông báo
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");

//   useEffect(() => {
//     Auth.currentAuthenticatedUser()
//       .then((usr) => {
//         setUser(usr);
//         setName(usr.attributes?.name || "");
//         setPhoneNumber(usr.attributes?.phone_number || "");
//         setBirthdate(usr.attributes?.birthdate || "");
//       })
//       .catch((err) => console.error("Error fetching user", err));
//   }, []);

//   // Cập nhật hồ sơ
//   const handleUpdateProfile = async () => {
//     setError("");
//     setMessage("");

//     try {
//       await Auth.updateUserAttributes(user, {
//         name,
//         phone_number: phoneNumber,
//         birthdate,
//       });
//       const updatedUser = await Auth.currentAuthenticatedUser();
//       setUser(updatedUser);
//       setMessage("Cập nhật thông tin thành công!");
//       setShowEditProfile(false);
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Có lỗi xảy ra khi cập nhật thông tin");
//     }
//   };

//   // Đổi mật khẩu
//   const handleChangePassword = async () => {
//     setError("");
//     setMessage("");

//     if (newPassword !== confirmPassword) {
//       setError("Mật khẩu mới không khớp!");
//       return;
//     }

//     try {
//       await Auth.changePassword(user, oldPassword, newPassword);
//       setMessage("Đổi mật khẩu thành công!");
//       setOldPassword("");
//       setNewPassword("");
//       setConfirmPassword("");
//       setShowChangePassword(false);
//     } catch (err) {
//       console.error(err);
//       setError(err.message || "Có lỗi xảy ra khi đổi mật khẩu");
//     }
//   };

//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         padding: "50px 20px",
//         backgroundColor: "#f3f4f6",
//       }}
//     >
//       <div
//         style={{
//           width: "500px",
//           padding: "40px",
//           borderRadius: "20px",
//           boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
//           backgroundColor: "#fff",
//         }}
//       >
//         {/* Header */}
//         <div style={{ textAlign: "center" }}>
//           <Heading level={2} style={{ fontSize: "28px", fontWeight: "bold", color: "#111827", marginTop: "20px" }}>
//             {user?.username || "Tên người dùng"}
//           </Heading>
//           <Text style={{ color: "#6b7280", fontSize: "16px", marginTop: "5px" }}>
//             {user?.attributes?.email || "Email người dùng"}
//           </Text>
//           <span
//             style={{
//               display: "inline-block",
//               padding: "5px 12px",
//               borderRadius: "9999px",
//               backgroundColor: user?.attributes?.email_verified ? "#d1fae5" : "#fee2e2",
//               color: user?.attributes?.email_verified ? "#065f46" : "#b91c1c",
//               fontSize: "14px",
//               fontWeight: "500",
//               marginTop: "10px",
//             }}
//           >
//             {user?.attributes?.email_verified ? "Email đã xác minh" : "Email chưa xác minh"}
//           </span>
//         </div>

//         {/* Info */}
//         <div style={{ marginTop: "30px" }}>
//           <div style={{ marginBottom: "15px" }}>
//             <Text style={{ fontWeight: "600", color: "#6b7280" }}>Số điện thoại</Text>
//             <Text style={{ color: "#111827", fontSize: "16px" }}>{user?.attributes?.phone_number || "-"}</Text>
//           </div>
//           <div style={{ marginBottom: "15px" }}>
//             <Text style={{ fontWeight: "600", color: "#6b7280" }}>Ngày sinh</Text>
//             <Text style={{ color: "#111827", fontSize: "16px" }}>{user?.attributes?.birthdate || "-"}</Text>
//           </div>
//         </div>

//         {/* Actions */}
//         <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "20px" }}>
//           <Button variation="primary" style={{ padding: "10px 25px", borderRadius: "8px" }} onClick={() => setShowEditProfile(!showEditProfile)}>
//             Chỉnh sửa hồ sơ
//           </Button>
//           <Button variation="secondary" style={{ padding: "10px 25px", borderRadius: "8px" }} onClick={() => setShowChangePassword(!showChangePassword)}>
//             Đổi mật khẩu
//           </Button>
//         </div>

//         {/* Form chỉnh sửa hồ sơ */}
//         {showEditProfile && (
//           <div style={{ marginTop: "20px" }}>
//             {error && <Alert variation="error">{error}</Alert>}
//             {message && <Alert variation="success">{message}</Alert>}

//             <TextField label="Tên" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: "10px" }} />
//             <TextField label="Số điện thoại" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} style={{ marginBottom: "10px" }} />
//             <TextField label="Ngày sinh" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} style={{ marginBottom: "10px" }} />
//             <Flex justifyContent="center">
//               <Button variation="primary" onClick={handleUpdateProfile}>
//                 Lưu thay đổi
//               </Button>
//             </Flex>
//           </div>
//         )}

//         {/* Form đổi mật khẩu */}
//         {showChangePassword && (
//           <div style={{ marginTop: "20px" }}>
//             {error && <Alert variation="error">{error}</Alert>}
//             {message && <Alert variation="success">{message}</Alert>}

//             <TextField label="Mật khẩu cũ" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} style={{ marginBottom: "10px" }} />
//             <TextField label="Mật khẩu mới" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ marginBottom: "10px" }} />
//             <TextField label="Xác nhận mật khẩu mới" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ marginBottom: "10px" }} />
//             <Flex justifyContent="center">
//               <Button variation="primary" onClick={handleChangePassword}>
//                 Xác nhận
//               </Button>
//             </Flex>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
