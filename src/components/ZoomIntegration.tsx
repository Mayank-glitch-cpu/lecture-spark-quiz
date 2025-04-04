
import { Mic, Video } from "lucide-react";
import { Card } from "./ui/card";

const ZoomIntegration = () => {
  return (
    <Card className="h-[500px] flex flex-col justify-center items-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Video className="h-10 w-10 text-gray-400 animate-pulse" />
        <h3 className="text-lg font-medium">Zoom SDK Integration</h3>
        <p className="text-sm text-gray-500 text-center max-w-xs">
          The Zoom video would appear here when connected to a live session with the Zoom Web SDK.
        </p>
        <div className="flex gap-2 mt-3">
          <div className="bg-gray-200 rounded-full p-2">
            <Video className="h-5 w-5 text-gray-600" />
          </div>
          <div className="bg-gray-200 rounded-full p-2">
            <Mic className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ZoomIntegration;
