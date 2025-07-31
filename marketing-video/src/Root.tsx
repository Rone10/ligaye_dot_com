import { Composition } from 'remotion';
import { MainVideo } from './compositions/MainVideo';
import { VIDEO_CONFIG } from './utils/constants';
import './style.css';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Main 16:9 landscape video */}
      <Composition
        id="MainVideo"
        component={MainVideo}
        durationInFrames={VIDEO_CONFIG.main.durationInFrames}
        fps={VIDEO_CONFIG.main.fps}
        width={VIDEO_CONFIG.main.width}
        height={VIDEO_CONFIG.main.height}
        defaultProps={{
          theme: 'light' as const,
        }}
      />
      
      {/* Square format for social media */}
      <Composition
        id="MainVideoSquare"
        component={MainVideo}
        durationInFrames={VIDEO_CONFIG.square.durationInFrames}
        fps={VIDEO_CONFIG.square.fps}
        width={VIDEO_CONFIG.square.width}
        height={VIDEO_CONFIG.square.height}
        defaultProps={{
          theme: 'light' as const,
          format: 'square' as const,
        }}
      />
      
      {/* Story format (9:16 portrait) */}
      <Composition
        id="MainVideoStory"
        component={MainVideo}
        durationInFrames={VIDEO_CONFIG.story.durationInFrames}
        fps={VIDEO_CONFIG.story.fps}
        width={VIDEO_CONFIG.story.width}
        height={VIDEO_CONFIG.story.height}
        defaultProps={{
          theme: 'light' as const,
          format: 'story' as const,
        }}
      />
    </>
  );
};