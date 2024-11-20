import React from 'react';
import { Button, Spin } from 'antd';


const FullScreenLoader = () => {
    const [spinning, setSpinning] = React.useState(true);
    return (
        <>
            <Spin spinning={spinning} fullscreen />
        </>
    );
};
export default FullScreenLoader;