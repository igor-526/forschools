import React from "react";
import { useDispatch } from "react-redux";
import { setNewTitle } from "../store/layoutSlice.js";

const LearningProgramsPage = () => {
    const dispatch = useDispatch();
    dispatch(setNewTitle("Шаблоны уроков"));

    return (
        <div>Страница находится в разработке</div>
    );
};

export default LearningProgramsPage;