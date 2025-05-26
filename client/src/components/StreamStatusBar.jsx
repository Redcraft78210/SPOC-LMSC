import React from "react";
import { MicOff, MonitorPause, MonitorPlay, MonitorStop } from "lucide-react";

export const StreamStatusBar = () => {
  return (
    <div className="bg-neutral-900 rounded-3xl w-full max-w-5xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {[
          { icon: <MicOff size={48} />, label: "Mute", color: "bg-zinc-500" },
          { icon: <MonitorStop size={48} />, label: "Stop", color: "bg-red-600" },
          { icon: <MonitorPause size={48} />, label: "Pause", color: "bg-blue-700" },
          { icon: <MonitorPlay size={48} />, label: "Play", color: "bg-lime-500" },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            <button className={`${item.color} w-full h-auto flex justify-center text-black rounded-[15px] p-3`}>
              {item.icon}
            </button>
            <p className="text-lg md:text-2xl mt-2 text-white">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
