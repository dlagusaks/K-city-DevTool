const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
 
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type]);
    }
});

// preload.js


contextBridge.exposeInMainWorld('electronAPI', {
    getUserDataPath: () => ipcRenderer.invoke('getUserDataPath'),
    showSaveDialog: () => ipcRenderer.invoke('showSaveDialog'),
    showOpenDialog: () => ipcRenderer.invoke('showOpenDialog'), // New function for loading
    saveRadarData: async (filePath, data) => {
        return await ipcRenderer.invoke('saveRadarData', filePath, data);
    },
    loadRadarData: async (filePath) => {
        return await ipcRenderer.invoke('loadRadarData', filePath);
    },
    getConfigPath: () => ipcRenderer.sendSync('getConfigPath'),
    getConfigData: () => ipcRenderer.invoke('getConfigData'),
    
    
});
