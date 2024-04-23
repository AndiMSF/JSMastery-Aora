import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../../constants";
import SearchInput from "../../components/SearchInput";
import Trending from "../../components/Trending";
import EmptyState from "../../components/EmptyState";
import { getAllPosts, getLatestPosts } from "../../lib/appwrite";
import useAppWrite from "../../lib/useAppwrite";
import VideoCard from "../../components/VideoCard";
import { useGlobalContext } from "../../context/GlobalProvider";

const Bookmark = () => {
  // Global State
  const { user } = useGlobalContext();
  // Data Video
  const { data: posts, refetch } = useAppWrite(getAllPosts);
  const { data: latestPosts } = useAppWrite(getLatestPosts);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);

    // fetch video dari database jika ada yang terbaru maka akan terupdate
    await refetch();

    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard posts={item} otherContainerStyles="mt-7"/>}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            {/* Text  */}
            <View className="justify-between items-start flex-row mb-6">
              <View>
                <Text className="text-2xl text-white font-psemibold">
                  Saved Video
                </Text>
              </View>
            </View>

            {/* Search */}
            <SearchInput />
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No videos found"
            subtitle="Be the first one to upload a video"
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </SafeAreaView>
  );
};

export default Bookmark;
