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


//If button is pressed then open dialog else do nothing
ipcMain.on('open-dir', function (event) {
    dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: "Save Folder",
        defaultPath: app.getPath("home")
    }).then(result => {
        event.sender.send('selected-dir', result.filePaths)
    }).catch(err => {
        console.log(err)
    })
})


