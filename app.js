//getting the require module
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set("view engine", "ejs");
//for getting the data from websites
app.use(bodyParser.urlencoded({ extended: true }));
// for making the file publi
app.use(express.static("public"));


//in place of array we use mongo db
mongoose.connect("mongodb+srv://admin-sameer:Test123@cluster0.ztnrste.mongodb.net/todoListDB", { useNewUrlParser: true });
const ItemSchema = {
  name: String
};
const Item = mongoose.model("Item", ItemSchema);
const item1 = new Item({
  name: "Welcome to your to do list"
});
const item2 = new Item({
  name: "Use + for adding the thing."
});
const item3 = new Item({
  name: "<-- use this checkbox for deleting the thing."
});
const defaultItem = [item1, item2, item3];

//create list for different pages
const ListSchema = {
  name: String,
  items: [ItemSchema]
};
const List = mongoose.model("List", ListSchema);



app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItem, function (err) {
        if (err) {
          console.log(err);
        }
        else {
          console.log("Successfully added the data");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", { listTitle: "Today", newListItem: foundItems });
    }
  });

});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete", function (req, res) {
  const checkBoxId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkBoxId, function (err) {
      if (!err) {
        console.log("Successfully deleted checked element");
        res.redirect("/");
      }
    });
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkBoxId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }

});


app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItem
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        res.render("list", { listTitle: foundList.name, newListItem: foundList.items });
      }
    }

  });

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function () {
  console.log("Server has started successfully.");
});