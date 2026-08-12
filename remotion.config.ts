import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// swangle is the software renderer on Linux CI / GitHub Actions without GPU
Config.setChromiumOpenGlRenderer(process.platform === 'win32' ? 'angle' : 'swangle');
Config.setChromiumMultiProcessOnLinux(false);

