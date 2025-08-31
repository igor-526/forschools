import React from "react";
import { useDispatch } from "react-redux";
import { setNewTitle } from "../store/layoutSlice.js";

const MaterialsPage = () => {
    const dispatch = useDispatch();
    dispatch(setNewTitle("Материалы"));

    return (
        <div>Страница находится в разработке</div>
    );
};

export default MaterialsPage;