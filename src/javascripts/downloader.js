var { ipcRenderer } = require('electron');

const fs = require('fs');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl')
const Ffmpeg = require('fluent-ffmpeg');


const user = process.env.USER
const buttonDownload = document.getElementById('btn-download')
const urlStat = document.getElementById('url-stat')
const defaultPath = '/home/' + user + '/YoutubeDownloads/'

urlStat.innerText = "Default download path: ~/YoutubeDownloads/"



//Disable the download button if the url is empty
document.getElementById('input-url').addEventListener('input', function (event) {
    if (document.getElementById('input-url').value == '') {
        buttonDownload.classList.add("disabled")
    } else {
        buttonDownload.classList.remove("disabled")
    }
})

//
ipcRenderer.on('selected-dir', (event, args) => {
    document.getElementById('sel-dir').value = args + '/'
})

//Download button
buttonDownload.addEventListener('click', function (event) {
    
    var savePath = document.getElementById('sel-dir').value

    if (savePath == ''){
        savePath = defaultPath
    }
    
    console.log(savePath)
    buttonDownload.innerText = 'Downloading...'
    var url = document.getElementById('input-url').value
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
        convertVideo(url)
    } else if (document.getElementById('checkbox-playlist').checked) {
        convertPlaylist(url)
    } else {
        buttonDownload.innerText = 'URL not supported'
    }
    
    console.log()
})

//Download video
function convertVideo(url) {
    ytdl.getBasicInfo(url).then(info => {
        const format = document.getElementById('sel-format').value
        const title = info.videoDetails.title
        const titleFixed = title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
        //Replace special chars
        console.log(titleFixed)
        if (format === 'mp3'){
            const audioReadableStream = ytdl(url, { quality: 'highestaudio', filter: 'audioonly' })
            
            Ffmpeg(audioReadableStream)
            .save(defaultPath + titleFixed + '.mp3')
            .on("end", () => {
                urlStat.innerText = "Downloaded " + title
            })
        }
    })
}

//Download playlist
function convertPlaylist(url) {
    ytpl(url, (err, playlist) => {
        if (err) throw err;
        var title = playlist.title
        var videos = playlist.items
        var output = defaultPath + title
        if (!fs.existsSync(output)){
            fs.mkdirSync(output);
        }
        for (let i = 0; i < videos.length; i++) {
            var video = ytdl(videos[i].shortUrl, {
                quality: 'highestaudio'
            });
            var proc = new Ffmpeg({
                    source: video
                })
                .audioCodec('libmp3lame')
                .audioBitrate(320)
                .audioChannels(2)
                .format('mp3')
                .on('error', function (err) {
                    console.log('An error occurred: ' + err.message);
                })
                .on('end', function () {
                    buttonDownload.classList.remove("disabled")
                    buttonDownload.innerHTML = 'Download'
                    alert("Downloaded: " + title)
                })
                .save(output);
        }
    });
}

// //If ipcRenderer doesnt get data then set defaultPath
// ipcRenderer.on('selected-dir', (event, path) => {

//     var savePath = path[0] + '/'

    
//     urlStat.innerText = 'Videos will be downloaded in: ' + savePath


//     buttonDownload.addEventListener('click', function (event) {
        
//         //Save url and selected format to variable
//         const url = document.getElementById('input-url').value
//         const format = document.getElementById('sel-format').value

//         //Check if URL exists
//         if (ytdl.validateURL(url) == false) {
//             document.getElementById('url-stat').innerText = "Cannot get video. Invalid URL."
//             return;
//         }else{
//             urlStat.innerText = "Downloading...It can take a while"
//         }

        


//         function saveDownload(videoURL){
//             ytdl.getBasicInfo(videoURL).then(info => {
//                 const title = info.videoDetails.title
//                 const titleFixed = title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
//                 //Replace special chars
//                 console.log(titleFixed)
//                 if (format === 'mp3'){
//                     const audioReadableStream = ytdl(videoURL, { quality: 'highestaudio', filter: 'audioonly' })
                    
//                     Ffmpeg(audioReadableStream)
//                     .save(savePath + titleFixed + '.mp3')
//                     .on("end", () => {
//                         urlStat.innerText = "Downloaded " + title
//                     })
                    
                    
//                 } else {
//                     //37=1080p, 22=720p, 18=360p
//                     //Get all itags
//                     var allItags = []
//                     for (var i = 0; i < info.formats.length; i++) {
//                         allItags.push(info.formats[i].itag)
//                     }
        
//                     var desiredItags = [37, 22, 18]
//                     var availableItags = []
//                     for (var i = 0; i < desiredItags.length; i++) {
//                         if (allItags.includes(desiredItags[i])) {
//                             availableItags.push(desiredItags[i])
//                         }
//                     }
//                     //Choose highest quality itag
//                     var itag = ''
//                     if (availableItags.includes(37)) {
//                         itag = 37
//                     } else if (availableItags.includes(22)) {
//                         itag = 22
//                     } else if (availableItags.includes(18)) {
//                         itag = 18
//                     }
                    
//                     const videoReadableStream = ytdl(videoURL, { quality: itag, filter:'audioandvideo' })
//                     const writeStream = fs.createWriteStream(savePath + titleFixed + '.mp4')
//                     videoReadableStream.pipe(writeStream)
//                     writeStream
//                     .on("end", () => {
//                         urlStat.innerText = "Downloaded " + title
//                     })
//                 }
//             })
//         }

//         //Check if playlist checkbox is checked
//         if (document.getElementById('checkbox-playlist').checked) {

//             // Get playlist ID and validate
//             const playlistId = ytpl.getPlaylistID(url)
            
//             playlistId.then(result => {

                
//                 if (ytpl.validateID(result) == false) {
//                     urlStat.innerText = "Invalid playlist"
//                     return
//                 } else {
//                     urlStat.innerText = ""
//                     //Loop trough every video in playlist
//                     ytpl(result, {limit: Infinity, pages: Infinity}).then(result => {
//                         for (var i = 0; i < result.items.length; i++) {
//                             var videoID = result.items[i].id
//                             var videoURL = 'https://www.youtube.com/watch?v=' + videoID
//                             saveDownload(videoURL)
//                         }
//                     })
//                 }
                
//             })
            
//         } else{
//             var videoURL = url
//             saveDownload(videoURL)
//             urlStat.innerText = "Downloaded succesfuly in " + savePath
//         }
//     });
// })

