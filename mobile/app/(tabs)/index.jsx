import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { styles } from "@/assets/styles/feed.styles";
import COLORS from "@/contants/colors";
import { useAuthStore } from "@/store/authStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import Suggest from "@/components/Suggest";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { API_URL } from "@/contants/api";
import Post from "@/components/Post";

export default function Index() {
  const { logout, token, user } = useAuthStore();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSuggestedUsers = useCallback(async () => {
    try {
      setLoadingSuggestions(true);
      const response = await fetch(`${API_URL}/users/suggested`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setSuggestedUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching suggested users:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [token]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoadingPosts(true);
      const response = await fetch(`${API_URL}/posts/all`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoadingPosts(false);
    }
  }, [token]);

  const refreshFeed = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchPosts();
      await fetchSuggestedUsers();
    } catch (error) {
      console.error("Error refreshing feed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchPosts, fetchSuggestedUsers]);

  useEffect(() => {
    if (token) {
      fetchSuggestedUsers();
      fetchPosts();
    }
  }, [token, fetchSuggestedUsers, fetchPosts]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts])
  );

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/like/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedLikes = await response.json();

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: updatedLikes } : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Spot light</Text>
        <TouchableOpacity onPress={logout}>
          <Ionicons name="log-out-outline" size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshFeed}
            tintColor={COLORS.white}
          />
        }
      >
        {/* Suggested Users */}
        <View style={styles.storiesContainer}>
          {loadingSuggestions ? (
            <ActivityIndicator size="large" color={COLORS.white} />
          ) : suggestedUsers.length > 0 ? (
            <Suggest users={suggestedUsers} />
          ) : (
            <Text
              style={{ color: COLORS.gray, padding: 16, textAlign: "center" }}
            >
              You're following everyone already!
            </Text>
          )}
        </View>

        {/* Posts */}
        <View style={styles.postsContainer}>
          {loadingPosts ? (
            <ActivityIndicator size="large" color={COLORS.white} />
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                currentUserId={user?._id}
                onLike={() => handleLike(post._id)}
              />
            ))
          ) : (
            <Text
              style={{
                color: COLORS.primary,
                padding: 16,
                textAlign: "center",
              }}
            >
              No posts available.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
