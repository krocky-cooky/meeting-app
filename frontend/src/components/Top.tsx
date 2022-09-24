import React from 'react';
import { useRef, useState, useEffect, useCallback} from "react";
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import Button from '@material-ui/core/Button';
import {ResponsiveContainer,Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
// import { Surface } from "gl-react-dom";
// import { Node, GLSL } from "gl-react";

import "../css/Top.css" 



export const Top = () => {
    //show all cameras by deviceid
    const [deviceId, setDeviceId] = React.useState<string>("");
    const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([]);
    const audioState = React.useRef<boolean>(true);
    const [audioTracks, setAudioTracks] = React.useState<MediaStreamTrack[]>([]);
    const audioContext = React.useRef<AudioContext>();
    const sourceNode = React.useRef<MediaStreamAudioSourceNode>();
    const analyserNode = React.useRef<AnalyserNode>();
    const [audioData, setAudioData] = React.useState<Uint8Array>();
    // const glsl = require("./index.frag").default;
    const videoConstraints = {
        width: 720,
        height: 400,
        deviceId: deviceId,
        facingMode: "user"

    };

    const handleDevices = (mediaDevices:MediaDeviceInfo[]) => {
        setDevices(mediaDevices.filter((item) => item.kind === "videoinput"));
    };

    const handleAudioSuccess = (stream:any) => {
        setAudioTracks(stream.getAudioTracks());
        audioContext.current = new AudioContext();
        sourceNode.current = audioContext.current.createMediaStreamSource(stream);
        analyserNode.current = audioContext.current.createAnalyser();
        audioContext.current.resume();
        analyserNode.current.fftSize = 1024;
        sourceNode.current.connect(analyserNode.current);
    };

    const handleAudioError = () => {

    };

    
    // React.useEffect(
    //     () => {
    //         if(!audioState.current) {
    //             navigator.mediaDevices.getUserMedia(
    //                 {audio: true}
    //                 )
    //                 .then(handleAudioSuccess)
    //                 .catch(handleAudioError);
    //         }else {
    //             if(audioTracks) {
    //                 audioTracks.forEach((track:any) => {track.stop()});
    //             }
    //         }
            
    //     },
    //     [audioState.current]
    // )

    React.useEffect(
        () => {
            navigator.mediaDevices.enumerateDevices().then(handleDevices);
            
        },
        [handleDevices]
    );






    const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
    const webcamRef = useRef<Webcam>(null);
    const defaultRaderData = 0.5;


    //face-api model
    const [expressions, setExpressions] = React.useState({
        angry: 0,
        disgusted: 0,
        fearful: 0,
        happy: 0,
        neutral: 0,
        sad: 0,
        surprised: 0
    });
    const loadModels = async () => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          ]).then(() => {
            faceDetection();
            // audioDetection();
          })
    }

    const faceDetection = () => {
        setInterval(async () => {
            if(webcamRef.current) {
                const webcamCurrent = webcamRef.current as any;
                if(webcamCurrent.video.readyState === 4) {
                    const video = webcamCurrent.video;
                    const detections = await faceapi.detectAllFaces
                        (video,new faceapi.TinyFaceDetectorOptions())
                        .withFaceLandmarks()
                        .withFaceExpressions();
                    if(detections.length > 0) {
                        const exp = detections[0].expressions;
                        console.log(exp);
                        setExpressions(exp);
                        const nextChartData = defaultChartData;
                        const data = [
                            exp.angry ,
                            exp.disgusted ,
                            exp.fearful ,
                            exp.happy ,
                            exp.neutral ,
                            exp.sad ,
                            exp.surprised
                        ];
                        for(var i:number = 0;i < 7;++i ) {
                            nextChartData[i].data = data[i];
                            nextChartData[i].raderData = data[i] + defaultRaderData;
                        }
                        setChartData(nextChartData);
                    }
                }
            }
            

        },1000);
    };

    // const audioDetection = () => {
    //     setInterval(async () => {
    //         if(!audioState.current) {
    //             const bufferLength = analyserNode.current?.frequencyBinCount;
    //             const dataArray = new Uint8Array(bufferLength || 0);
    //             analyserNode.current?.getByteTimeDomainData(dataArray);
    //             setAudioData(dataArray);
    //         }
    //     },100)
    // };

    React.useEffect(() => {
        loadModels();
    },[]);

    //chart settings

    const labels:string[] = ["angry" ,"disgusted", "fearful", "happy", "neutral", "sad", "surprised"];
    const defaultChartData = [
        {
            expression: 'angry',
            data:0,
            raderData:defaultRaderData,
            fullMark: 1,
            index: 0
        },
        {
            expression: 'disgusted',
            data:0,
            raderData:defaultRaderData,
            fullMark: 1,
            index: 1
        },
        {
            expression: 'fearful',
            data:0,
            raderData:defaultRaderData,
            fullMark: 1,
            index: 2
        },
        {
            expression: 'happy',
            raderData:defaultRaderData,
            data:0,
            fullMark: 1,
            index: 3
        },
        {
            expression: 'neutral',
            raderData:defaultRaderData,
            data:1,
            fullMark: 1,
            index: 4
        },
        {
            expression: 'sad',
            raderData:defaultRaderData,
            data:0,
            fullMark: 1,
            index: 5
        },
        {
            expression: 'surprised',
            raderData:defaultRaderData,
            data:0,
            fullMark: 1,
            index: 6
        },
      ];
    const [chartData, setChartData] = React.useState(defaultChartData);


    return (
        <>
        <header>
            <h1>meeting app</h1>
        </header>
        {/* <Button variant="contained" color="primary" onClick={() => {audioState.current = !audioState.current}}>
            {audioState.current ? "マイクON" : "マイクOFF"}
        </Button> */}
        {isCaptureEnable || (
                <Button variant="contained" color="primary" onClick={() => setCaptureEnable(true)}>開始</Button>
        )}
        <div className="wrapper">
            
            {isCaptureEnable && (
                <>
                <div className="element">
                <div>
                    <Button variant="contained" color="primary" onClick={() => setCaptureEnable(false)}>終了</Button>
                </div>
                <div>
                    <Webcam
                    audio={false}
                    width={540}
                    height={360}
                    ref={webcamRef}
                    videoConstraints={videoConstraints}
                    />
                </div>
                <div>
                    {devices.map((device, key) => (
                    <Button variant="contained" color="secondary"
                        key={device.deviceId}
                        onClick={() => setDeviceId(device.deviceId)}
                    >
                        {device.label || `Device ${key + 1}`}
                    </Button>
                    ))}
                </div>
                </div>
                <div className="element">
                {/* <div style={{height:"200px",width:"400px"}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                        width={500}
                        height={300}
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                        >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="expression" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="data" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div> */}
                <div style={{height:"400px",width:"500px"}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="expression" domain={[0,1.5]}/>
                            <PolarRadiusAxis />
                            <Radar name="感情" dataKey="raderData" stroke="#2b2b2b" fill="#8884d8" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{height:"400px",width:"500px"}}>
                {/* <Surface width={300} height={300}>
                    <Node
                        shader={{ frag: GLSL`${glsl}` }}
                        uniforms={{ data: audioData }}
                        ></Node>
                </Surface> */}
                </div>
                </div>
                </>
            )}
            </div>
        </>
    );
}

export default Top;