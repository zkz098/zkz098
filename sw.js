const handle = async(req)=>{
    const domain = req.url.split('/')[2];
    console.log(`fetch ${domain}`)
    if (domain.match("fundingchoicesmessages.google.com")){
        return fetch(req.url.replace("https://fundingchoicesmessages.google.com", "https://adsenseabc.vercel.app"),{
            mode: "no-cors"
        })
    } else {
        return fetch(req)
    }
}
self.addEventListener('install',async (event)=>{
    self.skipWaiting();
    event.waitUntil(
        caches.open("KaitakuCache")
    );
    console.log("%c INFO %c KaitakuCache Opened","color: white; background: #00ff00; padding: 5px 3px;","padding: 4px;border:1px solid #00ff00")
})
// ServiceWorkerGlobalScope.onfetch = (event) =>{
//     console.log("fetched fetch")
//     try {
//         event.respondWith(handle(event.request))
//     } catch (msg){
//         console.log(msg)
//     }
// }
addEventListener('fetch', async (event) => {
    console.log("fetched fetch")
    try {
        event.respondWith(handle(event.request))
    } catch (msg){
        console.log(msg)
    }
});
self.addEventListener('activate',async function(installEvent){
    self.clients.claim();
})

