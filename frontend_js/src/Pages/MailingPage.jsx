import React from "react";
import { useDispatch } from "react-redux";
import { setNewTitle } from "../store/layoutSlice.js";

const MailingPage = () => {
    const dispatch = useDispatch();
    dispatch(setNewTitle("Рассылки"));

    return (
        <div>Страница находится в разработке</div>
    );
};

export default MailingPage;