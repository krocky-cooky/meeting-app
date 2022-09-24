import React from 'react';
import Webcam from "react-webcam";


const videoConstraints = {
    width: 720,
    height: 360,
    facingMode: "user"
  };
  
export const Stats = () => {
const [isCaptureEnable, setCaptureEnable] = React.useState<boolean>(false);
const webcamRef = React.useRef<Webcam>(null);
const [url, setUrl] = React.useState<string | null>(null);
const capture = React.useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
    setUrl(imageSrc);
    }
}, [webcamRef]);

return (
    <>
    <header>
        <h1>カメラアプリ</h1>
    </header>
    {isCaptureEnable || (
        <button onClick={() => setCaptureEnable(true)}>開始</button>
    )}
    {isCaptureEnable && (
        <>
        <div>
            <button onClick={() => setCaptureEnable(false)}>終了</button>
        </div>
        <div>
            <Webcam
            audio={false}
            width={540}
            height={360}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            />
        </div>
        <button onClick={capture}>キャプチャ</button>
        </>
    )}
    {url && (
        <>
        <div>
            <button
            onClick={() => {
                setUrl(null);
            }}
            >
            削除
            </button>
        </div>
        <div>
            <img src={url} alt="Screenshot" />
        </div>
        </>
    )}
    </>
);
};

export default Stats;

