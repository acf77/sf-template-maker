const https = require("https");
const express = require("express");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator");

const app = express();
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

app.set("view engine", "ejs");
app.use("/public", express.static("public"));

app.get("/", (req, res) => res.render("index"));

app.post("/scrape", urlEncodedParser,
  [
    check("alertLink", "You must add an alert link!")
      .exists()
      .isLength({ min: 1 }),
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorArray = errors.array();
      res.render('index-error', { errorArray: errorArray[0].msg });
    } else {
      const alertLink = req.body.alertLink.replace('https://engineering.paypalcorp.com/merchantmonitor/#/alerts/', 'https://engineering.paypalcorp.com/merchantmonitor/api/v1/alerts/').trim();
      console.log(alertLink);

      https.get(alertLink, function (resp) {
        console.log('STATUS: ' + resp.statusCode);
        console.log('HEADERS: ' + JSON.stringify(resp.headers));

        const bodyChunks = [];
        resp.on('data', function (chunk) {
          bodyChunks.push(chunk);
        }).on('end', function () {
          const body = Buffer.concat(bodyChunks);
          const data = JSON.parse(body);
          console.log(data);

          res.render('result', { merchantId: data.meta.account_id, alertId: data.human_readable_id, merchantName: data.meta.account.merchant_name });


        })

      });

    }
  }


);

app.listen(process.env.PORT || 8080, () => console.log("Server started!"));
