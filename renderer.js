//open directory picker and save selected directory to variable

const ipc = require('electron').ipcRenderer
const selectDirBtn = document.getElementById('sel-dir')

selectDirBtn.addEventListener('click', function (event) {
    ipc.send('open-dir')
});

//Getting back the information after selecting the file
ipc.on('selected-dir', function (event, path) {

    document.getElementById('url-stat').innerText = path
    console.log(event)
});