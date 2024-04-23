import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from "react-native-appwrite";
import parseErrorStack from "react-native/Libraries/Core/Devtools/parseErrorStack";

export const appwriteConfig = {
  endpoint: "https://cloud.appwrite.io/v1",
  platform: "com.ndcompany.aora",
  projectId: "661b92e3a098ee9ec8ae",
  databaseId: "661b93fb20c5f2d99a40",
  userCollectionId: "661b941d0ea64b38ff82",
  videoCollectionId: "661b9435c0611541c6f1",
  storageId: "661b9d04736af66317d0",
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videoCollectionId,
  storageId
} = appwriteConfig

// Init your react-native SDK
const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint) // Your Appwrite Endpoint
  .setProject(appwriteConfig.projectId) // Your project ID
  .setPlatform(appwriteConfig.platform); // Your application ID or bundle ID.

// Create User, Avatars, Database
const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client)

export const createUser = async (email, password, username) => {
  try {
    // Register User
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) throw Error;

    // Create avatar
    const avatarUrl = avatars.getInitials(username);

    // Login
    await signIn(email, password);

    // Save user to database
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    // SignIn User
    const sessions = await account.createEmailSession(email, password);
    return sessions;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.orderDesc('$createdAt')]);
    return posts.documents
  } catch (error) {
    throw new Error(error);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.orderDesc('$createdAt', Query.limit(7))]);
    return posts.documents
  } catch (error) {
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.search('title', query)]);
    return posts.documents
  } catch (error) {
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession("current");

    return session
  } catch (error) {
    throw new Error(error);
  }
}

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId,videoCollectionId, [Query.equal("creator", userId)])
    
    
    return posts.documents
  } catch (error) {
    throw new Error(error);
  }
}

export const getFilePreview = async (fileId, type) => {
  let fileUrl

  try {
    if(type === 'video') {
      fileUrl = storage.getFileView(storageId, fileId)
    } else if (type === 'image') {
      fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100)
    } else {
      throw new Error('Invalid file type')
    }

    if(!fileUrl) throw Error

    return fileUrl
  } catch (error) {
    throw new Error(error)
  }
}

export const uploadFile = async (file, type) => {
  if(!file) return;

  const { mimeType, ...rest } = file
  const asset = { type: mimeType, ...rest }

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    )

    const fileUrl = await getFilePreview(uploadedFile.$id, type)

    return fileUrl
  } catch (error) {
    throw new Error(error)
  }
}

export const createVideo = async (form) => {
  try {
    // ga perlu nunggu satu satu buat upload video maupun files ke database, bisa langsung barengan pakai promise.all ini
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video')
    ])

    const newPost = await databases.createDocument(databaseId, videoCollectionId, ID.unique(), {
      title: form.title,
      thumbnail: thumbnailUrl,
      video: videoUrl,
      prompt: form.prompt,
      creator: form.userId
    })

    return newPost
  } catch (error) {
    throw new Error(error)
  }
}