import React, {useEffect, useState} from 'react';
import { Button, Drawer } from 'antd';

const HomeworkDrawer = ({hwID}) => {
    const [open, setOpen] = useState(false);
    const onClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        if (!hwID){
            return;
        }
        setOpen(true);
    }, [hwID]);

    return (
        <>
            <Drawer
                title="Basic Drawer"
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

export default HomeworkDrawer;