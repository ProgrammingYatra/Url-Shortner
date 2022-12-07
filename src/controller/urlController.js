const shortid = require("shortid")
const urlModel = require("../models/urlModel")
const { isValid, isVAlidRequestBody, urlRegex, baseUrlRegex } = require('../validator/validation')

const redis = require('redis')
const { promisify } = require('util')


//Cache Connect==============================>
const redisClient = redis.createClient(
    17924,
    "redis-17924.c301.ap-south-1-1.ec2.cloud.redislabs.com",
    { no_ready_check: true }
);
redisClient.auth("XIKeHZtWEshno8MX2zZmx7WzMpekjhos", function (err) {
    if (err) throw err;
});

redisClient.on("connect", async function () {
    console.log("Connected to Redis..");
});


//SET and GET In cache=======================>
const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);



//Create ShortUrl by LongUrl==================================>
const createUrl = async function (req, res) {
    try {
        const body = req.body

        if (!isVAlidRequestBody(body)) return res.status(400).send({ status: false, message: "Please provide data to create Url" })


        const { longUrl } = body

        if (!isValid(longUrl)) return res.status(400).send({ status: false, message: "The longUrl is mandatory and Should have non empty string" })


        let cachedUrlData = await GET_ASYNC(`${longUrl}`)

        if (cachedUrlData) {
            let cacheShortUrl = JSON.parse(cachedUrlData)
            return res.status(200).send({ status: false, message: `This Url is already in Cache so use this shortUrl ${cacheShortUrl.shortUrl}` })
        }

        if (!urlRegex.test(longUrl)) return res.status(400).send({ status: false, message: "Please give the long url in valid Formate" })

        const getlongUrl = await urlModel.findOne({ longUrl: longUrl })

        if (getlongUrl) {
            await SET_ASYNC(`${longUrl}`, JSON.stringify(getlongUrl))

            return res.status(200).send({ status: false, message: `For This LongUrl use this ShortUrl ${getlongUrl.shortUrl} which is already Registered in DB` })
        }

        let baseUrl = 'http://localhost:3000'

        if (!baseUrlRegex.test(baseUrl)) return res.status(400).send({ status: false, message: "Please give the baseurl in valid Formate" })

        let urlCode = shortid.generate().toLowerCase()

        let shortUrl = baseUrl + '/' + urlCode

        const obj = {
            longUrl: longUrl,
            urlCode: urlCode,
            shortUrl: shortUrl,
        }
        const createUrl = await urlModel.create(obj)
        return res.status(201).send({ status: true, data: obj })

    } catch (error) {
        return res.status(500).send({ error: error.message })
    }
}



//Redirecting To LongUrl from UrlCode========================>
const getUrlCode = async function (req, res) {

    try {

        let urlCode = req.params.urlCode

        let findUrlCache = await GET_ASYNC(`${urlCode}`)
        if (findUrlCache) {
            let jsonLongUrl = JSON.parse(findUrlCache)
            let longUrl = jsonLongUrl.longUrl
            return res.status(302).redirect(longUrl)
        }

        let findUrl = await urlModel.findOne({ urlCode: urlCode })

        if (!findUrl) return res.status(404).send({ status: false, message: `This ${req.params.urlCode} urlCode is not found.` })

        await SET_ASYNC(`${urlCode}`, JSON.stringify(findUrl))

        return res.status(302).redirect(findUrl.longUrl)

    }
    catch (error) {
        return res.status(500).send({ error: error.message })
    }
}


module.exports = { createUrl, getUrlCode }