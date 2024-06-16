const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const path = require("path");
const cookieParser = require("cookie-parser");
const userModel = require("./models/usermodel");
const jwt = require("jsonwebtoken");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
    res.send("index page");
    console.log(userModel);
});

app.post("/create", (req, res) => {
    let { name, username, email, password } = req.body;

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let createdUser = await userModel.create({
                username,
                email,
                name,
                password: hash,
            });

            let token = jwt.sign({ email, id: createdUser._id }, "secretkey");
            res.cookie("token", token);
            res.send("account created succesfully");
        });
    });
});

app.get("/login", (req, res) => {
    // res.render("app")
    res.send("you are logged in");
});

app.post("/login", async (req, res) => {
    let user = await userModel.findOne({ email: req.body.email });
    if (!user) {
        return res.send("email or password is incorrect");
    }

    bcrypt.compare(req.body.password, user.password, function (err, result) {
        if (result) {
            let token = jwt.sign(
                { email: user.email, id: user._id },
                "secretkey"
            );
            res.cookie("token", token);
            res.send("you are allowed");
        } else {
            res.send("you are not allowed");
        }
    });
});

app.get("/logout", (req, res) => {
    res.cookie("token", "");
    
    res.send("you are logged out");
});





app.listen(3000);
