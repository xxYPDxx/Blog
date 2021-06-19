require("dotenv").config()
const express = require("express")
const app = express()
const path = require("path")
const logger = require("morgan")
const mongoose = require("mongoose")
const session = require("express-session")
const Article = require("./models/article")


//Calling user
const User = require("./models/user")


//Use
app.use(express.static(path.join(__dirname, "public")))
app.use(logger("dev"))
app.use(express.json());
app.use(express.urlencoded({ extended: false }))



//Session
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
}))

//EJS 
app.set("view engine", "ejs")

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
}).then(() => console.log("DB connected"))
  .catch(error => console.log(error))




//Signup GET
app.get("/", (req, res) => {
    res.render("signup.ejs")
    res.sendFile(__dirname, "signup.ejs")
})

//Signup POST
app.post("/signup", async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
        await user.save();
        console.log("User created")
        res.redirect("/signin")
    } catch {
        res.redirect("/")
    }
})

//Login GET
app.get("/signin", (req, res) => {
    res.render("signin.ejs")
    res.sendFile(__dirname, "signin.ejs")
})

//Login POST
app.post("/signin", async (req, res) => {
    await User.find({ email: req.body.email }).then(data => {
        if(req.body.password == data[0].password){
            req.session.user = data[0]
            res.redirect("/index")
        }
    }).catch(e => {
        console.log(e)
        res.send("Error")
    })
})

//Index
app.get("/index", async (req,res) => {
    await Article.find().then(arti => {
        console.log(arti)
        res.render("index.ejs", {
            arti: arti,
        })
    })
})

app.get("/newarti", (req , res) => {  
    res.render("new.ejs")  
})

//Add
app.post("/newarticle", async (req, res) => {
    try{
        console.log("me aalo")
        const artic = new Article({
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
        })
        console.log(artic)
        await artic.save()
        console.log("article added")
        res.redirect("/index")
    } catch (e) {
        console.log(e)
        res.send("Error in add")
    }
})

//Edit
app.get("/edit/:id", async (req, res) => {
    console.log("swarup aala")
    await Article.findById(req.params.id).then(arti => {
        console.log(arti)
        res.render("edit.ejs", {
            ypd: arti
        })
    }).catch(e => {
        console.log(e)
        res.send("Error at edit")
    })
})

//Update
app.post("/update/:id", async (req, res) => {
    await Article.findOneAndUpdate({ _id: req.params.id }, {
        $set: {
            title: req.body.title,
            description: req.body.description,
            content: req.body.content,
        }
    }).then(result => {
        
        console.log(result)
        if(result) {
            res.redirect("/index")
        } else {
            res.send("Error")
        }
    }).catch(e => {
        console.log(e)
        res.send("Error in update")
    })
})

//Delete
app.post("/deletearticle/:id", async (req, res) => {
    await Article.findOneAndDelete({_id: req.params.id }).then(result => {
        if(result){
            console.log("article deleted")
            res.redirect("/index")
        } else {
            res.send("error")
        }
    }).catch(e => {
        console.log(e)
        res.send("Error in delete")
    })
})

//Logout
app.post("/logout", (req, res) => {
    req.session.destroy()
    res.sendFile(__dirname, "signup.ejs")
    res.redirect("/")
})


let port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Listening on port 3000")
})