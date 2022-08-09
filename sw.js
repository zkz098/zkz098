//TODO 更改sw
/*工具包区域*/
const info = (mes)=>{
    console.log(`%c INFO %c ${mes}`,"color: white; background: #32cd32; padding: 5px 3px;","padding: 4px;border:1px solid #32cd32")
}
const warn = (mes)=>{
    console.log(`%c WARN %c ${mes}`,"color: white; background: #ffd700; padding: 5px 3px;","padding: 4px;border:1px solid #ffd700")
}
const err = (mes)=>{
    console.log(`%c ERROR %c ${mes}`,"color: white; background: #ff0000; padding: 5px 3px;","padding: 4px;border:1px solid #ff0000")
}

const handle = async(req)=>{
    const domain = req.url.split('/')[2];
    if (domain.match("fundingchoicesmessages.google.com")){
        // console.log("%c INFO %c fetch fundingchoicesmessages succeed","color: white; background: #00ff00; padding: 5px 3px;","padding: 4px;border:1px solid #00ff00")
        info("fetch fundingchoicesmessages succeed")
        return fetch(req.url.replace("https://fundingchoicesmessages.google.com", "https://adsenseabc.vercel.app"))
    } else {
        return fetch(req)
    }
}
self.addEventListener('install',async (event)=>{
    self.skipWaiting();
    event.waitUntil(
        caches.open("KaitakuCache")
    );
    // console.log("%c INFO %c KaitakuCache Opened","color: white; background: #00ff00; padding: 5px 3px;","padding: 4px;border:1px solid #00ff00")
    info("KaitakuCache Opened")
    console.log("%c INFO %c SW WIP","color: white; background: #00ff00; padding: 5px 3px;","padding: 4px;border:1px solid #00ff00")
    warn("SW WIP")
})
addEventListener('fetch', async (event) => {
    try {
        event.respondWith(handle(event.request))
    } catch (msg){
        console.error(msg)
    }
});
self.addEventListener('activate',async function(installEvent){
    self.clients.claim();
})

