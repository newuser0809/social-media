import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { styles } from "../assets/styles/feed.styles";

export default function Suggest({ users = [] }) {
  const renderItem = ({ item }) => (
    <SuggestItem username={item.username} avatar={item.profileImg} />
  );

  return (
    <View style={{ paddingVertical: 10 }}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

function SuggestItem({ username, avatar }) {
  return (
    <TouchableOpacity style={styles.suggestWrapper}>
      <View style={styles.suggestRing}>
        <Image source={{ uri: avatar }} style={styles.suggestAvatar} />
      </View>
      <Text style={styles.suggestUsername}>{username}</Text>
    </TouchableOpacity>
  );
}
