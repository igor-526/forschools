import React, {useEffect, useState} from 'react';
import { Button, Drawer } from 'antd';

const LearningPlanDrawer = ({ selectedPlan, setSelectedPlan }) => {
    const [open, setOpen] = useState(true);
    const onClose = () => {
        setOpen(false);
        setTimeout(() => setSelectedPlan(null), 500);
    };

    return (
        <>
            <Drawer
                title="План обучения"
                closable={{ 'aria-label': 'Close Button' }}
                onClose={onClose}
                open={open}
                loading={true}
            >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Drawer>
        </>
    );
};

export default LearningPlanDrawer;