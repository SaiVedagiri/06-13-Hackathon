import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter_webview_plugin/flutter_webview_plugin.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart';
import 'dart:async';
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:web_socket_channel/io.dart';
import 'package:datetime_picker_formfield/datetime_picker_formfield.dart';
import 'package:intl/intl.dart';
import 'package:percent_indicator/percent_indicator.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

String userID = "";
String username = "";
String password = "";
String firstName = "";
String lastName = "";
String confirmPassword = "";
String rfidNum = "";
String origin = "";
String destination = "";
var setupJSON;
var userJSON;
var dateTimeString1;
var dateTimeString2;
var scheduledTime1;
var scheduledTime2;
var displayList = [];

void main() {
  runApp(MyApp());
}

class HexColor extends Color {
  static int _getColorFromHex(String hexColor) {
    hexColor = hexColor.toUpperCase().replaceAll("#", "");
    if (hexColor.length == 6) {
      hexColor = "FF" + hexColor;
    }
    return int.parse(hexColor, radix: 16);
  }

  HexColor(final String hexColor) : super(_getColorFromHex(hexColor));
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SafeTravels',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      routes: {
        "/": (_) => MyHomePage(title: 'SafeTravels'),
        "/setup": (_) => SetupPage(),
        "/bus": (_) => BusPage(),
        "/train": (_) => TrainPage(),
        "/plane": (_) => PlanePage(),
        "/settings": (_) => SettingsPage(),
      },
    );
  }
}

class MyHomePage extends StatefulWidget {
  MyHomePage({Key key, this.title}) : super(key: key);

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  _MyHomePageState createState() => _MyHomePageState();
}

GoogleSignIn googleSignIn = GoogleSignIn(
  scopes: ['email', 'profile'],
);

class _MyHomePageState extends State<MyHomePage> {
  @override
  initState() {
    super.initState();
    initStateFunction();
  }

  initStateFunction() async {
    var prefs = await SharedPreferences.getInstance();
    userID = prefs.getString('userID');
    rfidNum = prefs.getString('rfid');
    if (userID != "" && userID != null) {
      userJSON = json.decode(prefs.getString('userJSON'));
      if (rfidNum != "" && rfidNum != null) {
        Navigator.pushReplacementNamed(context, "/bus");
      } else {
        Navigator.pushReplacementNamed(context, "/setup");
      }
    }
  }

  Future<String> helpContext(BuildContext context, String title, Widget body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: body,
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: <Widget>[
          IconButton(
              icon: Icon(Icons.help),
              onPressed: () async {
                helpContext(
                    context,
                    "Help",
                    Text.rich(
                      TextSpan(
                        children: <TextSpan>[
                          TextSpan(
                            text: 'Login\n',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text:
                            'Use this feature to log in to an existing account.\n',
                            style: TextStyle(fontSize: 20),
                          ),
                          TextSpan(
                            text: '\nSign Up\n',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text: 'Use this feature to create a new account.\n',
                            style: TextStyle(fontSize: 20),
                          ),
                        ],
                      ),
                    ));
              })
        ],
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its
          // children horizontally, and tries to be as tall as its parent.
          //
          // Invoke "debug painting" (press "p" in the console, choose the
          // "Toggle Debug Paint" action from the Flutter Inspector in Android
          // Studio, or the "Toggle Debug Paint" command in Visual Studio Code)
          // to see the wireframe for each widget.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.all(30.0),
              child: ClipRRect(
                  borderRadius: BorderRadius.circular(30),
                  child: Image(
                    image: AssetImage('assets/logo.png'),
                    height: 150,
                  )),
            ),
            ListTile(
              title: RaisedButton(
                color: HexColor("00b2d1"),
                onPressed: () {
                  dispose() {
                    SystemChrome.setPreferredOrientations([
                      DeviceOrientation.landscapeRight,
                      DeviceOrientation.landscapeLeft,
                      DeviceOrientation.portraitUp,
                      DeviceOrientation.portraitDown,
                    ]);
                    super.dispose();
                  }

                  Navigator.push(
                      context,
                      new MaterialPageRoute(
                          builder: (context) => new SignInPage()));
                },
                child: Text("Login"),
              ),
            ),
            ListTile(
                title: RaisedButton(
                    color: HexColor("ff5ded"),
                    onPressed: () {
                      dispose() {
                        SystemChrome.setPreferredOrientations([
                          DeviceOrientation.landscapeRight,
                          DeviceOrientation.landscapeLeft,
                          DeviceOrientation.portraitUp,
                          DeviceOrientation.portraitDown,
                        ]);
                        super.dispose();
                      }

                      Navigator.push(
                          context,
                          new MaterialPageRoute(
                              builder: (context) => new SignUpPage()));
                    },
                    child: Text("Sign Up"))),
          ],
        ),
      ),
    );
  }
}

