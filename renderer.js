var { ipcRenderer } = require('electron');

const selectDirBtn = document.getElementById('sel-dir')

selectDirBtn.addEventListener('click', function (event) {
    ipcRenderer.send('open-dir')
});

//Receive selected folder from ipcMain
ipcRenderer.on('selected-dir', (event, args) => {
    
    if (args == ""){
        document.getElementById('sel-dir').value = defaultPath
    } else {
        document.getElementById('sel-dir').value = args + '/'
        document.getElementById('url-stat').innerText = "Download path: " + args + '/'
    }
})