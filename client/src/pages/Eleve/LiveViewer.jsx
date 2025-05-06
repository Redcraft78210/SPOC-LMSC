import { StreamPlayer } from '../../components/EleveComp/StreamPlayer';

// Component: LiveViewer
const LiveViewer = () => {
  return (
    <div className="min-h-screen bg-white pb-10">
      {/* Header Section: Live Information */}
      {/* <header className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-800">
            
          </h1>
        </div>
      </header> */}

      {/* Stream Player Section */}
      <main className="stream-player-wrapper w-full bg-gray-800 rounded-lg shadow-lg p-6">
        <StreamPlayer />
      </main>
    </div>
  );
};

export default LiveViewer;
