import React from 'react';
import { Tabs } from 'antd';
import Booking from './booking';
import Chatbot from './chatbot2';


const Tabbar = () => {

    const onChange = (key) => {
        console.log(key);
    };


    return (
            <Tabs
                onChange={onChange}
                type="card"
                items={
                    [
                        { key: '1', label: `Chat`, children: <Chatbot /> },
                        { key: '2', label: `Booking`, children: <Booking /> },
                    ]
                }
                tabPosition = "top"
                style={{ width:"350px", marginTop:"10px", paddingBottom:0 }}
            />
    )
}

export default Tabbar;