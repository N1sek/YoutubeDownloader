var { ipcRenderer } = require('electron');

const selectDirBtn = document.getElementById('sel-dir')

selectDirBtn.addEventListener('click', function (event) {
    ipcRenderer.send('open-dir')
});