import { useAuthStore } from "@/store/authStore";
import { Link } from "expo-router";
import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { user, token, checkAuth, logout } = useAuthStore();
  useEffect(() => {
    checkAuth();
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>user: {user?.username}</Text>
      <Text>token: {token}</Text>
      <Link href="/(auth)">Login</Link>
      <Link href="/(auth)/signup">Sign Up</Link>
      <Link href="/(tabs)">Tabs</Link>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
