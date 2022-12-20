import express, { application } from "express";
import bodyParser from "body-parser";
import mongoose, { connect } from "mongoose";
import bcrypt from "bcrypt";
// import dbConfig from "./models/dbConfig.mjs";
import * as dotenv from "dotenv";
// import User from "./views/users.mjs";
// import { use } from "passport";
import session from "express-session"
import passport from "passport";
import passportConfig from './views/passport.js';
import flash from "connect-flash";
dotenv.config();
// require('./models/dbConfig.js')

const server = express();
// dbConfig();
server.use(flash())

server.use( express.static( "public"));
server.use(bodyParser.json());
server.use(express.json());
// Set up EJS as the view engine
server.set("view engine", "ejs");

// Use body-parser to parse form data sent via HTTP POST
server.use(bodyParser.urlencoded({ extended: true }));

// Use body-parser to parse JSON data sent via HTTP POST
server.use(bodyParser.json());


server.use(express.urlencoded({ extended: false }))

server.use(session({
  secret : 'secret',
  resave : true,
  saveUninitialized : true
}));
passportConfig(passport);
server.use(passport.initialize());
server.use(passport.session());

// Set up a route to serve the homepage
server.get("/", (req, res) => {
  res.render("./homepage");
});
server.get("/login", (req, res) => {
  res.render("./login");
});
server;

server.get("/register", (req, res) => {
  res.render("../views/register.ejs");
});

server.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];
  console.log(" Name " + name + " email :" + email + " pass:" + password);
  if (!name || !email || !password || !password2) {
    errors.push({ msg: "Please fill in all fields" });
  }
  //check if match
  if (password !== password2) {
    errors.push({ msg: "Passwords dont match" });
  }

  //check if password is more than 6 characters
  if (password.length < 6) {
    errors.push({ msg: "Password atleast 6 characters" });
  }
  if (errors.length > 0) {
    res.render("register", {
      errors: errors,
      name: name,
      email: email,
      password: password,
      password2: password2,
    });
  } else {
    //validation passed
    User.findOne({ email: email }).exec((err, user) => {
      console.log(user);
      if (user) {
        errors.push({ msg: "Email already registered" });
        res.render("register", { errors, name, email, password, password2 });
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password,
        });

        //hash password
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            //save pass to hash
            newUser.password = hash;
            //save user
            newUser
              .save()
              .then((value) => {
                console.log(value);
                res.redirect("/login");
              })
              .catch((value) => console.log(value));
          })
        );
      }
    });
  }
});

server.get("/login", (req, res) => {
  res.render("../views/login.ejs");
});

server.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/homepage",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});

server.post("/homepage", async (req, res) => {
  const todoTask = new Posting({
    content: req.body.content,
  });
  try {
    await todoTask.save();
    res.redirect("/");
  } catch (err) {
    res.redirect("/");
  }
});

server.get("/homepage", (req, res) => {
  TodoTask.find({}, (err, tasks) => {
    res.render("homepage.ejs", { todoTasks: tasks });
  });
});
// server.post('/'(req, res) => {
//   console.log()
// });
// server.get

server.get("/", (req, res) => {
  res.send("Hello World!");
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true }, () => {
  console.log("Connected to db!");
  server.listen(3001, () => console.log("Server Up and running"));
});
// server.listen(3000, () => {
//   console.log("ok");
// });
