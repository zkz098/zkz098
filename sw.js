/*
* service worker版本: 1.1.2 (2022-8-17)
*/
const CACHE_NAME = "KaitakuCDNCache";
let cachelist = [];
let flag=false;
const cdn = {
    "gh": {
        jsdelivr: {
            "url": "https://cdn.jsdelivr.net/gh"
        },
        jsdelivr_fastly: {
            "url": "https://fastly.jsdelivr.net/gh"
        },
        jsdelivr_kaitaku:{
            "url": "https://jsd.kaitaku.xyz/gh"
        }
    },
    "cdnjs": {
        staticfile: {
            "url": "https://cdn.staticfile.org"
        },
        cdnjs_cf: {
            "url": "https://cdnjs.cloudflare.com/ajax/libs"
        },
        baomitu: {
            "url": "https://lib.baomitu.com"
        },
        bytedance: {
            "url": "https://lf9-cdn-tos.bytecdntp.com/cdn/expire-1-M"
        }
    },
    "npm": {
        sourcegcdn: {
            "url": "https://npm.sourcegcdn.com"
        },
        unpkg: {
            "url": "https://unpkg.com"
        },
        tianli: {
            "url": "https://cdn1.tianli0.top/npm"
        }
    }
}

const info = (mes) => {
    console.log(`%c INFO %c ${mes}`, "color: white; background: #32cd32; padding: 5px 3px;", "padding: 4px;border:1px solid #32cd32")
}
const warn = (mes) => {
    console.log(`%c WARN %c ${mes}`, "color: white; background: #ffd700; padding: 5px 3px;", "padding: 4px;border:1px solid #ffd700")
}
const err = (mes) => {
    console.log(`%c ERROR %c ${mes}`, "color: white; background: #ff0000; padding: 5px 3px;", "padding: 4px;border:1px solid #ff0000")
}
const handleerr = async (req, msg) => {
    return new Response(`<h1>KaitakuCDNCache遇到了致命错误</h1>
    <b>${msg}</b>`, {headers: {"content-type": "text/html; charset=utf-8"}})
}
const file_found = (urlString,token)=>{
    return urlString.indexOf(token) > -1;
}

const handle = async (req) => {
    const urlStr = req.url
    const domain = req.url.split('/')[2];
    let urls = []
    if (file_found(urlStr,"woff")||file_found(urlStr,"ico")){
        return caches.match(req).then(function (resp) {
            return resp || fetch(urlStr).then(function (res) {
                return caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(req, res.clone());
                    return res;
                });
            });
        })
    } else if (domain.match("www.kaitaku.xyz")) {
        if (file_found(urlStr,".jpg")){
            req.url.replace(".jpg",".webp")
        } else if (file_found(urlStr,".png")){
            req.url.replace(".png",".webp")
        }
        return fetch(req.url).then(function (res) {
            if (!res) { throw 'error' }
            return caches.open(CACHE_NAME).then(function (cache) {
                cache.delete(req);
                cache.put(req, res.clone());
                return res;
            });
        }).catch(function (err) {
            return caches.match(req).then(function (resp) {
                return resp || caches.match(new Request('/offline.html')) //
            })
        })
    } else {
        for (let i in cdn) {
            for (let j in cdn[i]) {
                if (domain === cdn[i][j].url.split('https://')[1].split('/')[0] && urlStr.match(cdn[i][j].url)) {
                    info(`capture ${urlStr}`)
                    urls = []
                    for (let k in cdn[i]) {
                        urls.push(urlStr.replace(cdn[i][j].url, cdn[i][k].url))
                    }
                    if (urlStr.indexOf('@latest/') > -1) {
                        return lfetch(urls, urlStr)
                    } else {
                        return caches.match(req).then(function (resp) {
                            return resp || lfetch(urls, urlStr).then(function (res) {
                                return caches.open(CACHE_NAME).then(function (cache) {
                                    cache.put(req, res.clone());
                                    return res;
                                });
                            });
                        })
                    }
                }
            }
        }
        return fetch(req)
    }
}

const lfetch = async (urls, url) => {
    info(`lfetch handle! | mirrors: ${urls.length}`)
    let controller = new AbortController();
    const PauseProgress = async (res) => {
        return new Response(await (res).arrayBuffer(), {status: res.status, headers: res.headers});
    };
    if (!Promise.any) {
        Promise.any = function (promises) {
            return new Promise((resolve, reject) => {
                promises = Array.isArray(promises) ? promises : []
                let len = promises.length
                let errs = []
                if (len === 0) return reject(new AggregateError('All promises were rejected'))
                promises.forEach((promise) => {
                    promise.then(value => {
                        resolve(value)
                    }, err => {
                        len--
                        errs.push(err)
                        if (len === 0) {
                            reject(new AggregateError(errs))
                        }
                    })
                })
            })
        }
    }
    return Promise.any(urls.map(urls => {
        return new Promise((resolve, reject) => {
            fetch(urls, {
                signal: controller.signal
            })
                .then(PauseProgress)
                .then(async res => {
                        if (res.status === 200) {
                            controller.abort();
                            resolve(res)
                        } else {
                            reject(res)
                        }
                    }
                ).catch(async (reason) => {
                if (!flag) {
                    warn("fetch: " + reason)
                    flag = true;
                }
            })
        })
    }))
}
self.addEventListener('install', async (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            info(`${CACHE_NAME} Opened`);
            info(`${CACHE_NAME} start running`)
            return cache.addAll(cachelist);
        })
    );
})

self.addEventListener('activate', async function (installEvent) {
    self.clients.claim();
})

self.addEventListener('fetch', async (event) => {
    if (event.request.url.indexOf("cravatar")!==-1||event.request.url.indexOf("qweather")!==-1) {
        return;
    }
    try {
        event.respondWith(handle(event.request))
    } catch (msg) {
        event.respondWith(handleerr(event.request, msg))
    }
});


