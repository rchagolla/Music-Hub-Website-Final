// Design doc: https://docs.google.com/document/d/1C97jGiihm8hZNt2U9zdemFVc6vepxJLUpRAsjPHSMaY/edit

// Rubric: https://csumb.instructure.com/courses/19425/assignments/235905

// Genius API:
// Documentation: https://docs.genius.com/
// Client ID: NwWX70Nqo4bTNlEKv_i3xFaAMIBuqTUz-yYZ_lRt614SykL-etTJs-KttTug__Bn
// Client Secret: e1WDG6JH7BSuiUNclcALT799gIMSQZUmm43sTtUUsdNJS-BtcBb6lKH5pkUvcoY0nwtXMFRRytl3C01Whfw1dw
// Client Access Token: SeeIchoeJdV4Jf5LNfFOvytiBkxfivpBd1ATAqsKGqoYQp2Q8dhVQqWxDNKxGLxo

const express = require("express");

const mysql = require('mysql');
const app = express();
const pool = dbConnection();
app.set("view engine", "ejs");
app.use(express.static("public"));
const bcrypt = require('bcrypt');
const session = require('express-session');

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))

//to parse Form data sent using POST method
app.use(express.urlencoded({ extended: true }));
//routes
app.get('/', async(req, res) => {
  let sql = `SELECT *
             FROM topartists`;
  let rows = await executeSQL(sql);
  res.render('home', { username: req.session.username, userId: req.session.userId, 'topArtists':rows });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/updateusername', (req, res) => {
  res.render('updatename');
});

app.get('/logout', (req, res) => {
  req.session.destroy(function(err) {
    console.log('Session deleted');
  })
  res.redirect('login');
});//Log out

app.get('/lyrics', (req, res) => {
  res.render('lyrics', { 'songs': "", username: req.session.username, userId: req.session.userId });
});//Lyrics

app.get('/register', async (req, res) => {
  res.render('register');
});//Register

app.get('/login/checkuserdata/:username/:password', async (req, res) => {
  console.log("executing login validation");
  let username = req.params.username;
  let password = req.params.password;
  let sql = `SELECT * FROM userlogin WHERE username = ?`;
  let params = [username, password];
  let rows = await executeSQL(sql, params);
  if(rows.length == 0){
    console.log("invalid username");
    res.json({ userId: -1 });
    return;//username not found, returns negative userID
  }
  const passwordHash = rows[0].password;
  if (await bcrypt.compare(password, passwordHash)) {
    req.session.username = username;
    req.session.userId = rows[0].userId;
    req.session.authenticated = true;
    console.log("yay user is valid");
    res.json({ userId: rows[0].userId })
  } else {
    console.log("invalid password");
    // res.status(400).json({ error: 'Invalid username or password' });
    res.json({ userId: -1 });//invalid password, returns negative userId
  }
});//validate user login info

//Checks if the selected username is taken and denies it to user for registration
app.get('/register/checkusername/:username', async (req, res) => {
  console.log("Checking if username is taken...");
  let username = req.params.username;
  let sql = `SELECT (username) FROM userlogin WHERE username = ?`;
  let params = [username];
  let rows = await executeSQL(sql, params);
  if (rows.length >= 1) { //if there are matching entries then the username is taken
    res.json({ exists: true });
  } else {
    res.json({ exists: false });
  }
});//check for taken username

app.post('/register/new', async (req, res) => {//add new user to database
  console.log("Registering new user...")
  let username = req.body.registerUsername;
  let password = req.body.registerPassword;
  let sql;
  let params;
  bcrypt.hash(password, 10, async function(err, hash) {
    password = hash;
    sql = `INSERT INTO userlogin (username,password)
    VALUES (?,?)`;
    params = [username, password];
    let rows = await executeSQL(sql, params);
    //Get userId for new user data and return it
    sql = `SELECT (userId) FROM userlogin WHERE username = ?`;
    params = [username];
    let userId = await executeSQL(sql, params);
    req.session.username = username;
    req.session.userId = userId[0].userId;
    req.session.authenticated = true;
    res.redirect('/');
  });
});//register new user

