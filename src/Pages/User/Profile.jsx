import { useEffect, useState } from "react";
import { fetchAuthSession  } from "aws-amplify/auth";
import { View, Card, Heading, Text, Button, Image } from "@aws-amplify/ui-react";
// import { Auth } from "aws-amplify";
// import { Auth, Amplify } from "aws-amplify";


export default function Profile() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchAuthSession()
      .then((session) => {
        setCurrentUser(session.tokens.idToken.payload);
      })
      .catch((err) => console.error("Error fetching session", err));
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "50px 20px",
        backgroundColor: "#f3f4f6",
        // minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "500px",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          backgroundColor: "#fff",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          {/* <Image
            src={currentUser?.picture || "https://via.placeholder.com/150"}
            alt="Avatar"
            style={{
              width: "150px",
              height: "150px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "4px solid #6366f1",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          /> */}

          <Heading
            level={2}
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#111827",
              marginTop: "20px",
            }}
          >
            {currentUser?.name || "Tên người dùng"}
          </Heading>

          <Text style={{ color: "#6b7280", fontSize: "16px", marginTop: "5px" }}>
            {currentUser?.email || "Email người dùng"}
          </Text>

          <span
            style={{
              display: "inline-block",
              padding: "5px 12px",
              borderRadius: "9999px",
              backgroundColor: currentUser?.email_verified ? "#d1fae5" : "#fee2e2",
              color: currentUser?.email_verified ? "#065f46" : "#b91c1c",
              fontSize: "14px",
              fontWeight: "500",
              marginTop: "10px",
            }}
          >
            {currentUser?.email_verified ? "Email đã xác minh" : "Email chưa xác minh"}
          </span>
        </div>

        {/* Info */}
        <div style={{ marginTop: "30px" }}>
          <div style={{ marginBottom: "15px" }}>
            <Text style={{ fontWeight: "600", color: "#6b7280" }}>Số điện thoại</Text>
            <Text style={{ color: "#111827", fontSize: "16px" }}>
              {currentUser?.phone_number || "-"}
            </Text>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <Text style={{ fontWeight: "600", color: "#6b7280" }}>Ngày sinh</Text>
            <Text style={{ color: "#111827", fontSize: "16px" }}>
              {currentUser?.birthdate || "-"}
            </Text>
          </div>

          
        </div>

        {/* Actions */}
        <div style={{ marginTop: "30px", display: "flex", justifyContent: "center", gap: "20px" }}>
          <Button
            variation="primary"
            style={{ padding: "10px 25px", borderRadius: "8px" }}
          >
            Chỉnh sửa hồ sơ
          </Button>
          <Button
            variation="secondary"
            style={{ padding: "10px 25px", borderRadius: "8px" }}
          >
            Đổi mật khẩu
          </Button>
        </div>
      </div>
    </div>
  );
}