class SignInPage extends StatefulWidget {
  SignInPage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _SignInPageState createState() => _SignInPageState();
}

class _SignInPageState extends State<SignInPage> {
  Future<String> createAlertDialog(BuildContext context, String title,
      String body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: Text(body),
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  Future<String> helpContext(BuildContext context, String title, Widget body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: body,
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    googleSignIn.signOut();
    return Scaffold(
      appBar: AppBar(
        title: Text("Login"),
        actions: <Widget>[
          IconButton(
              icon: Icon(Icons.help),
              onPressed: () async {
                helpContext(
                    context,
                    "Help",
                    Text.rich(
                      TextSpan(
                        children: <TextSpan>[
                          TextSpan(
                            text: 'Login\n',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text: 'Sign in to an existing account.\n',
                            style: TextStyle(fontSize: 20),
                          ),
                        ],
                      ),
                    ));
              })
        ],
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its
          // children horizontally, and tries to be as tall as its parent.
          //
          // Invoke "debug painting" (press "p" in the console, choose the
          // "Toggle Debug Paint" action from the Flutter Inspector in Android
          // Studio, or the "Toggle Debug Paint" command in Visual Studio Code)
          // to see the wireframe for each widget.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: TextField(
                decoration: InputDecoration(hintText: "Email Address"),
                onChanged: (String str) {
                  setState(() {
                    username = str;
                  });
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: TextField(
                decoration: InputDecoration(hintText: "Password"),
                obscureText: true,
                onChanged: (String str) {
                  setState(() {
                    password = str;
                  });
                },
              ),
            ),
            ListTile(
                title: RaisedButton(
                    onPressed: () async {
                      Map<String, String> headers = {
                        "Content-type": "application/json",
                        "Origin": "*",
                        "email": username,
                        "password": password
                      };
                      Response response = await post(
                          'https://safetravels.macrotechsolutions.us:9146/http://localhost/userSignIn',
                          headers: headers);
                      //createAlertDialog(context);
                      userJSON = jsonDecode(response.body);
                      if (userJSON["data"] != "Incorrect email address." &&
                          userJSON["data"] != "Incorrect Password") {
                        userID = userJSON["data"];
                        var prefs = await SharedPreferences.getInstance();
                        prefs.setString('userID', userID);
                        prefs.setString('userJSON', response.body);
                        dispose() {
                          SystemChrome.setPreferredOrientations([
                            DeviceOrientation.landscapeRight,
                            DeviceOrientation.landscapeLeft,
                            DeviceOrientation.portraitUp,
                            DeviceOrientation.portraitDown,
                          ]);
                          super.dispose();
                        }

                        Navigator.pushReplacementNamed(context, "/setup");
                      } else {
                        createAlertDialog(context, "Error", userJSON["data"]);
                      }
                    },
                    child: Text("Submit"))),
            Padding(
              padding: const EdgeInsets.only(top: 30.0),
              child: Text(
                "OR",
                style: TextStyle(
                  fontSize: 20.0,
                ),
              ),
            ),
            SizedBox(height: 50),
            RaisedButton(
              onPressed: () async {
                final GoogleSignInAccount googleSignInAccount =
                await googleSignIn.signIn();
                Map<String, String> headers = {
                  "Content-type": "application/json",
                  "Origin": "*",
                  "email": googleSignInAccount.email,
                  "name": googleSignInAccount.displayName
                };
                Response response = await post(
                    'https://safetravels.macrotechsolutions.us:9146/http://localhost/userGoogleSignIn',
                    headers: headers);
                //createAlertDialog(context);
                userJSON = jsonDecode(response.body);
                userID = userJSON["userkey"];
                var prefs = await SharedPreferences.getInstance();
                prefs.setString('userID', userID);
                prefs.setString('userJSON', response.body);
                dispose() {
                  SystemChrome.setPreferredOrientations([
                    DeviceOrientation.landscapeRight,
                    DeviceOrientation.landscapeLeft,
                    DeviceOrientation.portraitUp,
                    DeviceOrientation.portraitDown,
                  ]);
                  super.dispose();
                }

                Navigator.pushReplacementNamed(context, "/setup");
              },
              child: Padding(
                padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Image(
                        image: AssetImage("assets/google_logo.png"),
                        height: 35.0),
                    Padding(
                      padding: const EdgeInsets.only(left: 10),
                      child: Text(
                        'Sign in with Google',
                        style: TextStyle(
                          fontSize: 20,
                          color: Colors.black,
                        ),
                      ),
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SignUpPage extends StatefulWidget {
  SignUpPage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _SignUpPageState createState() => _SignUpPageState();
}

class _SignUpPageState extends State<SignUpPage> {
  Future<String> createAlertDialog(BuildContext context, String title,
      String body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: Text(body),
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  Future<String> helpContext(BuildContext context, String title, Widget body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: body,
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    googleSignIn.signOut();
    return Scaffold(
      appBar: AppBar(
        title: Text("Sign Up"),
        actions: <Widget>[
          IconButton(
              icon: Icon(Icons.help),
              onPressed: () async {
                helpContext(
                    context,
                    "Help",
                    Text.rich(
                      TextSpan(
                        children: <TextSpan>[
                          TextSpan(
                            text: 'Sign Up\n',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text: 'Create a new account.\n',
                            style: TextStyle(fontSize: 20),
                          ),
                        ],
                      ),
                    ));
              })
        ],
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          // Column is also a layout widget. It takes a list of children and
          // arranges them vertically. By default, it sizes itself to fit its
          // children horizontally, and tries to be as tall as its parent.
          //
          // Invoke "debug painting" (press "p" in the console, choose the
          // "Toggle Debug Paint" action from the Flutter Inspector in Android
          // Studio, or the "Toggle Debug Paint" command in Visual Studio Code)
          // to see the wireframe for each widget.
          //
          // Column has various properties to control how it sizes itself and
          // how it positions its children. Here we use mainAxisAlignment to
          // center the children vertically; the main axis here is the vertical
          // axis because Columns are vertical (the cross axis would be
          // horizontal).
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: TextField(
                decoration: InputDecoration(hintText: "First Name"),
                onChanged: (String str) {
                  setState(() {
                    firstName = str;
                  });
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: TextField(
                decoration: InputDecoration(hintText: "Last Name"),
                onChanged: (String str) {
                  setState(() {
                    lastName = str;
                  });
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: TextField(
                decoration: InputDecoration(hintText: "Email Address"),
                onChanged: (String str) {
                  setState(() {
                    username = str;
                  });
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: TextField(
                decoration: InputDecoration(hintText: "Password"),
                obscureText: true,
                onChanged: (String str) {
                  setState(() {
                    password = str;
                  });
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: TextField(
                decoration: InputDecoration(hintText: "Confirm Password"),
                obscureText: true,
                onChanged: (String str) {
                  setState(() {
                    confirmPassword = str;
                  });
                },
              ),
            ),
            ListTile(
                title: RaisedButton(
                    onPressed: () async {
                      Map<String, String> headers = {
                        "Content-type": "application/json",
                        "Origin": "*",
                        "firstname": firstName,
                        "lastname": lastName,
                        "email": username,
                        "password": password,
                        "passwordconfirm": confirmPassword
                      };
                      Response response = await post(
                          'https://safetravels.macrotechsolutions.us:9146/http://localhost/userSignUp',
                          headers: headers);
                      //createAlertDialog(context);
                      userJSON = jsonDecode(response.body);
                      if (userJSON["data"] != 'Email already exists.' &&
                          userJSON["data"] != 'Invalid Name' &&
                          userJSON["data"] != 'Invalid email address.' &&
                          userJSON["data"] !=
                              'Your password needs to be at least 6 characters.' &&
                          userJSON["data"] != 'Your passwords don\'t match.') {
                        userID = userJSON["userkey"];
                        var prefs = await SharedPreferences.getInstance();
                        prefs.setString('userID', userID);
                        prefs.setString('userJSON', response.body);
                        dispose() {
                          SystemChrome.setPreferredOrientations([
                            DeviceOrientation.landscapeRight,
                            DeviceOrientation.landscapeLeft,
                            DeviceOrientation.portraitUp,
                            DeviceOrientation.portraitDown,
                          ]);
                          super.dispose();
                        }

                        Navigator.pushReplacementNamed(context, "/setup");
                      } else {
                        createAlertDialog(context, "Error", userJSON["data"]);
                      }
                    },
                    child: Text("Submit"))),
            Padding(
              padding: const EdgeInsets.only(top: 30.0),
              child: Text(
                "OR",
                style: TextStyle(
                  fontSize: 20.0,
                ),
              ),
            ),
            SizedBox(height: 50),
            RaisedButton(
              onPressed: () async {
                final GoogleSignInAccount googleSignInAccount =
                await googleSignIn.signIn();
                Map<String, String> headers = {
                  "Content-type": "application/json",
                  "Origin": "*",
                  "email": googleSignInAccount.email,
                  "name": googleSignInAccount.displayName
                };
                Response response = await post(
                    'https://safetravels.macrotechsolutions.us:9146/http://localhost/userGoogleSignIn',
                    headers: headers);
                //createAlertDialog(context);
                userJSON = jsonDecode(response.body);
                userID = userJSON["userkey"];
                var prefs = await SharedPreferences.getInstance();
                prefs.setString('userID', userID);
                prefs.setString('userJSON', response.body);
                dispose() {
                  SystemChrome.setPreferredOrientations([
                    DeviceOrientation.landscapeRight,
                    DeviceOrientation.landscapeLeft,
                    DeviceOrientation.portraitUp,
                    DeviceOrientation.portraitDown,
                  ]);
                  super.dispose();
                }

                Navigator.pushReplacementNamed(context, "/setup");
              },
              child: Padding(
                padding: const EdgeInsets.fromLTRB(0, 10, 0, 10),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: <Widget>[
                    Image(
                        image: AssetImage("assets/google_logo.png"),
                        height: 35.0),
                    Padding(
                      padding: const EdgeInsets.only(left: 10),
                      child: Text(
                        'Sign in with Google',
                        style: TextStyle(
                          fontSize: 20,
                          color: Colors.black,
                        ),
                      ),
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class SetupPage extends StatefulWidget {
  SetupPage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _SetupPageState createState() => _SetupPageState();
}

class _SetupPageState extends State<SetupPage> {
  Future<String> createAlertDialog(BuildContext context, String title,
      String body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: Text(body),
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  Future<String> helpContext(BuildContext context, String title, Widget body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: body,
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    return Scaffold(
      appBar: AppBar(
        title: Text("Setup the App"),
        actions: <Widget>[
          IconButton(
              icon: Icon(Icons.help),
              onPressed: () async {
                helpContext(
                    context,
                    "Help",
                    Text.rich(
                      TextSpan(
                        children: <TextSpan>[
                          TextSpan(
                            text: 'Setup\n',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text:
                            'This screen will allow you to enter the hardware information necessary to communicate with the app.\n',
                            style: TextStyle(fontSize: 20),
                          ),
                        ],
                      ),
                    ));
              })
        ],
      ),
      body: Center(
        // Center is a layout widget. It takes a single child and positions it
        // in the middle of the parent.
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.only(left: 30.0, right: 30.0),
              child: TextField(
                decoration: InputDecoration(hintText: "RFID Access Code"),
                keyboardType: TextInputType.number,
                onChanged: (String str) {
                  setState(() {
                    rfidNum = str;
                  });
                },
              ),
            ),
            ListTile(
                title: RaisedButton(
                    onPressed: () async {
                      print(userID);
                      print(rfidNum);
                      Map<String, String> headers = {
                        "Content-type": "application/json",
                        "Origin": "*",
                        "userid": userID,
                        "rfid": rfidNum
                      };
                      Response response = await post(
                          'https://safetravels.macrotechsolutions.us:9146/http://localhost/setupDevice',
                          headers: headers);
                      //createAlertDialog(context);
                      setupJSON = jsonDecode(response.body);
                      if (setupJSON["data"] == "Success") {
                        var prefs = await SharedPreferences.getInstance();
                        prefs.setString('rfid', rfidNum);
                        dispose() {
                          SystemChrome.setPreferredOrientations([
                            DeviceOrientation.landscapeRight,
                            DeviceOrientation.landscapeLeft,
                            DeviceOrientation.portraitUp,
                            DeviceOrientation.portraitDown,
                          ]);
                          super.dispose();
                        }

                        Navigator.pushReplacementNamed(context, "/bus");
                      } else {
                        createAlertDialog(context, "Error", setupJSON["data"]);
                      }
                    },
                    child: Text("Submit"))),
          ],
        ),
      ),
    );
  }
}

class BusPage extends StatefulWidget {
  BusPage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _BusPageState createState() => _BusPageState();
}

class _BusPageState extends State<BusPage> {
  @override
  initState() {
    super.initState();
    initStateFunction();
  }

  initStateFunction() async {
    Map<String, String> headers = {
      "Content-type": "application/json",
      "Origin": "*",
      "type": "bus",
    };
    Response response = await post(
        'https://safetravels.macrotechsolutions.us:9146/http://localhost/fullList',
        headers: headers);
    //createAlertDialog(context);
    var tempJson = jsonDecode(response.body);
    setState(() {
      displayList = tempJson["data"];
    });
  }

  Future<String> createAlertDialog(BuildContext context, String title,
      String body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: Text(body),
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  Future<String> helpContext(BuildContext context, String title, Widget body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: body,
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    return Scaffold(
      appBar: AppBar(
        title: Text("SafeTravels Bus"),
        actions: <Widget>[
          IconButton(
              icon: Icon(Icons.filter_list),
              onPressed: () async {
                showDialog(
                    context: context,
                    builder: (context) {
                      return AlertDialog(
                          title: Text("Filter"),
                          content: Column(
                              mainAxisAlignment: MainAxisAlignment.start,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisSize: MainAxisSize.min,
                              children: <Widget>[
                                Padding(
                                  padding: const EdgeInsets.only(top: 20.0),
                                ),
                                Text("Start Time: "),
                                DateTimeField(
                                  format:
                                  DateFormat('EEEE, MMMM dd, y @ HH:mm '),
                                  onShowPicker: (context, currentValue) async {
                                    DateTime now = DateTime.now();
                                    String year =
                                    DateFormat('yyyy').format(now);
                                    final date = await showDatePicker(
                                        context: context,
                                        firstDate: DateTime(int.parse(year)),
                                        initialDate:
                                        currentValue ?? DateTime.now(),
                                        lastDate:
                                        DateTime(int.parse(year) + 10));
                                    if (date != null) {
                                      final time = await showTimePicker(
                                        context: context,
                                        initialTime: TimeOfDay.fromDateTime(
                                            currentValue ?? DateTime.now()),
                                      );
                                      dateTimeString1 = DateFormat(
                                          "yyyy-MM-dd HH:mm")
                                          .format(
                                          DateTimeField.combine(date, time))
                                          .toString();
                                      setState(() {
                                        scheduledTime1 =
                                            DateTimeField.combine(date, time)
                                                .toString();
                                      });
                                      return DateTimeField.combine(date, time);
                                    } else {
                                      return currentValue;
                                    }
                                  },
                                  initialValue: DateTime.now(),
                                ),
                                Padding(
                                  padding: const EdgeInsets.only(top: 20.0),
                                ),
                                Text("End Time: "),
                                DateTimeField(
                                  format:
                                  DateFormat('EEEE, MMMM dd, y @ HH:mm '),
                                  onShowPicker: (context, currentValue) async {
                                    DateTime now = DateTime.now();
                                    String year =
                                    DateFormat('yyyy').format(now);
                                    final date = await showDatePicker(
                                        context: context,
                                        firstDate: DateTime(int.parse(year)),
                                        initialDate:
                                        currentValue ?? DateTime.now(),
                                        lastDate:
                                        DateTime(int.parse(year) + 10));
                                    if (date != null) {
                                      final time = await showTimePicker(
                                        context: context,
                                        initialTime: TimeOfDay.fromDateTime(
                                            currentValue ?? DateTime.now()),
                                      );
                                      dateTimeString2 = DateFormat(
                                          "yyyy-MM-dd HH:mm")
                                          .format(
                                          DateTimeField.combine(date, time))
                                          .toString();
                                      setState(() {
                                        scheduledTime2 =
                                            DateTimeField.combine(date, time)
                                                .toString();
                                      });
                                      return DateTimeField.combine(date, time);
                                    } else {
                                      return currentValue;
                                    }
                                  },
                                  initialValue: DateTime.now(),
                                ),
                                Padding(
                                  padding: const EdgeInsets.only(top: 20.0),
                                ),
                                TextField(
                                  decoration: InputDecoration(
                                      labelText: 'Origin', hintText: "Origin"),
                                  onChanged: (String str) {
                                    setState(() {
                                      origin = str;
                                    });
                                  },
                                ),
                                Padding(
                                  padding: const EdgeInsets.only(top: 20.0),
                                ),
                                TextField(
                                  decoration: InputDecoration(
                                      labelText: 'Destination',
                                      hintText: "Destination"),
                                  onChanged: (String str) {
                                    setState(() {
                                      destination = str;
                                    });
                                  },
                                ),
                              ]),
                          actions: <Widget>[
                            MaterialButton(
                              elevation: 5.0,
                              onPressed: () async {
                                Map<String, String> headers = {
                                  "Content-type": "application/json",
                                  "Origin": "*",
                                  "type": "bus",
                                  "starttimes": dateTimeString1,
                                  "endtimes": dateTimeString2,
                                  "startlocation": origin,
                                  "destination": destination,
                                };
                                Response response = await post(
                                    'https://safetravels.macrotechsolutions.us:9146/http://localhost/filterList',
                                    headers: headers);
                                //createAlertDialog(context);
                                var tempJson = jsonDecode(response.body);
                                setState(() {
                                  displayList = tempJson["data"];
                                });
                                Navigator.of(context).pop();
                              },
                              child: Text("OK"),
                            )
                          ]);
                    });
              }),
          IconButton(
              icon: Icon(Icons.help),
              onPressed: () async {
                helpContext(
                    context,
                    "Help",
                    Text.rich(
                      TextSpan(
                        children: <TextSpan>[
                          TextSpan(
                            text: 'SafeTravels Bus\n',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text:
                            'This screen will allow you to view bus status.\n',
                            style: TextStyle(fontSize: 20),
                          ),
                        ],
                      ),
                    ));
              }),
        ],
      ),
      bottomNavigationBar: BottomAppBar(
        child: new Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: <Widget>[
            IconButton(
              icon: Icon(Icons.airport_shuttle),
              onPressed: () {},
            ),
            IconButton(
              icon: Icon(Icons.train),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/train");
              },
            ),
            IconButton(
              icon: Icon(Icons.airplanemode_active),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/plane");
              },
            ),
            IconButton(
              icon: Icon(Icons.settings),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/settings");
              },
            ),
          ],
        ),
      ),
      body: ListView.builder(
          itemCount: displayList.length == null ? 1 : displayList.length,
          itemBuilder: (context, index) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 1.0, horizontal: 4.0),
              child: Card(
                child: ListTile(
                  onTap: (){
                  },
                  leading: CircleAvatar(backgroundImage: AssetImage('assets/bus_icon.jpg'),),
                    title: Text("${displayList[index]["startlocation"]} to ${displayList[index]["destination"]}"),
                  subtitle: Text("${displayList[index]["starttimes"]} to ${displayList[index]["endtimes"]}"),
                  trailing: CircleAvatar(backgroundColor: HexColor(displayList[index]["hex"]),),
                ),
              )
            );
          }
      ),
    );
  }
}

class TrainPage extends StatefulWidget {
  TrainPage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _TrainPageState createState() => _TrainPageState();
}

class _TrainPageState extends State<TrainPage> {
  Future<String> createAlertDialog(BuildContext context, String title,
      String body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: Text(body),
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  Future<String> helpContext(BuildContext context, String title, Widget body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: body,
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    return Scaffold(
      appBar: AppBar(
        title: Text("SafeTravels Train"),
        actions: <Widget>[
          IconButton(
              icon: Icon(Icons.help),
              onPressed: () async {
                helpContext(
                    context,
                    "Help",
                    Text.rich(
                      TextSpan(
                        children: <TextSpan>[
                          TextSpan(
                            text: 'SafeTravels Train\n',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text:
                            'This screen will allow you to view train status.\n',
                            style: TextStyle(fontSize: 20),
                          ),
                        ],
                      ),
                    ));
              })
        ],
      ),
      bottomNavigationBar: BottomAppBar(
        child: new Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: <Widget>[
            IconButton(
              icon: Icon(Icons.airport_shuttle),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/bus");
              },
            ),
            IconButton(
              icon: Icon(Icons.train),
              onPressed: () {},
            ),
            IconButton(
              icon: Icon(Icons.airplanemode_active),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/plane");
              },
            ),
            IconButton(
              icon: Icon(Icons.settings),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/settings");
              },
            ),
          ],
        ),
      ),
      body: ListView(
        children: <Widget>[],
      ),
    );
  }
}

class PlanePage extends StatefulWidget {
  PlanePage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _PlanePageState createState() => _PlanePageState();
}

class _PlanePageState extends State<PlanePage> {
  Future<String> createAlertDialog(BuildContext context, String title,
      String body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: Text(body),
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  Future<String> helpContext(BuildContext context, String title, Widget body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: body,
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    return Scaffold(
      appBar: AppBar(
        title: Text("SafeTravels Plane"),
        actions: <Widget>[
          IconButton(
              icon: Icon(Icons.help),
              onPressed: () async {
                helpContext(
                    context,
                    "Help",
                    Text.rich(
                      TextSpan(
                        children: <TextSpan>[
                          TextSpan(
                            text: 'SafeTravels Plane\n',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text:
                            'This screen will allow you to view plane status.\n',
                            style: TextStyle(fontSize: 20),
                          ),
                        ],
                      ),
                    ));
              })
        ],
      ),
      bottomNavigationBar: BottomAppBar(
        child: new Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: <Widget>[
            IconButton(
              icon: Icon(Icons.airport_shuttle),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/bus");
              },
            ),
            IconButton(
              icon: Icon(Icons.train),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/train");
              },
            ),
            IconButton(
              icon: Icon(Icons.airplanemode_active),
              onPressed: () {},
            ),
            IconButton(
              icon: Icon(Icons.settings),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/settings");
              },
            ),
          ],
        ),
      ),
      body: ListView(
        children: <Widget>[],
      ),
    );
  }
}

class SettingsPage extends StatefulWidget {
  SettingsPage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _SettingsPageState createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  Future<String> createAlertDialog(BuildContext context, String title,
      String body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: Text(body),
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  Future<String> helpContext(BuildContext context, String title, Widget body) {
    return showDialog(
        context: context,
        builder: (context) {
          return AlertDialog(
              title: Text(title),
              content: body,
              actions: <Widget>[
                MaterialButton(
                  elevation: 5.0,
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: Text("OK"),
                )
              ]);
        });
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);
    return Scaffold(
      appBar: AppBar(
        title: Text("SafeTravels Settings"),
        actions: <Widget>[
          IconButton(
              icon: Icon(Icons.help),
              onPressed: () async {
                helpContext(
                    context,
                    "Help",
                    Text.rich(
                      TextSpan(
                        children: <TextSpan>[
                          TextSpan(
                            text: 'SafeTravels Settings\n',
                            style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text:
                            'This screen will allow you to edit the settings of this app.\n',
                            style: TextStyle(fontSize: 20),
                          ),
                        ],
                      ),
                    ));
              })
        ],
      ),
      bottomNavigationBar: BottomAppBar(
        child: new Row(
          mainAxisSize: MainAxisSize.max,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: <Widget>[
            IconButton(
              icon: Icon(Icons.airport_shuttle),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/bus");
              },
            ),
            IconButton(
              icon: Icon(Icons.train),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/train");
              },
            ),
            IconButton(
              icon: Icon(Icons.airplanemode_active),
              onPressed: () {
                Navigator.pushReplacementNamed(context, "/plane");
              },
            ),
            IconButton(
              icon: Icon(Icons.settings),
              onPressed: () {},
            ),
          ],
        ),
      ),
      body: ListView(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.only(
                top: 10.0, bottom: 10.0, left: 30.0, right: 30.0),
            child: Text("Email Address: ${userJSON["email"]}",
                style: TextStyle(fontSize: 20)),
          ),
          Padding(
            padding: const EdgeInsets.only(
                top: 10.0, bottom: 10.0, left: 30.0, right: 30.0),
            child: Text(
              "Name: ${userJSON["name"]}",
              style: TextStyle(fontSize: 20),
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(
                top: 10.0, bottom: 10.0, left: 30.0, right: 30.0),
            child: Row(
              children: <Widget>[
                Padding(
                    padding: const EdgeInsets.only(
                        top: 10.0, bottom: 10.0, right: 15.0),
                    child: Text("Not you?", style: TextStyle(fontSize: 20))),
                RaisedButton(
                    onPressed: () async {
                      SharedPreferences prefs =
                      await SharedPreferences.getInstance();
                      await prefs.clear();
                      Navigator.pushReplacementNamed(context, "/");
                    },
                    child: Text("Sign out")),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.only(left: 30.0, right: 30.0),
            child: TextField(
              decoration: InputDecoration(
                  labelText: 'RFID Access Code', hintText: "RFID Access Code"),
              keyboardType: TextInputType.number,
              onChanged: (String str) {
                setState(() {
                  rfidNum = str;
                });
              },
            ),
          ),
          ListTile(
              title: RaisedButton(
                  onPressed: () async {
                    Map<String, String> headers = {
                      "Content-type": "application/json",
                      "Origin": "*",
                      "userid": userID,
                      "rfid": rfidNum
                    };
                    Response response = await post(
                        'https://safetravels.macrotechsolutions.us:9146/http://localhost/setupDevice',
                        headers: headers);
                    //createAlertDialog(context);
                    setupJSON = jsonDecode(response.body);
                    if (setupJSON["data"] == "Success") {
                      var prefs = await SharedPreferences.getInstance();
                      prefs.setString('rfid', rfidNum);
                      createAlertDialog(context, "Success",
                          "Updated RFID and Reader access keys.");
                    } else {
                      createAlertDialog(context, "Error", setupJSON["data"]);
                    }
                  },
                  child: Text("Update RFID Tag"))),
        ],
      ),
    );
  }
}
