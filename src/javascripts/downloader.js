var { ipcRenderer } = require('electron');

const cp = require('child_process');
const readline = require('readline');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ytpl = require('ytpl')
const Ffmpeg = require('fluent-ffmpeg');
const ffmpegs = require('ffmpeg-static')
const tracker = {
    start: Date.now(),
    audio: { downloaded: 0, total: Infinity },
    video: { downloaded: 0, total: Infinity },
    merged: { frame: 0, speed: '0x', fps: 0 },
};

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



//Download button
buttonDownload.addEventListener('click', function (event) {
    
    var savePath = document.getElementById('sel-dir').value
    
    if (savePath == ""){
        savePath = defaultPath
        urlStat.innerText = "Download path: " + savePath
        if (!fs.existsSync(savePath)){
            fs.mkdirSync(savePath);
        }
    }
    
    urlStat.innerText = 'Downloading...'
    var url = document.getElementById('input-url').value
    if (ytdl.validateURL(url)) {
        convertVideo(url, savePath)
    } else if (document.getElementById('checkbox-playlist').checked) {
        convertPlaylist(url, savePath)
    } else {
        urlStat.innerText = 'URL not supported'
    }

})

//Download video
function convertVideo(url, savePath,) {
    ytdl.getBasicInfo(url).then(info => {
        const format = document.getElementById('sel-format').value
        const title = info.videoDetails.title
        //Replace special chars
        const titleFixed = title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
        if (format === 'mp3'){
            const audioReadableStream = ytdl(url, { quality: 'highestaudio', filter: 'audioonly' })
            
            Ffmpeg(audioReadableStream)
            .save(savePath + titleFixed + '.mp3')
            .on("end", () => {
                urlStat.innerText = "Downloaded " + '"' + title + '"'
            })
        } else {
            console.log(info.formats)

            //Get audio and video streams, then merge them into one file
            
            const audio = ytdl(url, { quality: 'highestaudio' })
                .on('progress', (_, downloaded, total) => {
                    tracker.audio = { downloaded, total };
                });
            const video = ytdl(url, { quality: 'highestvideo' })
                .on('progress', (_, downloaded, total) => {
                    tracker.video = { downloaded, total };
                });

                const ffmpegProcess = cp.spawn(ffmpegs, [
                    // Remove ffmpeg's console spamming
                    '-loglevel', '8', '-hide_banner',
                    // Redirect/Enable progress messages
                    '-progress', 'pipe:3',
                    // Set inputs
                    '-i', 'pipe:4',
                    '-i', 'pipe:5',
                    // Map audio & video from streams
                    '-map', '0:a',
                    '-map', '1:v',
                    // Keep encoding
                    '-c:v', 'copy',
                    // Define output file
                    savePath + titleFixed + '.mp4',
                ], {
                    windowsHide: true,
                    stdio: [
                    /* Standard: stdin, stdout, stderr */
                    'inherit', 'inherit', 'inherit',
                    /* Custom: pipe:3, pipe:4, pipe:5 */
                    'pipe', 'pipe', 'pipe',
                    ],
                });
                ffmpegProcess.on('close', () => {
                    urlStat.innerText = "Downloaded " + '"' + title + '"' ;
                    // Cleanup
                    process.stdout.write('\n\n\n\n');
                });

                audio.pipe(ffmpegProcess.stdio[4]);
                video.pipe(ffmpegProcess.stdio[5]);
            
        }
    })
    
}

//Download playlist
function convertPlaylist(url, savePath) {
    
    
    ytpl(url).then(playlist => {
        const format = document.getElementById('sel-format').value
        const title = playlist.title
        const videos = playlist.items
        if (format === 'mp3'){
            for (let i = 0; i < videos.length; i++) {
                const audioReadableStream = ytdl(videos[i].shortUrl, { quality: 'highestaudio', filter: 'audioonly' })
                const titleFixed = videos[i].title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
                Ffmpeg(audioReadableStream)
                .save(savePath + titleFixed + '.mp3')
                .on("end", () => {
                    urlStat.innerText = "Downloaded " + '"' + title + ' Playlist"'
                })
            }
        } else {
            for (let i = 0; i < videos.length; i++) {
                //Get audio and video streams, then merge them into one file
                const titleFixed = videos[i].title.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
                const audio = ytdl(videos[i].shortUrl, { quality: 'highestaudio' })
                    .on('progress', (_, downloaded, total) => {
                        tracker.audio = { downloaded, total };
                    });
                const video = ytdl(videos[i].shortUrl, { quality: 'highestvideo' })
                    .on('progress', (_, downloaded, total) => {
                        tracker.video = { downloaded, total };
                    });

                const ffmpegProcess = cp.spawn(ffmpegs, [
                    // Remove ffmpeg's console spamming
                    '-loglevel', '8', '-hide_banner',
                    // Redirect/Enable progress messages
                    '-progress', 'pipe:3',
                    // Set inputs
                    '-i', 'pipe:4',
                    '-i', 'pipe:5',
                    // Map audio & video from streams
                    '-map', '0:a',
                    '-map', '1:v',
                    // Keep encoding
                    '-c:v', 'copy',
                    // Define output file
                    defaultPath + titleFixed + '.mp4',
                ], {
                    windowsHide: true,
                    stdio: [
                    /* Standard: stdin, stdout, stderr */
                    'inherit', 'inherit', 'inherit',
                    /* Custom: pipe:3, pipe:4, pipe:5 */
                    'pipe', 'pipe', 'pipe',
                    ],
                });
                ffmpegProcess.on('close', () => {
                    urlStat.innerText = "Downloaded " + '"' + title + ' Playlist"' ;
                    // Cleanup
                    process.stdout.write('\n\n\n\n');
                });

                audio.pipe(ffmpegProcess.stdio[4]);
                video.pipe(ffmpegProcess.stdio[5]);
            }
        }
    })
}



