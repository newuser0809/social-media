import { View, Text, TouchableOpacity, Image } from "react-native";
import { styles } from "@/assets/styles/feed.styles";
import { Link } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "@/contants/colors";

export default function Post({ post, onLike, currentUserId }) {
  const userLiked = post.likes.includes(currentUserId);

  return (
    <View style={styles.post}>
      {/* Header */}
      <View style={styles.postHeader}>
        <Link href={`/${"tab"}/profile`}>
          <TouchableOpacity style={styles.postHeader}>
            <Image
              source={{ uri: post?.user?.profileImg }}
              style={styles.postAvatar}
            />
            <Text style={styles.postUsername}>{post?.user?.username}</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity>
          <Ionicons name="trash-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Caption text */}
      <View style={styles.postCaption}>
        <Text style={styles.captionText}>{post.text}</Text>
      </View>

      {/* Image */}
      <Image source={{ uri: post.img }} style={styles.postImage} />

      {/* Actions */}
      <View style={styles.postActions}>
        <View style={styles.postActionsLeft}>
          <TouchableOpacity onPress={onLike}>
            <Ionicons
              name={userLiked ? "heart" : "heart-outline"}
              size={24}
              color={userLiked ? "red" : COLORS.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons
              name="chatbubble-outline"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={22} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Info */}
      <View style={styles.postInfo}>
        <Text style={styles.likesText}>
          {post.likes.length === 0
            ? "Be the first to like"
            : `${post.likes.length} like${post.likes.length > 1 ? "s" : ""}`}
        </Text>
        <TouchableOpacity>
          <Text style={styles.commentText}>View all 2 comments</Text>
        </TouchableOpacity>
        <Text style={styles.timeAgo}>2 days ago</Text>
      </View>
    </View>
  );
}
