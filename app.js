//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const password ="W7j8vk43JoCS1zNZ";
mongoose.connect("mongodb+srv://admin-sadaf:"+password+"@cluster0.mhhvhpo.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {

  Item.find({}, function (err, docs) {
    if(err){
      console.log(err);
    }
    else{

      if(docs.length === 0){
        Item.insertMany(defaultItems, function (err) {
          if(err){
            console.log(err);
          }
          else{
            console.log("Successfully added default items");
            res.redirect("/")
          }
        });
      }
      else{
        res.render("list", {listTitle: "Today", newListItems: docs});
      }      
    }
  });

    

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    })
  }  
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId, function (err) {
      if(err){
        console.log(err)
      }
      else{
        res.redirect("/")
      }
    });
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}},function (err, foundList) {
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }

});

app.get("/:customListName", function (req,res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function (err, foundList) {
    if(!err){
      if(!foundList){
        //Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/"+ customListName);
      }
      else{
        //Show existing list
        res.render("list", {listTitle: customListName, newListItems:foundList.items});
      }
    }
  })
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
