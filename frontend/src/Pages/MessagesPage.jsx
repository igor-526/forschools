import React from "react";
import { useDispatch } from "react-redux";
import { setNewTitle } from "../store/layoutSlice.js";

const MessagesPage = () => {
    const dispatch = useDispatch();
    dispatch(setNewTitle("Сообщения"));

    return (
        <div>Страница находится в разработке</div>
    );
};

export default MessagesPage;