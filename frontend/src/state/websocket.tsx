import { Socket } from "node:dgram";
import { resolve } from "node:path/win32";
import { atom, selector,useRecoilState } from "recoil";
import * as WebSocket from "websocket";

// const connect = (): Promise<WebSocket.w3cwebsocket> => {
//     const targetIp:string = "10.214.18.190:9001";
//     return new Promise((resolve,reject) => {
//         const socket = new WebSocket.w3cwebsocket(`wss://${targetIp}`);
//         socket.onopen = () => {
//             console.log('connected');
//             resolve(socket);
//         };
//         socket.onclose = () => {
//             console.log('reconnecting...');
//         };
//         socket.onerror = (err) => {
//             console.log("connection error:",err);
//             resolve(socket);
//         };
//     });
// };

export const connectWebsocket = (): WebSocket.w3cwebsocket => {
    const targetIp:string = "localhost:9001";
    const socket = new WebSocket.w3cwebsocket(`wss://${targetIp}`);
    socket.onopen = () => {
        console.log("connected");
    }
    socket.onclose = () => {
        console.log("socket closed");
    }
    socket.onerror = (err) => {
        console.log("connection error:",err);
    }

    return socket;
    
}

export const connectWebsocketSelector = selector({
    key: "connectWebsocket",
    get: ({get}): WebSocket.w3cwebsocket=> {
        var socket: WebSocket.w3cwebsocket = get(websocketAtom);
        return socket;
    },
    set: ({set}, socket) => {
        set(websocketAtom,socket)
    }
});

export const connectionStateAtom = atom<boolean>({
    key: "connectionState",
    default: false,
})

  
export const websocketAtom = atom<WebSocket.w3cwebsocket>({
    key: "websocket",
    default: connectWebsocket(),
});