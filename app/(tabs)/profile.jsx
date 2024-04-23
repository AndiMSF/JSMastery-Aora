import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from "../../constants";
import SearchInput from "../../components/SearchInput";
import Trending from "../../components/Trending";
import EmptyState from "../../components/EmptyState";
import {
  getAllPosts,
  getLatestPosts,
  getUserPosts,
  searchPosts,
  signOut,
} from "../../lib/appwrite";
import useAppWrite from "../../lib/useAppwrite";
import VideoCard from "../../components/VideoCard";
import { router, useLocalSearchParams } from "expo-router";
import { useGlobalContext } from "../../context/GlobalProvider";
import InfoBox from "../../components/InfoBox";

const Profile = () => {
  // Global State
  const { user, setUser, setIsLoggedIn } = useGlobalContext();

  // Untuk mencari video hasil dari user tersebut yang upload video
  const { data: posts } = useAppWrite(() => getUserPosts(user.$id));
  console.log(posts);

  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLoggedIn(false);

    router.replace("/sign-in");
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => <VideoCard posts={item} />}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4 ">
            <TouchableOpacity
              onPress={logout}
              className="flex w-full items-end mb-10"
            >
              <Image
                source={icons.logout}
                resizeMode="contain"
                className="w-6 h-6"
              />
            </TouchableOpacity>

            <View className="w-16 h-16 border border-secondary rounded-lg flex justify-center items-center">
              <Image
                source={{ uri: user?.avatar }}
                className="w-[90%] h-[90%] rounded-lg"
                resizeMode="cover"
              />
            </View>

            <InfoBox
              title={user?.username}
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            <View className="mt-10 flex-row">
              <InfoBox
                title={posts.length || 0}
                subtitle="Posts"
                containerStyles="mr-10"
                titleStyles="text-lg"
              />
              <InfoBox
                title="1.2k"
                subtitle="Followers"
                titleStyles="text-lg"
              />
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="No videos found"
            subtitle="No videos found for this profile"
          />
        )}
      />
    </SafeAreaView>
  );
};

export default Profile;
