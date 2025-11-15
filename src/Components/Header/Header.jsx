import { useEffect, useState, useCallback } from "react";
import { NavLink, Link as RouterLink } from "react-router";
import { Link, Flex, Button, Image, Text } from "@aws-amplify/ui-react";
import { fetchAuthSession, signOut } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";
import "./Header.css";
import logo from "../../assets/Untitled design.png";

function Header() {
    const [session, setSession] = useState(null);
    const [userInfo, setUserInfo] = useState({ name: "", email: "" });

    const loadSession = useCallback(async () => {
        try {
            const sess = await fetchAuthSession();
            setSession(sess);

            const payload = sess.tokens?.idToken?.payload ?? {};
            const name = payload.name || payload.email || "";
            const email = payload.email || "";

            setUserInfo({ name, email });
        } catch (err) {
            console.error("Error fetchAuthSession", err);
            setSession(null);
            setUserInfo({ name: "", email: "" });
        }
    }, []);

    useEffect(() => {
        loadSession();

        const unsubscribe = Hub.listen("auth", (data) => {
            const event = data.payload.event;
            if (event === "signedIn" || event === "tokenRefresh") {
                loadSession();
            }
            if (event === "signedOut") {
                setSession(null);
                setUserInfo({ name: "", email: "" });
            }
        });

        return () => {
            unsubscribe();
        };
    }, [loadSession]);

    const initials = (() => {
        if (!userInfo.name) return "U";
        const parts = userInfo.name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (
            (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
        );
    })();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (err) {
            console.error("Error signOut:", err);
        }
    };

    return (
        <div className="header">
            <Flex justifyContent="space-between" height="100%" alignItems="center">
                <div className="header-logo">
                    <NavLink to="/">
                        <Image width="96%" height="90%" src={logo} alt="Logo" />
                    </NavLink>
                </div>

                <Flex
                    justifyContent="center"
                    alignItems="center"
                    flex="1"
                    className="header-menu"
                />

                <Flex
                    justifyContent="flex-end"
                    alignItems="center"
                    flex="1"
                    gap="12px"
                >
                    {session && (
                        <>
                            <Link
                                as={RouterLink}
                                to="/profile"
                                className="header-profile-link"
                            >
                                <Flex
                                    alignItems="center"
                                    gap="8px"
                                    className="header-profile"
                                >
                                    <div className="header-avatar">
                                        <span>{initials}</span>
                                    </div>
                                    <div className="header-profile-text">
                                        <Text className="header-profile-name">
                                            {userInfo.name || userInfo.email}
                                        </Text>
                                        <Text className="header-profile-sub">
                                            Xem hồ sơ cá nhân
                                        </Text>
                                    </div>
                                </Flex>
                            </Link>

                            <Button
                                size="small"
                                variation="outline"
                                onClick={handleSignOut}
                            >
                                Đăng xuất
                            </Button>
                        </>
                    )}
                </Flex>
            </Flex>
        </div>
    );
}

export default Header;
