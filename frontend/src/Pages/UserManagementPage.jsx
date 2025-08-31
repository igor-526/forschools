import React from "react";
import { useDispatch } from "react-redux";
import { setNewTitle } from "../store/layoutSlice.js";

const UserManagementPage = () => {
    const dispatch = useDispatch();
    dispatch(setNewTitle("Управление пользователями"));

    return (
        <div>Страница находится в разработке</div>
    );
};

export default UserManagementPage;