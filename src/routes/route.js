const express = require('express')
const router = express.Router()
const urlController = require("../controller/urlController")



router.get("/test", function (req, res) {
    return res.send({ data: "This to test" })
})

router.post('/url/shorten', urlController.createUrl)
router.get("/:urlCode", urlController.getUrlCode)


// for worng route=============================>

router.all('/*/', async function (req, res) {
    return res.status(404).send({ status: false, message: "Page Not Found" })
})


module.exports = router