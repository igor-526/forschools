import React from "react";
import { useDispatch } from "react-redux";
import { setNewTitle } from "../store/layoutSlice.js";

const LearningPlansPage = () => {
    const dispatch = useDispatch();
    dispatch(setNewTitle("Планы обучения"));

    return (
        <div>Страница находится в разработке</div>
    );
};

export default LearningPlansPage;