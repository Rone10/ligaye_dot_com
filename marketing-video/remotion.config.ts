import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');

enableTailwind({
	tailwindCssPath: './src/style.css',
});

Config.setStudioPort(3001);