app.post('/updateusername/update', async (req, res) => {//change user's name
  let username = req.body.newusername;
  let userid = req.session.userId;
  let password = req.body.newpassword;
  console.log("Updating user number" + userid + "username's to " + username)
  let sql;
  let params;
  bcrypt.hash(password, 10, async function(err, hash) {
    password = hash;
    sql = `UPDATE userlogin SET username = ?, password =? WHERE userid = ?`;
    params = [username, password, userid];
    let rows = await executeSQL(sql, params);
    //Get userId for new user data and return it
    sql = `SELECT (userId) FROM userlogin WHERE username = ?`;
    params = [username];
    let userId = await executeSQL(sql, params);
    req.session.username = username;
    console.log("Update successful! The new username is: " + username)
    req.session.userId = userId[0].userId;
    res.redirect('/');
  });
});//updating a username

app.get('/events', (req, res) => {
  const { username, userId } = req.session;
    res.render('events', { username: req.session.username, userId: req.session.userId });
  });//events
  
  app.get('/playlistview', async (req, res) => {
    if (typeof(req.session.username) != "undefined") {
      
      let userId = req.session.userId;
      let sql = `SELECT userPlaylists
                 FROM usermusic
                 WHERE userId = ?`
      let params = [userId];
      let data = await executeSQL(sql, params);
      // console.log(data);

      if (typeof(data[0]) != "undefined") {
        let playlists = await JSON.parse(data[0].userPlaylists);
        // console.log(playlists);
  
        let artistImages = [];
        for (var i = 0; i < playlists.length; i++) {
          let songId = playlists[i].songs[0].id;
          let url = `https://api.genius.com/songs/${songId}?access_token=SeeIchoeJdV4Jf5LNfFOvytiBkxfivpBd1ATAqsKGqoYQp2Q8dhVQqWxDNKxGLxo`;
          let response = await fetch(url);
          let data = await response.json();
  
          let playlistCover = data.response.song.header_image_url;
          artistImages.push(playlistCover);
        }
  
        let firstThreeSongs = [];
        for (var i = 0; i < playlists.length; i++) {
          let firstThree = [];
          for (var j = 0; j < 3; j++) {
            
            if (j == playlists[i].songs.length) {
              break;
            }
            
            let songId = playlists[i].songs[j].id;
            let url = `https://api.genius.com/songs/${songId}?access_token=SeeIchoeJdV4Jf5LNfFOvytiBkxfivpBd1ATAqsKGqoYQp2Q8dhVQqWxDNKxGLxo`;
            let response = await fetch(url);
            let data = await response.json();
  
            let songName = data.response.song.full_title;
            firstThree.push(songName);
          }
  
          firstThreeSongs.push(firstThree);
        }
  
        // console.log(firstThreeSongs);
        // console.log(artistImages);
        
        // console.log(playlists[0].songs[0]);
        
        res.render('playlistview', { username: req.session.username, userId: req.session.userId, "playlists": playlists, "playlistCovers": artistImages, "firstThreeSongs": firstThreeSongs});
      } else {
        console.log("No playlists for user, create one")
        res.redirect("/playlistcreation");
      }
  } else {
      console.log("Not logged in");
      res.redirect('/login');
  }

    //https://api.deezer.com/track/2100262147
});//playlist view


// START OF PLAYLIST CREATION
app.get('/playlistcreation', isAuthenticated, async (req, res) => {
  let userId = req.session.userId;
  let sql = `SELECT userPlaylists
             FROM usermusic
             WHERE userId = ?`;
  let rows = await executeSQL(sql, [userId]);
  let data = "";
  if (rows.length > 0) {
    data = JSON.parse(rows[0].userPlaylists);
  }
  res.render('playlistcreation', { 'songs': "", 
                                   'keyword': "",
                                   'name': "",
                                   'chosen':"",
                                   'playlists': data,
                                    username: req.session.username, 
                                    userId: req.session.userId, 
                                   'successMessage': ""});
});

