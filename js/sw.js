const handle = async(req)=>{
    const domain = req.url.split('/')[2];
    if (domain.match("fundingchoicesmessages.google.com")){
        return fetch(req.url.replace("https://fundingchoicesmessages.google.com", "https://adsenseabc.vercel.app"))
    } else {
        return fetch(req)
    }
}

self.addEventListener("fetch",async event=>{
    event.respondWith(handle(event.request));
    console.log(event.request.url)
    }
)
