import React from 'react';
import { Drawer } from 'antd';

const LearningPlanNewDrawer = ({open, setOpen}) => {
    const onClose = () => {
        setOpen(false);
    };

    return (
        <>
            <Drawer
                title="Новый план обучения"
                closable={{ 'aria-label': 'Close Button' }}
                onClose={onClose}
                open={open}
            >
                <p>Some contents...</p>
                <p>Some contents...</p>
                <p>Some contents...</p>
            </Drawer>
        </>
    );
};

export default LearningPlanNewDrawer;