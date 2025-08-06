import {Account, Avatars, Client, Databases, ID, Query, Storage} from "react-native-appwrite";
import {CreateUserPrams, GetMenuParams, SignInParams, User} from "@/type";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.zohaib.foodordering",
    databaseId: "688e3276002a0e059a9d",
    bucketId: "6890cf7b0007ca238900",
    userCollectionId: "688e33020006489ecb01",
    categoriesCollectionId: "6890c8e3001858656c26",
    menuCollectionId: "6890c955003b5b764779",
    customizationsCollectionId: "6890cbde003c27c69a44",
    menuCustomizationsCollectionId: "6890cd1c00119368ea58"
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint!)
    .setProject(appwriteConfig.projectId!)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

const avatars = new Avatars(client);

export const createUser = async ({email, password, name}: CreateUserPrams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name);

        if (!newAccount) throw Error

        await signIn({email, password});

        const avatarUrl = avatars.getInitialsURL(name)

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {email, name, accountid: newAccount.$id, avatar: avatarUrl}
        );
    } catch (e: any) {
        throw new Error(e.message || 'Failed to create user');
    }
}

export const signIn = async ({email, password}: SignInParams) => {

    try {
        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (e: any) {
        throw new Error(e.message || 'Failed to sign in');
    }
}

export const getCurrentUser = async (): Promise<User> => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountid', currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0] as unknown as User;
    } catch (e) {
        console.log(e);
        throw new Error(e as string);
    }
}

export const getMenu = async ({category, query}: GetMenuParams) => {
    try {
        const queries: string[] = [];

        if(category) queries.push(Query.equal('categories', category));
        if (query) queries.push(Query.search('name', query));

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )

        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCategories = async () => {
    try{
       const categories = await databases.listDocuments(
           appwriteConfig.databaseId,
           appwriteConfig.categoriesCollectionId,
       )

        return categories.documents;
    } catch (e){
        throw new Error(e as string);
    }
}