const express = require('express');
const bcrypt = require('bcryptjs');
var admin = require('firebase-admin');
var serviceAccount = require("./hackathon-5c5a7-firebase-adminsdk-66rzc-9febd96c0a.json");
var path = require('path');
var bodyParser = require('body-parser');
const WebSocket = require('ws');
const http = require('http');
const PORT = process.env.PORT || 80;

const setTZ = require('set-tz');
setTZ('America/New_York');

var app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hackathon-5c5a7.firebaseio.com"
});

function calc_bus_risk(number_masks, people_risk_scores, duration) {
  let total_risk = 1
  for (let person_risk of people_risk_scores) {
      total_risk *= (1-person_risk)
  }
  total_risk = 1 - total_risk

  const prop_mask = number_masks / people_risk_scores.length
  const mask_risk = max(prop_mask * (17.4/3.1), 1)
  total_risk /= mask_risk

  const duration_prop = min(duration / 50, 1)
  total_risk *= duration_prop

  return total_risk
}

function calc_person_risk(last_ride_risk, historical_risk) {
  const risks = historical_risk + [last_ride_risk]

  total_risk = 1
  for (let risk of risks) {
      total_risk *= (1-risk)
  }
  total_risk = 1 - total_risk
}

var database = admin.database();

const server = http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('');
    res.end();
  });
  const wss = new WebSocket.Server({ server });
  server.listen(1319);
  
  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('received: %s', message);
    });
  });

  express()
  .use(express.static(path.join(__dirname, 'build')))
  .use(bodyParser.urlencoded({ extended: false }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  })
  .post('/userGoogleSignIn', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    let profile = req.headers;
    let email = profile.email;
    let name = profile.name;
    let myVal = await database.ref("users").orderByChild('email').equalTo(email).once("value");
    myVal = myVal.val();
    if (!myVal) {
      database.ref("users").push({
        email: email,
        password: "",
        name: name,
        risk: 0.0
      });
    }
    myVal = await database.ref("users").orderByChild('email').equalTo(email).once("value");
    myVal = myVal.val();
    for (key in myVal) {
      userKey = key;
    }
    let returnVal = {
      userkey: userKey,
      name: name,
      email: email,
    }
    res.send(returnVal);
  })
  .post('/setupDevice', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    let rfid = req.headers.rfid;
    let userid = req.headers.userid;
    let returnVal;
    if (!rfid || rfid == "") {
      returnVal = {
        data: "Please enter an RFID access code."
      }
    } else {
      database.ref(`users/${userid}/rfid`).set(rfid);
      returnVal = {
        data: "Success"
      }
    }
    res.send(returnVal);
  })
  
  .post('/newVehicle', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    let type = req.headers.type;
    let startlocation = req.headers.startlocation;
    let destination = req.headers.destination;
    let starttimes = req.headers.starttimes.split(",");
    let endtimes = req.headers.endtimes.split(",");
    let dimensions = req.headers.dimensions
    let risk = 0.0;
    let returnVal;
    if (!type || type == "" || !startlocation || startlocation == "" || !destination || destination == "" || !starttimes || !endtimes || endtimes == "") {
      returnVal = {
        data: "Some fields are empty"
      }
    } else {
      let url = database.ref(`vehicles/${type}`)
      let key = url.push().getKey();
      url.child(key).set({
        startlocation: startlocation,
        destination: destination,
        dimensions: dimensions,
        times: {}
      })
      for (let x = 0; x<starttimes.length; x++) {
        database.ref(`vehicles/${type}/${key}/times`).push({
          starttimes: starttimes[x],
          endtimes: endtimes[x],
          risk: 0.0
        })
      }
      returnVal = {
        data: "Success"
      }
    }
    res.send(returnVal);
  })
  .post('/userSignIn', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    let info = req.headers;
    let email = info.email;
    let password = info.password;
    let returnVal;
    let myVal = await database.ref("users").orderByChild('email').equalTo(email).once("value");
    myVal = myVal.val();
    if (!myVal) {
      returnVal = {
        data: "Incorrect email address."
      }
    } else {
      let inputPassword = password;
      let userPassword;
      for (key in myVal) {
        userPassword = myVal[key].password;
      }
      if (bcrypt.compareSync(inputPassword, userPassword)) {
        for (key in myVal) {
          returnVal = {
            data: key,
            name: myVal[key].name,
            email: email
          }
        }
      } else {
        returnVal = {
          data: "Incorrect Password"
        }
      }
    }
    res.send(returnVal);
  })
  .post('/userSignUp', async function (req, res) {
    let info = req.headers;
    let email = info.email;
    let firstName = info.firstname;
    let lastName = info.lastname;
    let password = info.password;
    let passwordConfirm = info.passwordconfirm;
    let returnVal;
    if (!email) {
      returnVal = {
        data: 'Please enter an email address.'
      };
      res.send(returnVal);
      return;
    }
    let myVal = await database.ref("users").orderByChild('email').equalTo(email).once("value");
    myVal = myVal.val();
    if (myVal) {
      returnVal = {
        data: 'Email already exists.'
      };
    } else if (firstName.length == 0 || lastName.length == 0) {
      returnVal = {
        data: 'Invalid Name'
      };
    } else if (!(/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u.test(firstName) && /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u.test(lastName))) {
      returnVal = {
        data: 'Invalid Name'
      };
    } else if (!(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
      .test(email))) {
      returnVal = {
        data: 'Invalid email address.'
      };
    } else if (password.length < 6) {
      returnVal = {
        data: 'Your password needs to be at least 6 characters.'
      };
    } else if (password != passwordConfirm) {
      returnVal = {
        data: 'Your passwords don\'t match.'
      };
    } else {
      const value = {
        email: email,
        password: hash(password),
        name: `${firstName} ${lastName}`,
      }
      database.ref("users").push(value);
      returnVal = {
        data: key,
        name: `${firstName} ${lastName}`,
        email: email,
        risk: 0.0
      }
    }
    res.send(returnVal);
  })
  .get('/getColor', async function (req, res) {
    console.log("getColor");
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.send({
      color: "yellow}"
    });
  })
  .get('/hardwareConnect', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    let rfid = req.query.rfid;
    let vehicleid = req.query.vehicleid;
    let type = req.query.type;
    let position = req.query.position;
    let timeid = req.query.timeid;
    let userid = "";

    myVal = await database.ref(`users`).once("value");
    myVal = myVal.val();
    for (key in myVal) {
      if (myVal[key].rfid == rfid) {
        userid = key;
      }
    }
  
    myVal = await database.ref(`vehicles/${type}/${vehicleid}/times`).once("value");
    myVal = myVal.val();
    //let datetime = new Date();
    let datetime = 8;
    for (key in myVal) {
      if (Date.parse(datetime) > Date.parse(myVal[key].starttimes) && Date.parse(datetime) < Date.parse(myVal[key].endtimes)) {
        //timeid = key;
      }
    }

    myVal = await database.ref(`rides`).once("value");
    myVal = myVal.val();
    let exist = false;
    for (key in myVal) {
      if (myVal[key].user == userid && myVal[key].timeid == timeid) {
        exist = true;
      }
    }
    if (exist == false) {
      let logPut = {
        user: userid,
        vehicleid: vehicleid,
        timeid: timeid
      }
      let seatingPut = {
        user: userid,
        position: position
      }
      await database.ref(`rides`).push(logPut);
      await database.ref(`vehicles/${type}/${vehicleid}/times/${timeid}/seating`).push(seatingPut);
    }
    res.send("success");

  })
  .post('/fullList', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    let type = req.headers.type;
    let returnList = [];
    myVal = await database.ref(`vehicles/${type}`).once("value");
    myVal = myVal.val();
    for (key in myVal) {
      for (key2 in myVal[key].times) {
        let returnJSON = 
        {
          startlocation: myVal[key].startlocation,
          destination: myVal[key].destination,
          starttimes: myVal[key].times[key2].starttimes,
          endtimes: myVal[key].times[key2].endtimes,
          risk: myVal[key].times[key2].risk,
          dimensions: myVal[key].dimensions,
          hex: getHEX(myVal[key].times[key2].risk),
          vehiclekey: key,
          timekey: key2
        }
        returnList.push(returnJSON);
      }
    }

    let minimumRisk = 1;
    let minimumID = 0;
    for (let x = 0; x<returnList.length; x++) {
      if (returnList[x].risk < minimumRisk) {
        minimumRisk = returnList[x].risk;
        minimumID = x;
      }
    }
    
    let memory = returnList[0];
    returnList[0] = returnList[minimumID];
    for (let x = 1; x<minimumID; x++) {
      let temp = returnList[x];
      returnList[x] = memory;
      memory = temp;
    }
    returnList[minimumID] = memory;
    console.log(returnList);
    res.send({data: returnList});
  })
  .post('/filterList', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    let type = req.headers.type;
    let starttimes = req.headers.starttimes;
    let endtimes = req.headers.endtimes;
    let startlocation = req.headers.startlocation;
    let destination = req.headers.destination;

    let returnList = [];
    myVal = await database.ref(`vehicles/${type}`).once("value");
    myVal = myVal.val();
    for (key in myVal) {
      for (key2 in myVal[key].times) {
        let add = true;
        if (startlocation != null && startlocation != "" && startlocation != "null") {
          if (myVal[key].startlocation != startlocation) {
            add = false;
          }
        }
        if (destination != null && destination != "" && destination != "null") {
          if (myVal[key].destination != destination) {
            add = false;
          }
        }
        if (starttimes != null && starttimes != "" && starttimes != "null") {
          if (Date.parse(myVal[key].times[key2].starttimes) < Date.parse(starttimes)) {
            add = false;
          }
        }
        if (endtimes != null && endtimes != "" && endtimes != "null") {
          if (Date.parse(myVal[key].times[key2].endtimes) > Date.parse(endtimes)) {

            add = false;
          }
        }
        if ((starttimes != null && starttimes != "" && starttimes != "null") && (endtimes != null && endtimes != "") && (starttimes == endtimes)) {
          add = false;
        }
        if (add == true) {
          let returnJSON = 
        {
          startlocation: myVal[key].startlocation,
          destination: myVal[key].destination,
          starttimes: myVal[key].times[key2].starttimes,
          endtimes: myVal[key].times[key2].endtimes,
          risk: myVal[key].times[key2].risk,
          hex: getHEX(myVal[key].times[key2].risk),
          vehiclekey: key,
          timekey: key2
        }
        returnList.push(returnJSON);
        }
      }
    }
     
    let minimumRisk = 1;
    let minimumID = 0;
    for (let x = 0; x<returnList.length; x++) {
      if (returnList[x].risk < minimumRisk) {
        minimumRisk = returnList[x].risk;
        minimumID = x;
      }
    }
    
    let memory = returnList[0];
    returnList[0] = returnList[minimumID];
    for (let x = 1; x<minimumID; x++) {
      let temp = returnList[x];
      returnList[x] = memory;
      memory = temp;
    }
    returnList[minimumID] = memory;

    res.send({data: returnList});
  })
  .post("/getSeating", async function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    let vehiclekey = req.headers.vehiclekey;
    let timekey = req.headers.timekey;
    let type = req.headers.type;
    let fullArray = [];
    let returnArray = [];

    let dimensions = await database.ref(`vehicles/${type}/${vehiclekey}`).once("value");
    dimensions = dimensions.val();
    dimensions = dimensions.dimensions;

    myVal = await database.ref(`vehicles/${type}/${vehiclekey}/times/${timekey}/seating`).once("value");
    myVal = myVal.val();
    for (key in myVal) {
      userId = myVal[key].user;
      position = myVal[key].position;
      myVal2 = await database.ref(`users/${userId}`).once("value");
      myVal2 = myVal2.val();
      let risk = myVal2.risk;
      let toPut = 
      {
        risk: risk,
        position: position,
        hex: getHEX(risk)
      }
      fullArray.push(toPut);
    }

    let xNum = dimensions.split(",")[0];
    let yNum = dimensions.split(",")[1];

    for (let y = 0; y<yNum; y++) {
      for (let x = 0; x<xNum; x++) {
        let done = false;
        for (let z = 0; z<fullArray.length; z++) {
          if (fullArray[z].position == `${x},${y}`) {
            let toPut = 
            {
              risk: fullArray[z].risk,
              position: fullArray[z].position,
              hex: getHEX(fullArray[z].risk)
            }
            returnArray.push(toPut);
            done = true;
          }
        }
        if (done == false) {
          let toPut = 
            {
              risk: 0,
              position: `${x},${y}`,
              hex: "808080"
            }
            returnArray.push(toPut);
        }
      }
    }
    let lowestScore = 0;
    let bestPosition = "0,0"

    for (let x = 0; x<returnArray.length; x++) {
      score = 0;
      if (returnArray[x].hex == "808080") {
        for (let z = 0; z<fullArray.length; z++) {
          distance = getDistance(returnArray[x], fullArray[z]);
          score += distance * (1-fullArray[z].risk);
        }
        if (score > lowestScore) {
          lowestScore = score;
          bestPosition = returnArray[x].position;
        }
      }
    }
    
    let editPosition = (parseInt(bestPosition.split(",")[1]) * parseInt(dimensions.split(",")[0]) + parseInt(bestPosition.split(",")[0]));
    returnArray[editPosition].hex = "0000ff";
    res.send({data: returnArray, dimensions: dimensions, best: bestPosition})
  })
  .post('/maskDetection', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    let type = req.headers.type;
    let masks = req.headers.masks;
    let nomasks = req.headers.nomasks;
    let datetime = req.headers.time;
    let vehicleid = req.headers.vehicleid;
    let timeid = req.headers.timeid

    await database.ref(`vehicles/${type}/${vehicleid}/times/${timeid}/masks`).set(masks);
    await database.ref(`vehicles/${type}/${vehicleid}/times/${timeid}/nomasks`).set(nomasks);
    res.send("success")
  })
  .post("/coughIncrement", async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    let type = req.headers.type;
    let datetime = req.headers.time;
    let vehicleid = req.headers.vehicleid;
    let timeid = req.headers.timeid

    const val = await database.ref(`vehicles/${type}/${vehicleid}/times/${timeid}`).once("value")
    if (typeof val.val().coughs !== "number") {
      await database.ref(`vehicles/${type}/${vehicleid}/times/${timeid}/coughs`).set(1)
    } else {
      await database.ref(`vehicles/${type}/${vehicleid}/times/${timeid}/coughs`).set(1+val.val().coughs)
    }
    res.send("success")
  })
  .post("/rideFinished", async function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    const vehicleid = req.headers.vehicleid;
    const type = req.headers.type;
    const datetime = req.headers.datetime;
    const datetimeid = req.headers.datetimeid; 
    //duration, 
    let number_masks = 0;
    let people_risk_scores = []
    var last_ride_risk = 0;
    let historical_risk = []
    let duration = 0;
    let myVal = await database.ref(`vehicles/${type}/${vehicleid}/times/${datetimeid}`).once("value");
    myVal = myVal.val(); 
    
    masks = myVal.masks
    last_ride_risk = myVal.risk

    let seating = myVal.seating
    for (key in seating) {
      let user = seating[key].user 
      
      let myVal2 = await database.ref(`users/${user}`).once('value')
      myVal2 = myVal2.val();
      
      let score = myVal2.risk;
      people_risk_scores.push(score);
      
      let myVal3 = await database.ref('rides').orderByChild('user').equalTo(user).once('value').then(function(snapshot) {
        if (snapshot.exists()) {
          snapshot.forEach(async function(childSnapshot) {
            let vehicleid = childSnapshot.val().vehicleid 
            let type = childSnapshot.val().type
            let myVal4 = await database.ref(`vehicles/${type}/${vehicleid}`).once('value')
            myVal4 = myVal4.val();
            for (keys in myVal4) {
              console.log(myVal4[keys])
            }
          })
        } else {
          console.log('User doesn\'t exist')
        }
      })
    }

    console.log(last_ride_risk)

    // let myVal2 = await database.ref(`vehicles/${type}/${vehicleid}/times`).once('value', snapshot => {
    //   snapshot.forEach(function (childSnapshot) {
    //     let child = childSnapshot.val().seating 
    //     for (key in child) {
    //       console.log(child[key].user)
    //     }
    //   })
    // })
    
    res.send(people_risk_scores)
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

  function hash(value) {
    let salt = bcrypt.genSaltSync(10);
    let hashVal = bcrypt.hashSync(value, salt);
    return hashVal;
  }
  
  function parseEnvList(env) {
    if (!env) {
      return [];
    }
    return env.split(',');
  }

  function getHEX(risk) {
    color = "";
    if (risk <= 0.2) {
      color = "1cf000";
    } else if (risk <= 0.4) {
      color = "d4f000";
    } else if (risk <= 0.6) {
      color = "f0c000";
    } else if (risk <= 0.8) {
      color = "f07800";
    } else {
      color = "f01c00";
    }
    return color;
  }

  function getDistance(object1, object2) {
    let x1 = parseInt(object1.position.split(",")[0]);
    let x2 = parseInt(object2.position.split(",")[0]);
    let y1 = parseInt(object1.position.split(",")[1]);
    let y2 = parseInt(object2.position.split(",")[1]);
    let distance = Math.sqrt((x2-x1) ** 2 + (y2-y1) ** 2);
    return distance;
  }
  
  var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
  var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
  
  // Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
  var checkRateLimit = require('./lib/rate-limit')(process.env.CORSANYWHERE_RATELIMIT);
  
  var cors_proxy = require('./lib/cors-anywhere');
  cors_proxy.createServer({
    originBlacklist: originBlacklist,
    originWhitelist: originWhitelist,
    requireHeader: ['origin', 'x-requested-with'],
    checkRateLimit: checkRateLimit,
    removeHeaders: [
      'cookie',
      'cookie2',
      // Strip Heroku-specific headers
      'x-heroku-queue-wait-time',
      'x-heroku-queue-depth',
      'x-heroku-dynos-in-use',
      'x-request-start',
    ],
    redirectSameOrigin: true,
    httpProxyOptions: {
      // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
      xfwd: false,
    },
  })
    .listen(4911, () => console.log(`Listening on ${4911}`));