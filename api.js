/**
 * get translate api
 */
'use strict';
const tjs = require('translation.js')
const http = require('http')
const querystring = require('querystring')

const getUrlParams = (key, text) => {
    let searchStr = text.split('?') ? text.split('?')[1] : text,
        searchArr = searchStr.split('&'),
        reg = /^(.+?)(?:=(.*))?$/,
        result = {};

    for (let pair of searchArr.keys()) {
        let match = searchArr[pair].match(reg);

        if (!match) {
            continue;
        } else {
            result[match[1]] = match[2] || null;
        }
    }

    return key ? result[key] : result;
}

const getData = (api, text, callback, errorCallback) => {
    let url, options, postData = querystring.stringify({})
    switch (api) {
        case 'Google':
            // url = 'http://translate.google.com/translate_a/single?client=gtx&sl=auto&tl=auto&hl=zh-CN&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=' + text
            options = {
              hostname: 'translate.google.com',
              port: 80,
              path: '/translate_a/single?client=gtx&sl=auto&tl=auto&hl=zh-CN&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=' + encodeURIComponent(text),
              method: 'GET',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
            break
        case 'GoogleCN':
            // url = 'http://translate.google.cn/translate_a/single?client=gtx&sl=auto&tl=auto&hl=zh-CN&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=' + text
            options = {
              hostname: 'translate.google.cn',
              port: 80,
              path: '/translate_a/single?client=gtx&sl=auto&tl=auto&hl=zh-CN&dt=at&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&ie=UTF-8&oe=UTF-8&dj=1&source=icon&q=' + encodeURIComponent(text),
              method: 'GET',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
            break
        case 'Baidu':
            // url = 'http://fanyi.baidu.com/v2transapi?from=auto&to=zh&transtype=hash&simple_means_flag=3&query=' + text
            options = {
              hostname: 'fanyi.baidu.com',
              port: 80,
              path: '/v2transapi?from=auto&to=zh&transtype=hash&simple_means_flag=3&query=' + encodeURIComponent(text),
              method: 'GET',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
            break
        case 'Youdao':
            // url = 'https://fanyi.youdao.com/openapi.do?key=&keyfrom=&type=data&doctype=json&version=1.1&1=' + text
            url = ''
            postData = querystring.stringify({
                type:'AUTO',
                i: text,
                doctype:'json',
                xmlVersion:'1.8',
                keyfrom:'fanyi.web',
                ue:'UTF-8',
                action:'FY_BY_CLICKBUTTON',
                typoResult:true
            })
            options = {
              hostname: 'fanyi.youdao.com',
              port: 80,
              path: '/translate?smartresult=dict&smartresult=rule&smartresult=ugc&sessionFrom=null',
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
              }
            }
            break
    }


    const post_req = http.request(options, (res) => {
        res.setEncoding('utf8')
        let str = ''
        res.on('data',(data) => {return str = str + data})
        res.on('end', () => {
            typeof callback === 'function' && callback(str)
        })
    })
    post_req.write(postData)
    post_req.end()
}
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/json', 'Access-Control-Allow-Origin': '*'})

    const url = req.url
    if (url.split('?')[0] === '/api/translate') {
        const api = decodeURIComponent(getUrlParams('api', url))
        const q = decodeURIComponent(getUrlParams('q', url))

        console.log(api, q)
        getData(api, q, (resultObj) => {
            console.log(resultObj, typeof resultObj)
            res.end(resultObj)
        }, (errMsg) => {
            res.end(errMsg)
        })
    } else {
        console.log('end')
        res.end('');
    }
})

server.listen('8791', () => {console.log('listening...')})

