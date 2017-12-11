const createWindowsInstaller = require('electron-winstaller').createWindowsInstaller;
const path = require('path');

getInstallerConfig()
  .then(createWindowsInstaller)
  .catch((error) => {
    console.error(error.message || error)
    process.exit(1)
  });

function getInstallerConfig () {
  console.log('creating windows installer');
  const rootPath = path.join('./');
//   const outPath = path.join(rootPath, 'release-builds');
  
  return Promise.resolve({
    appDirectory: path.join(rootPath, '/release-builds/livelearning-win32-ia32'),
    authors: 'Christian Dale Sampang',
    noMsi: true,
    outputDirectory: path.join(rootPath, '/installer/windows'),
    exe:  path.join(rootPath, '/livelearning.exe'),
    setupExe: 'LiveLearningAppInstaller.exe',
  });
};