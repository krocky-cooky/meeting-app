import React from "react";
import { connectWebsocketSelector } from "../state/websocket";
import { useRecoilValue } from "recoil";


export const useSendData = () => {
    const socket = useRecoilValue(connectWebsocketSelector);
    const [dataToSend, setDataToSend] = React.useState<string>("");

    React.useEffect(() => {
        console.log(dataToSend);
        if(dataToSend.length === 0)return;
        socket.send(dataToSend);
        setDataToSend("");
    },[dataToSend]);

    return {dataToSend,setDataToSend};
};