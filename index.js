import express from "express";
import bodyParser from "body-parser";
import pg from "pg"





const app = express();
const port = 3000;
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "booknotes",
    password: "database",
    port: 5432
  });

  db.connect();

app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//data pattern
let bookNotes = [
    // {   id: 1,
    //     isbn: "0134817893",
    //     title: "Introduction to Industrial and System Engineering",
    //     rating: 3,
    //     notes: "this is awsome book"
    // },
    // {
    //     id: 2,
    //     isbn: "0131446789",
    //     title: "Engineering Management",
    //     rating: 5,
    //     notes: "this is awsome book"
    // },
    // {
    //     id: 3,
    //     isbn: "007042764X",
    //     title: "Schaum's outline of theory and problems of operations management",
    //     rating: 5,
    //     notes: "this is awsome book"
    // }


];

//route to home
app.get("/", async (req, res)=>{
    const result = await db.query("SELECT * FROM booknotes ORDER BY id DESC");
    const bookNotes = result.rows;
    res.render("home.ejs", {notes: bookNotes});
});


//read note
app.get("/notes/:id", async (req, res) =>{
    const noteId = parseInt(req.params.id);
    const result = await db.query("SELECT * FROM booknotes WHERE id = $1", [noteId]);
    const foundNote = result.rows[0];
    if (foundNote) {
        res.render("note.ejs", {note: foundNote});
    } else {
        res.status(404).send('Note not Found');
    }
});

//add new book
app.get("/new", (req, res) =>{
    res.render("new.ejs")
});

app.post("/new", async (req, res)=>{
    const isbn = req.body["isbn"];
    const title = req.body["title"];

    try {
        await db.query("INSERT INTO booknotes (isbn, title) VALUES ($1, $2)", [isbn, title]);
        res.redirect("/");
    } catch (error) {
        console.log(error);
    }
  
})

// Edit note form
app.get("/notes/:id/edit", async (req, res) => {
    const noteId = parseInt(req.params.id);
    const result = await db.query("SELECT * FROM booknotes WHERE id = $1", [noteId]);
    const foundNote = result.rows[0];
    if(foundNote){
        res.render("edit.ejs", {note: foundNote});
    } else {
        res.status(404).send('Note not found');
    }
});

// Update note
app.post("/notes/:id", async (req, res) =>{
    const noteId = parseInt(req.params.id);
    const { rating, notes } = req.body;
    await db.query("UPDATE booknotes SET rating = $1, notes = $2 WHERE id = $3", [rating, notes, noteId]);
    res.redirect(`/notes/${noteId}`);
});


//remove BookNotes

app.post("/notes/:id/delete", async (req, res)=>{
    const noteId = parseInt(req.params.id);
    await db.query("DELETE FROM booknotes WHERE id = ($1)", [noteId]);
    res.redirect("/");
})


app.listen(port, ()=>{
    console.log(`server runing on port ${port}`)
})