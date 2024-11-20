import { configureStore } from "@reduxjs/toolkit";
import LoginSlice from "./authSlice/LoginSlice";
import UserSlice from "./authSlice/UserSlice";
import locationsSlice from "./gmbSlice/locationsSlice";
import locationSlice from "./gmbSlice/locationSlice";
import postCreate from "./gmbSlice/postCreate";
import postsSlice from "./gmbSlice/postsSlice";
import keywordsSlice from "./keywordsSlice/keywordsSlice";
import keywordDeleteSlice from "./keywordsDeleteSlice/keywordDeleteSlice";
import gridSlice from "./gridSlice/gridSlice";
import placeSlice from "./gmbSlice/placeSlice";
import deleteLocation from "./deleteSlice/deleteSlice";

export const store = configureStore({
    reducer: {
        login: LoginSlice,
        userProfile: UserSlice,
        getLocations: locationsSlice,
        getLocation: locationSlice,
        createPost: postCreate,
        posts: postsSlice,
        keywords: keywordsSlice,
        keywordDelete: keywordDeleteSlice,
        grid: gridSlice,
        getPlace: placeSlice,
        deleteLocation: deleteLocation
    }
});
    