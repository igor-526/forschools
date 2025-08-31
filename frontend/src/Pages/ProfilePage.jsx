import React from "react";
import { useDispatch } from "react-redux";
import { setNewTitle } from "../store/layoutSlice.js";

const ProfilePage = () => {
    const dispatch = useDispatch();
    dispatch(setNewTitle("Профиль"));

    return (
        <div>Страница находится в разработке</div>
    );
};

export default ProfilePage;