//jshint esversion:6
//jshint esversion:6
// require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
// const findOrCreate = require('mongoose-findorcreate');
const adddata = require('./models/main')
const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true },(err,docs)=>{
  if(err) throw err;
  if(docs){
    console.log("Database Connected");
  } else {
    console.log("Errroe in connectde please check uri");
  }
});
// mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  isAdmin: Boolean
});

userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate); 

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser())

passport.deserializeUser(User.deserializeUser())



app.get("/", function (req, res) {
  res.render("home");
});



app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {

    res.render('secrets',{isadmin:req.user.isAdmin});
  }
  else {
    res.redirect('/login')
  }
});

app.get("/submit", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("submit");
  } else {
    res.redirect("/login");
  }
});

app.get("/data", function (req, res) {
    res.render("data",)
 
});
app.get("/list", function (req, res) {
  if (req.user) {
    console.log(req.user);
    if (req.user.isAdmin) {
      adddata.find({},function(err,data){
        if(!err){
          console.log(data);
        res.render('table',{data:data})
      }
      else{
        console.log('Error occured');
        throw err;
        res.statusCode('404').send(err);
      }
        
      })
    } else {
      
      console.log("You are not admin");
    }
  } else {
    res.redirect("/");
    console.log("you are not logged in");
  }
});

app.post("/submit", function (req, res) {
  const submittedSecret = req.body.secret;

  //Once the user is authenticated and their session gets saved, their user details are saved to req.user.
  console.log(req.user.id);

  User.findById(req.user.id, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        foundUser.secret = submittedSecret;
        foundUser.save(function () {
          res.redirect("/secrets");
        });
      }
    }
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

app.get("/makeAdmin", function (req, res) {
  if (req.user) {
    console.log(req.user);
    if (req.user.isAdmin) {
      res.render("admin")
    } else {
      res.redirect("/")
      console.log("You are not admin");
    }

  } else {
    console.log("User is not logged in");
    res.redirect('/login')
  }
})

app.post("/register", function (req, res) {

  User.register({ username: req.body.username, isAdmin: 0 }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function (req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/", function (req, res) {
  console.log(req.body);
  const data = new adddata({
    FullName: req.body.uname,
    Prn: req.body.email,
    Branch: req.body.branch,
    Year: req.body.year,
    Vaccine: req.body.vaccine,
    FirstDose: req.body.fd,
    SecondDose: req.body.sd,
  });

  data.save()
    .then(data => {
      // res.json(data);
      res.redirect('/')
    })
    .catch(err => {
      res.send(err);
    })

})



app.post("/makeAdmin", function (req, res) {
  if (req.user) {
    console.log(req.body);
    if (req.user.isAdmin ) {
      User.updateOne({username:req.body.username},{isAdmin:true}, (err)=>{
        if(!err){
          // res.send('<script> alert("Admin Added Succesfuly")</script>');
          console.log("Admin Added");
          res.redirect("/makeAdmin");
        } else {
          console.log(err);
        }
      })

    } else {
      res.redirect("/")
      console.log("You are not admin");
    }

  } else {
    console.log("User is not logged in");
  }
})



app.listen(3000, function () {
  console.log("Server started on port 3000.");
});
