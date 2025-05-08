const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = require('electron-is-dev');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadFile('index.html');

  // Open DevTools in development mode
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});

// Handle Python script execution
ipcMain.on('run-python', (event, args) => {
  let pythonExecutable;
  let scriptPath;
  
  if (isDev) {
    // In development, use local Python
    pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
    scriptPath = path.join(__dirname, 'src', 'python', 'script.py');
  } else {
    // In production, use bundled Python executable
    const resourcesPath = process.resourcesPath;
    
    if (process.platform === 'win32') {
      scriptPath = path.join(resourcesPath, 'app', 'dist', 'script.exe');
      pythonExecutable = scriptPath;
    } else if (process.platform === 'darwin') {
      scriptPath = path.join(resourcesPath, 'app', 'dist', 'script');
      pythonExecutable = scriptPath;
    } else {
      scriptPath = path.join(resourcesPath, 'app', 'dist', 'script');
      pythonExecutable = scriptPath;
    }
  }

  // Log paths for debugging
  console.log('Python executable:', pythonExecutable);
  console.log('Script path:', scriptPath);

  // Ensure the script exists
  if (!isDev && !fs.existsSync(scriptPath)) {
    event.sender.send('python-output', { error: `Script not found at ${scriptPath}` });
    return;
  }

  let options = [];
  
  if (isDev) {
    // In dev mode, pass the script path as an argument to Python
    options.push(scriptPath);
  }
  
  // Add any arguments from the UI
  if (args && args.length > 0) {
    options = options.concat(args);
  }

  let pythonProcess;
  
  if (isDev) {
    // In dev mode, execute Python with the script path
    pythonProcess = spawn(pythonExecutable, options);
  } else {
    // In production, directly execute the compiled Python executable
    pythonProcess = spawn(pythonExecutable, args);
  }

  let pythonData = '';
  let pythonError = '';

  pythonProcess.stdout.on('data', (data) => {
    pythonData += data.toString();
    event.sender.send('python-output', { data: data.toString() });
  });

  pythonProcess.stderr.on('data', (data) => {
    pythonError += data.toString();
    event.sender.send('python-output', { error: data.toString() });
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      event.sender.send('python-output', { error: `Process exited with code ${code}` });
    }
    event.sender.send('python-complete', { code, data: pythonData, error: pythonError });
  });
});
