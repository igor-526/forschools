import { configureStore } from "@reduxjs/toolkit"
import layoutReducer from "./layoutSlice"


export default configureStore({
    reducer: {
        layout: layoutReducer
    }
})