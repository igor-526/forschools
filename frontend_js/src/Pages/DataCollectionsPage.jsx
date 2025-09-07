import React from "react";
import { useDispatch } from "react-redux";
import { setNewTitle } from "../store/layoutSlice.js";

const DataCollectionsPage = () => {
    const dispatch = useDispatch();
    dispatch(setNewTitle("Коллекции данных"));

    return (
        <div>Страница находится в разработке</div>
    );
};

export default DataCollectionsPage;