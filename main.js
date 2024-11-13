const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

 
const createWindow = () => {
    const options = {
        width: 1200,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        }
    };
    const main_win = new BrowserWindow(options);
    // const second = new BrowserWindow(options);
 
    main_win.loadFile('index.html');
    // second.loadFile('index.html');
};

ipcMain.handle('save-radar-info', async (event, radarData) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
      title: '레이더 데이터 저장',
      defaultPath: 'radarData.json',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
  
    if (!canceled && filePath) {
      // 파일에 레이더 데이터를 JSON 형식으로 저장
      fs.writeFileSync(filePath, JSON.stringify(radarData, null, 2), 'utf-8');
      return { success: true, filePath };
    } else {
      return { success: false };
    }
  });
 
app.whenReady().then(() => {
    createWindow();
 
 
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});
 
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});