app.post('/addSong:songId', async (req, res) => {
  let songId = req.params.songId;
  let search = req.body.searchTerm;
  let playlistName = req.body.playlist;
  let userId = req.session.userId;
  let sql = `SELECT userPlaylists
             FROM usermusic
             WHERE userId = ?`;
  let rows = await executeSQL(sql, [userId]);

  //incase user does not have a row on the table
  if (rows.length == 0) {
    let userPlaylists = "[]";
    let userLikedPlaylists = "[]";
    sql = `INSERT INTO usermusic
           (userPlaylists, userLikedPlaylists, userId)
           VALUES
           (?, ?, ?)`;
    let params = [userPlaylists, userLikedPlaylists, userId];
    rows = await executeSQL(sql, params);

    sql = `SELECT userPlaylists
           FROM usermusic
           WHERE userId = ?`;
   rows = await executeSQL(sql, [userId]);
  }
  let data = JSON.parse(rows[0].userPlaylists);
  var isPlaylist = false;
  for (var i = 0; i < data.length; i++) {
    if (data[i].name == playlistName) {
      isPlaylist = true;
      data[i].songs.push({ 'id': `${songId}`});
    }
  }
  
  if (!isPlaylist) {
    //to add a new playlist to userPlaylists
    data.push({ "name": `${playlistName}`, 'songs': [{'id':`${songId}`}]});
  }
    
  let updated = JSON.stringify(data);  
  sql = `UPDATE usermusic
         SET userPlaylists = ?
         WHERE userId = ?`;
  let params = [updated, userId];
  rows = await executeSQL(sql, params);

  sql = `SELECT userPlaylists
         FROM usermusic
         WHERE userId = ?`;
  rows = await executeSQL(sql, [userId]);
  let playlistMenu = JSON.parse(rows[0].userPlaylists);

  res.render('playlistcreation', { 'songs': "", 
                                   'keyword': "",
                                   'name': "",
                                   'chosen':"",
                                   'playlists': playlistMenu,
                                   username: req.session.username, 
                                   userId: req.session.userId, 
                                   'successMessage': "Song Added Successfully"});
});

app.get('/searching', isAuthenticated, async (req, res) => {
  let keyword = req.query.keyword;
  let name = req.query.newPlaylist;
  let playlistChosen = req.query.playlists;
  let apiKey = 'SeeIchoeJdV4Jf5LNfFOvytiBkxfivpBd1ATAqsKGqoYQp2Q8dhVQqWxDNKxGLxo';
  let url = `https://api.genius.com/search?q=${keyword}&access_token=${apiKey}`;
  // let url = `https://api.deezer.com/search?q=${keyword}`;
  let response = await fetch(url);
  let data = await response.json();
  let userId = req.session.userId;
  let sql = `SELECT userPlaylists
             FROM usermusic
             WHERE userId = ?`;
  let rows = await executeSQL(sql, [userId]);
  let playlists = "";
  if (rows.length > 0) {
    playlists = JSON.parse(rows[0].userPlaylists);
  }
 
  res.render('playlistcreation', { 'songs': data.response.hits, 
                                   'keyword': keyword, 
                                   'name': name,
                                   'chosen':playlistChosen,
                                   'playlists': playlists,
                                   username: req.session.username, 
                                   userId: req.session.userId, 
                                   'successMessage': ""});
});
// END OF PLAYLIST CREATION

app.get('/lyricSearch', async (req, res) => {
  let keyword = req.query.keyword;
  let apiKey = 'SeeIchoeJdV4Jf5LNfFOvytiBkxfivpBd1ATAqsKGqoYQp2Q8dhVQqWxDNKxGLxo';
  let url = `https://api.genius.com/search?q=${keyword}&access_token=${apiKey}`;
  let response = await fetch(url);
  let data = await response.json();
  res.render('lyrics', { 'songs': data.response.hits, username: req.session.username, userId: req.session.userId })
});

//middle ware
function isAuthenticated(req,res,next) {
  if(req.session.authenticated) {
    next()
  } else {
    res.redirect("/login")
  }
}

app.get("/dbTest", async function(req, res) {
  let sql = "SELECT CURDATE()";
  let rows = await executeSQL(sql);
  res.send(rows);
});//dbTest

//functions
async function executeSQL(sql, params) {
  return new Promise(function(resolve, reject) {
    pool.query(sql, params, function(err, rows, fields) {
      if (err) throw err;
      resolve(rows);
    });
  });
}//executeSQL

function dbConnection() {

  const pool = mysql.createPool({

    connectionLimit: 10,
    host: "grp6m5lz95d9exiz.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "xrz9sg8p6e049tay",
    password: "drbewqz8rq34pf5x",
    database: "t7h0d2zkydmjw5ot"

  });

  return pool;

} //dbConnection
//start server
app.listen(3000, () => {
  console.log("Expresss server running...")
})

// DZ.init({
//   appId: '5362137244',
//   channelUrl: 'http://localhost:8080/channel.html',
//   player: {
//     onload: function() {
//       console.log('DZ player loaded');
//     }
//   },
//   token: 'c55f8de18636d06638ba8cc72a5faa9e90c9bf7ac2dc9f218dcc83b108f2a09374374a2aa40a167dbdf890e3581f6b1caec83ca46047dc9c9ef1745c77b26827dc9f79805fe73c3eed3d25c06cadd3034857fb248c81bf41e87cf237c123c787'
// });
