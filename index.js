const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const contextMenu = require('electron-context-menu')
const path = require('path');

try {
    require('electron-reloader')(module)
} catch (_) {}

contextMenu({
	showInspectElement: false,
    showCopyImage: false,
    showServices: false,
    showCopyImageAddress: false,
    showSearchWithGoogle: false,
    showLearnSpelling: false,
    showLookUpSelection: false,
});

const createWindow = () => {
    const win = new BrowserWindow({
        width: 900,
        height: 300,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, 'resources/icons/icon.png')
    })

    win.setResizable(false);
    win.setMenuBarVisibility(false);
    win.loadFile('src/index.html');
    //win.webContents.openDevTools();

}

app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


ipcMain.on('open-dir', function (event) {
    dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: "Save Folder",
        defaultPath: app.getPath("downloads")
    }).then(result => {
        event.sender.send('selected-dir', result.filePaths)
    })
})


