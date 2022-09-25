import React from 'react';
import { useRef, useState, useEffect, useCallback} from "react";
import Webcam from "react-webcam";
import * as faceapi from 'face-api.js';
import {Button, FormControl, InputLabel, Select, MenuItem} from '@material-ui/core';
import {ResponsiveContainer,Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';


import "../css/Top.css" 
import { styled } from '@material-ui/core';



export const Top = () => {
    //show all cameras by deviceid
    const [cameraDeviceId, setCameraDeviceId] = React.useState<string>("");
    const [defaultCameraDeviceId, setDefaultCameraDeviceId] = React.useState<string>("");
    const [cameraDevices, setCameraDevices] = React.useState<MediaDeviceInfo[]>([]);
    const [audioDeviceId, setAudioDeviceId] = React.useState<string>("");
    const [defaultAudioDeviceId, setDefaultAudioDeviceId] = React.useState<string>("");
    const [audioDevices, setAudioDevices] = React.useState<MediaDeviceInfo[]>([]);
    const [audioTracks, setAudioTracks] = React.useState<MediaStreamTrack[]>([]);
    const audioContext = React.useRef<AudioContext>();
    const sourceNode = React.useRef<MediaStreamAudioSourceNode>();
    const analyserNode = React.useRef<AnalyserNode>();
    const [audioData, setAudioData] = React.useState<Uint8Array>();
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animeIdRef = useRef<number>();
    const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
    const isCaptureEnableRef = React.useRef<boolean>(isCaptureEnable);
    const [timer, setTimer] = React.useState<number>(0);
    const [expressions, setExpressions] = React.useState({
        angry: 0,
        disgusted: 0,
        fearful: 0,
        happy: 0,
        neutral: 0,
        sad: 0,
        surprised: 0
    });

    useEffect(() => {
        isCaptureEnableRef.current = isCaptureEnable;
      }, [isCaptureEnable]);
    const webcamRef = useRef<Webcam>(null);
    const defaultRaderData = 0.5;
    const videoConstraints = {
        width: 720,
        height: 400,
        deviceId: cameraDeviceId,
        facingMode: "user"

    };

    const audioConstraints = {
        audio: {
            deviceId: audioDeviceId
        }
    }

    const handleDevices = (mediaDevices:MediaDeviceInfo[]) => {
        setCameraDevices(mediaDevices.filter((item) => item.kind === "videoinput"));
        if(cameraDevices && defaultCameraDeviceId === "")setDefaultCameraDeviceId(cameraDevices[0].deviceId);
        setAudioDevices(mediaDevices.filter((item) => item.kind === "audioinput"));
        if(audioDevices && defaultAudioDeviceId === "")setDefaultAudioDeviceId(audioDevices[0].deviceId);
    };

    const handleAudioSuccess = (stream:any) => {
        setAudioTracks(stream.getAudioTracks());
        audioContext.current = new AudioContext();
        sourceNode.current = audioContext.current.createMediaStreamSource(stream);
        analyserNode.current = audioContext.current.createAnalyser();
        audioContext.current.resume();
        analyserNode.current.fftSize = 128;
        sourceNode.current.connect(analyserNode.current);
    };

    const handleAudioError = () => {

    };

    
    React.useEffect(
        () => {
            audioTracks.forEach((track:any) => {track.stop()});
            if(isCaptureEnable) {
                console.log("audio enable");
                
                navigator.mediaDevices.getUserMedia(
                    audioConstraints
                    )
                    .then(handleAudioSuccess)
                    .catch(handleAudioError);
            }
        },
        [isCaptureEnable,audioDeviceId]
    )

    React.useEffect(
        () => {
            navigator.mediaDevices.enumerateDevices().then(handleDevices);
        },
        [timer]
    );






    


    //face-api model
    
    const loadModels = async () => {
        Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
          ]).then(() => {
            faceDetection();
            audioDetection();
          })
    }


    const faceDetection = () => {
        setInterval(async () => {
            const nowTime = new Date();
            setTimer(nowTime.getSeconds());
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
            

        },500);
    };

    const audioDetection = () => {
        setInterval(async () => {
            if(isCaptureEnableRef.current) {
                const bufferLength = analyserNode.current?.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength || 0);
                analyserNode.current?.getByteTimeDomainData(dataArray);
                setAudioData(dataArray);
                renderAudioFrame(dataArray);
            }
        },200)
    };

    const renderAudioFrame = (data: Uint8Array) => {
        const ctx = canvasRef.current!.getContext('2d')!;
        const WIDTH = ctx.canvas.width;
        const HEIGHT = ctx.canvas.height;
        const dataLength = data.length;
        const barWidth = WIDTH / dataLength;
        ctx.fillStyle = '#1e1e1e';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        var x:number = 0;
        for (let i = 0; i < dataLength; i++) {
            const barHeight = data[i]-128;

            const r = barHeight + 25 * (i / dataLength);
            const g = 250 * (i / dataLength);
            const b = 50;

            ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
            ctx.fillRect(x, HEIGHT / 2, barWidth, -barHeight*2);
            ctx.fillRect(x, HEIGHT / 2, barWidth, barHeight*2);

            x += barWidth + 1;
        }
        animeIdRef.current = requestAnimationFrame(() => renderAudioFrame(data));
    };

    useEffect(() => {
		return () => {
			if (animeIdRef.current) {
				cancelAnimationFrame(animeIdRef.current)
			}
		}
	}, []);

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
        
        {isCaptureEnable || (
                <Button variant="contained" color="primary" disabled={defaultCameraDeviceId === "" || defaultAudioDeviceId === ""} onClick={() => setCaptureEnable(true)}>
                    {(defaultCameraDeviceId === "" || defaultAudioDeviceId === "") ? "デバイス取得中...お待ちください" : "ミーティングを開始する"}
                </Button>
        )}
        <div className="wrapper">
            
            {isCaptureEnable && (
                <>
                <div style={{alignItems: 'center'}}>
                    <Button variant="contained" color="primary" onClick={() => setCaptureEnable(false)}>終了</Button>
                </div>
                <div className="element">
                <div>
                    <Webcam
                    audio={false}
                    width={540}
                    height={360}
                    ref={webcamRef}
                    videoConstraints={videoConstraints}
                    />
                </div>
                <div className="wrapper" >
                    <div className="element" style={{width: "200px"}}>
                    <FormControl fullWidth>
                        <InputLabel>カメラ</InputLabel>
                        <Select 
                            label="カメラ"
                            onChange={(event) => {setCameraDeviceId(event.target.value as string);setDefaultCameraDeviceId(event.target.value as string)}}
                            defaultValue={defaultCameraDeviceId}
                            >
                            {cameraDevices.map((device, key) => (
                            <MenuItem  
                                value={device.deviceId}
                            >
                                {device.label || `Device ${key + 1}`}
                            </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    </div>
                    <div className="element" style={{width:"20px"}}></div>
                    <div className="element" style={{width: "200px"}}>
                    <FormControl fullWidth>
                        <InputLabel>マイク</InputLabel>
                        <Select 
                            label="マイク"
                            onChange={(event) => {setAudioDeviceId(event.target.value as string);setDefaultAudioDeviceId(event.target.value as string)}}
                            defaultValue={defaultAudioDeviceId}
                            >
                            {audioDevices.map((device, key) => (
                            <MenuItem  
                                value={device.deviceId}
                            >
                                {device.label || `Device ${key + 1}`}
                            </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    </div>
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
                <div style={{height:"300px",width:"500px"}}>
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="expression" domain={[0,1.5]}/>
                            <PolarRadiusAxis />
                            <Radar name="感情" dataKey="raderData" stroke="#2b2b2b" fill="#8884d8" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div style={{height:"250px",width:"500px"}}>
                    <canvas ref={canvasRef} style={{height:"100%",width:"100%"}} />
                </div>
                </div>
                </>
            )}
            </div>
        </>
    );
}

export default Top;