//jshint esversion:6

const express=require("express");
const app=express();
const ejs = require("ejs");

const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/blog",{ useNewUrlParser: true, useUnifiedTopology: true});
const postsSchema=new mongoose.Schema({
    title: String,
    postBody: String,
    update: String,
    picname: String
});
const post=mongoose.model("post",postsSchema);


const multer = require('multer');
const path=require("path");
const bodyParser=require("body-parser");
const storage=multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req,file,cb){
        cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname));
    }
});

const upload= multer({
    storage: storage
}).single('postphoto');

var _ = require('lodash');
app.use(express.static("./public")); 
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));




app.get("/",function(request,response){
    post.find({},function(err,foundtpost){
        
            if(err)
            console.log(err);
            else
            response.render("home",{post: foundtpost});
        });
    
});


app.get("/compose",function(request,response){
    response.render("compose");
});

app.post("/compose",(req,res) => {
    var d = new Date();
    var date = d.getDate();
    var month = d.getMonth() + 1;
    var year = d.getFullYear();
    var dateStr = date + "/" + month + "/" + year;

    upload(req,res, (err) => {
        if(err){
            res.render("pic",{
                msg: err
            });
        }
        else{
            const newpost=new post({
                title: req.body.posttitle,
                postBody: req.body.postbody,
                update:  dateStr,
                picname:  req.file.filename
            });
            newpost.save(function(err){
                if(!err)
                {
                res.redirect("/");
                }    
             });  
        }
    });

   
    
}); 


app.get("/post/:topic",function(request,response){
    const search=request.params.topic;
    post.findOne({_id: search},function(err,finditem){

        response.render("posts",{title: finditem.title,postBody: finditem.postBody,picname: finditem.picname});
    });
});
app.post("/delpost",function(request,response){
    const t=request.body.delpost;
    console.log(t);
    post.deleteOne({title: t},function(err){
        if(err)
        console.log(err);
        else
        {
        console.log("deleted");
        response.redirect("/account");
        } 
    });
});

app.post("/updatepost",function(request,response){
    const t=request.body.updatepost;
    post.findOne({title: t},function(err,foundpost){
        if(err)
        console.log(err);
        else
        response.render("up",{post:foundpost});
    });

});

app.post("/updatedpost",function(req,res){
    
   var changepicture;

    upload(req,res, (err) => {
        if(err){
            res.render("pic",{
                msg: err
            });
        }
        else{
            const search=req.body.updatepost;
            const changetitle=req.body.posttitle;
            const changebody= req.body.postbody;
            console.log(search);
            console.log(changetitle);
            console.log(changebody);
            if(req.file!==undefined)
            {
                 const changepicture=req.file.filename;
                 
            post.updateOne({title: search},{title: changetitle,postBody: changebody,picname: changepicture},function(err){
                if(err)
                console.log(err);
                else
                {
                    console.log("updated");
                    res.redirect("/account");
                }
        });

            }
            else
            {
                post.updateOne({title: search},{title: changetitle,postBody: changebody},function(err){
                    if(err)
                    console.log(err);
                    else
                    {
                        console.log("updated");
                        res.redirect("/account");
                    }
            });
            }
           
        }
    });
  
});



app.get("/account",function(request,response){
    post.find({},function(err,foundtpost){
        
            if(err)
            console.log(err);
            else
            response.render("doc",{post: foundtpost});
    });      
});



app.listen(3000,function(){
    console.log("server is up and running");
});