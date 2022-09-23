const fs = require('fs');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl')
const Ffmpeg = require('fluent-ffmpeg');


const user = process.env.USER
const buttonDownload = document.getElementById('btn-download')
const savePath = '/home/' + user + '/YoutubeDownloads/'
const urlStat = document.getElementById('url-stat')

urlStat.innerText = "Videos will be downloaded in " + savePath



buttonDownload.addEventListener("click", download) 
function download() {
    const url = document.getElementById('input-url').value
    const format = document.getElementById('sel-format').value

    // Create downloads folder if not exists
    if (!fs.existsSync(savePath)){
        fs.mkdirSync(savePath);
    }


    function saveDownload(videoURL){
        ytdl.getBasicInfo(videoURL).then(info => {
            const title = info.videoDetails.title
            const titleFixed = title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
            //Replace special chars
            console.log(titleFixed)
            if (format === 'mp3'){
                const audioReadableStream = ytdl(videoURL, { quality: 'highestaudio', filter: 'audioonly' })
                
                Ffmpeg(audioReadableStream)
                .save(savePath + titleFixed + '.mp3')
                .on("end", () => {
                    urlStat.innerText = "Downloaded " + title
                })
                
                
            } else {
                //37=1080p, 22=720p, 18=360p
                //Get all itags
                var allItags = []
                for (var i = 0; i < info.formats.length; i++) {
                    allItags.push(info.formats[i].itag)
                }
    
                var desiredItags = [37, 22, 18]
                var availableItags = []
                for (var i = 0; i < desiredItags.length; i++) {
                    if (allItags.includes(desiredItags[i])) {
                        availableItags.push(desiredItags[i])
                    }
                }
                //Choose highest quality itag
                var itag = ''
                if (availableItags.includes(37)) {
                    itag = 37
                } else if (availableItags.includes(22)) {
                    itag = 22
                } else if (availableItags.includes(18)) {
                    itag = 18
                }
                
                const videoReadableStream = ytdl(videoURL, { quality: itag, filter:'audioandvideo' })
                const writeStream = fs.createWriteStream(savePath + titleFixed + '.mp4')
                videoReadableStream.pipe(writeStream)
                writeStream
                .on("end", () => {
                    urlStat.innerText = "Downloaded " + title
                })
            }
        })
    }

    //Check if playlist checkbox is checked
    if (document.getElementById('checkbox-playlist').checked) {

        // Get playlist ID and validate
        const playlistId = ytpl.getPlaylistID(url)
        
        playlistId.then(result => {

            
            if (ytpl.validateID(result) == false) {
                urlStat.innerText = "Invalid playlist"
                return
            } else {
                urlStat.innerText = ""
                //Loop trough every video in playlist
                ytpl(result, {limit: Infinity, pages: Infinity}).then(result => {
                    for (var i = 0; i < result.items.length; i++) {
                        var videoID = result.items[i].id
                        var videoURL = 'https://www.youtube.com/watch?v=' + videoID
                        saveDownload(videoURL)
                    }
                })
            }
            
        })
        
    } else{
        var videoURL = url
        //Check if URL exists
        if (ytdl.validateURL(url) == false) {
            document.getElementById('url-stat').innerText = "Cannot get video. Invalid URL."
            return;
        }else{
            document.getElementById('url-stat').innerText = ""
        }
        
        saveDownload(videoURL)
        urlStat.innerText = "Downloaded succesfuly in " + savePath
    }
    
}

//When select directory button is clicked, open directory picker