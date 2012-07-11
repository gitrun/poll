express = require "express"
stylus  = require "stylus"
nib     = require "nib"
passport = require "passport"

GitHubStrategy = require('passport-github').Strategy

GITHUB_CLIENT_ID = "041e33b4c176a007f627"
GITHUB_CLIENT_SECRET = "f70b6f1468f4ef87ba18d5587a2be6d7c6c4ae98";

app = module.exports = express.createServer()


passport.serializeUser (user, done) ->
  done(null, user);


passport.deserializeUser (obj, done) ->
  done(null, obj);


passport.use new GitHubStrategy {
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:8085/auth/github/callback"
  },
  (accessToken, refreshToken, profile, done) ->

    process.nextTick ->
      profile.accessToken = accessToken
      return done(null, profile);


# stylus compile function
compile = (str, path) ->
  return stylus(str)
    .define("url", stylus.url({ paths: [__dirname + "/public"] }))
    .set("filename", path)
    .set("warn", true)
    .set("compress", false)   # compress CSS
    .use(nib())    


app.configure ->
  # stylus middleware
  app.use stylus.middleware
    src    : __dirname + "/styls"  # styl files should be placed inside this folder
    dest   : __dirname + "/public" # CSS files will be complied to public directory
    compile: compile    # compile function
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('view options', {layout: false});
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));


app.get '/auth/github',
  passport.authenticate('github', scope: 'repo'),
  (req, res) ->

app.get "/", (req, res) ->
  
  user = req.user
  if not user
    user = {}
  console.log "aaa", user, user.accessToken
  res.render "index", {user: user}

app.get "/logout", (req, res) ->
  req.logout()
  res.redirect "/"

app.get '/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) ->
    res.redirect('/');


app.listen 8085
console.log "server started on port 8085. Open http://localhost:8085 in your browser"