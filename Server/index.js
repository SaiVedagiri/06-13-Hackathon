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
  .use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser.urlencoded({ extended: false }))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
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
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`connect${rfid}`);
      }
    });
    if (unlock) {
      res.send('y');
      let myVal = await database.ref('users').orderByChild('rfid').equalTo(rfid).once('value');
      myVal = myVal.val()
      let key;
      for (key in myVal) {
        let myVal2 = await database.ref('queue').orderByChild('user').equalTo(key).once('value');
        myVal2 = myVal2.val()
        if (myVal2) {
          for (key1 in myVal2) {
            let position = myVal2[key1].position
            let myVal3 = await database.ref('queue').once('value');
            myVal3 = myVal3.val()
            for (key2 in myVal3) {
              let num = myVal3.numOfPeople;
              console.log(myVal3[key2].position);
              console.log(position);
              if (myVal3[key2].position > position) {
                console.log("here");
                console.log(key2);
                database.ref(`queue/${key2}`).update({
                  position: myVal3[key2].position - 1
                })
                database.ref(`queue/${key1}`).remove();
                database.ref('queue').update({
                  numOfPeople: num - 1
                })
              } else {
                database.ref(`queue/${key1}`).remove()
                database.ref('queue').update({
                  numOfPeople: num - 1
                })
              }
            }
          }
        }
        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth();
        let day = date.getDate();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let currentDate = `${year}-${month}-${day} ${hour}:${minute}`
        database.ref('inStore').push({
          time: currentDate,
          user: key
        })
      }
    } else {
      res.send('n');
    }
    unlock = false;
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
          hex: getHEX(myVal[key].times[key2].risk)
        }
        returnList.push(returnJSON);
      }
    }
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
        if (myVal[key].startlocation == null || myVal[key].startlocation == "" || myVal[key].startlocation != startlocation) {
          add = false;
        }
        if (myVal[key].destination == null || myVal[key].destination == "" || myVal[key].destination != destination) {
          add = false;
        }
        if (myVal[key].times[key2].starttimes == null || myVal[key].times[key2].starttimes == "" || Date.parse(myVal[key].times[key2].starttimes) < Date.parse(starttimes)) {
          add = false;
        }
        if (myVal[key].times[key2].endtimes == null || myVal[key].times[key2].endtimes == "" || Date.parse(myVal[key].times[key2].endtimes) > Date.parse(endtimes)) {
          add = false;
        }
        if (myVal[key].times[key2].starttimes == myVal[key].times[key2].endtimes) {
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
          hex: getHEX(myVal[key].times[key2].risk)
        }
        returnList.push(returnJSON);
        }
      }
    }
    res.send({data: returnList});
  })
  .post('/maskDetection', async function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'https://safetravels.macrotechsolutions.us');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    let type = req.headers.type;
    let masks = req.headers.masks;
    let nomasks = req.headers.nomasks;
    let time = req.headers.time;
    let busid = req.headers.busid;

    myVal = await database.ref(`vehicles/${type}/${busid}`).set("value");
    myVal = myVal.val();
    for (key in myVal) {
      let newList = [];
      let add = false;
      
      if  (Date.parse(starttimes) > Date.parse(myVal[key].starttimes) && Date.parse(endtimes) > Date.parse(myVal[key].endtimes) && destination == myVal[key].destination && startlocation == myVal[key].startlocation) {
        add = true;
      }
      if (add == true) {
        newList.append(myVal[key].starttimes);
        newList.append(myVal[key].endtimes);
        newList.append(myVal[key].startlocation);
        newList.append(myVal[key].destination);
        newList.append(myVal[key].risk);
        returnList.push(newList)
      }
    }
    res.send(returnList);
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