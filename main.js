const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

ipcMain.handle('getUserDataPath', () => {
    return app.getPath('userData');
}); 

ipcMain.handle('showSaveDialog', async () => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Radar Data',
        defaultPath: path.join(app.getPath('userData'), 'radarData.json'),
        filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });
    if (canceled) {
        return null;
    }
    return filePath;
});

ipcMain.handle('showOpenDialog', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        title: 'Load Radar Data',
        defaultPath: app.getPath('userData'),
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
        properties: ['openFile']
    });
    return canceled ? null : filePaths[0];
});

ipcMain.handle('saveRadarData', async (event, filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                console.error("Error saving radar data:", err);
                reject(err);
            } else {
                console.log(`Radar data saved successfully to ${filePath}`);
                resolve(true);
            }
        });
    });
});

ipcMain.handle('loadRadarData', async (event, filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error("Error loading radar data:", err);
                reject(err);
            } else {
                try {
                    const radarData = JSON.parse(data);
                    resolve(radarData);
                } catch (parseError) {
                    console.error("Error parsing radar data:", parseError);
                    reject(parseError);
                }
            }
        });
    });
});

ipcMain.on('getConfigPath', (event) => {
    try {
        const configPath = path.join(path.dirname(app.getPath('exe')), 'config.yaml');
        console.log("Yaml parsing:", configPath);
        const fileContents = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(fileContents);
        event.returnValue = config; // 동기적 응답 설정
    } catch (err) {
        try {
            const configPath = path.join(app.getAppPath(), 'config.yaml');
            console.log("Yaml parsing (fallback):", configPath, err);
            const fileContents = fs.readFileSync(configPath, 'utf8');
            const config = yaml.load(fileContents);
            event.returnValue = config;
        } catch (finalErr) {
            console.error("Error loading config.yaml:", finalErr);
            event.returnValue = null;
        }
    }
});

ipcMain.handle('getConfigData', () => {
    // const configPath = path.join(app.getPath('userData'), 'config.yaml');
    const fileContents = fs.readFileSync(configPath, 'utf8');

    const config = yaml.load(fileContents);
    return config;
});

const createWindow = () => {
    const options = {
        width: 1200,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, '\preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    };

    
    const main_win = new BrowserWindow(options);
    // const second = new BrowserWindow(options);
 
    main_win.loadFile('index.html');
    // second.loadFile('index.html');
};



app.whenReady().then(() => {
    createWindow();
 
 
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
 
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});