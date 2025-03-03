import React from 'react'
import SecureHLSPlayer from "./LiveReader";

const LivePreview = () => {
  const url = "https://192.168.127.12:8080/hls/test.m3u8"
  return (
    <>
      {/* Live Preview main container */}
      <div className="flex-col items-center justify-center p-4 bg-neutral-900 rounded-3xl size-full ">
        {/* title */}
        <h1 className="text-3xl m-auto w-4/6  font-bold text-white bg-neutral-500 rounded-2xl text-center">
          Create Stream
        </h1>
        {/* content */}
        <div className='flex flex-column bg-neutral-800 rounded-3xl w-full h-5/6 mt-4 flex items-center justify-center'>

          <SecureHLSPlayer m3u8Url={url}/>
        </div>
      </div>
    </>
  ) 
}

export default LivePreview