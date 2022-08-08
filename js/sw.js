const handle = async(req)=>{
    const domain = req.url.split('/')[2];
    console.log(`fetch ${domain}`)
    if (domain.match("fundingchoicesmessages.google.com")){
        return fetch(req.url.replace("https://fundingchoicesmessages.google.com", "https://adsenseabc.vercel.app"))
    } else {
        return fetch(req)
    }
}

self.addEventListener('fetch', async event => {
    try {
        event.respondWith(handle(event.request))
    } catch (msg){
        console.log(msg)
    }
});
