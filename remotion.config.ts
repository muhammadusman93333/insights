import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// swangle is the fastest and most stable software renderer on Linux CI / GitHub Actions
Config.setChromiumOpenGlRenderer(process.platform === 'win32' ? 'angle' : 'swangle');
Config.setChromiumMultiProcessOnLinux(true);

