const express = require('express')
const shortid = require('shortid')
const app = express();
const db = require('./db')
const port = 5000||process.env.port;
const bodyParser = require('body-parser')
const cors = require('cors')
require('dotenv').config()

app.use(bodyParser.json())

app.use(cors())
app.get('/',(req,res)=>{
    res.send('Welcome to server '+port);
    res.end()
})
app.post('/api/creat-short-url',async (req,res)=>{
    const originalURL = await req.body.orginal_url;

    try{
        //check data if they have
        const checkData = await db.query("SELECT orginal_url FROM public.url WHERE  orginal_url=$1",[originalURL])
    if(originalURL === '' || originalURL == null){
        console.log('not have any thing')
        res.status(401).json({msg:'pls fill some thing'})
        return
    }
    else{
         if(checkData.rows.length>0){
            res.status(200).json({msg : "Is All Ready have"})
            console.log("You have Data in you Dbms");
        }else{

            const shortURL = await shortid.generate();
            const getUrl = await db.query("INSERT INTO public.url (orginal_url, short_url, click) VALUES ($1,$2,0);",[originalURL,shortURL])
            console.log("Creat Complete")
            res.status(200).json(getUrl) 
        }
    }
       
            
    }catch(e){
        console.log(e)
        res.status(401).json({mag : error})
    }
    
    

});
app.post("/api/get-one-row", async (req,res)=>{
    const {original_url} = await req.body;
    console.log(original_url)
    console.log(req.body)
    try{
        const One = await db.query("SELECT * FROM public.url WHERE orginal_url=$1 ",[original_url]);
        if(One.rows.length > 0){
            console.log("You Recive One RO@ Data")
            res.status(200).json(One.rows[0])
        }
        else{
            console.log("you Not Have Data in DB")
            res.status(401)
        }
    }catch(e){  
        console.log(e)
        res.status(500).json({msg : e})
    }
})
app.get("/api/get-all-url", async (req,res)=>{
    try{
         const find = await db.query("SELECT * FROM public.url")
         if(find.rows.length > 0){
            res.status(200).json(find.rows);
         }
         else{
            res.status(500).json({
                Status :"Not ok ",
                message:"something went wrong"
            })
         }
    }
    catch(e){
        console.log(e)
        res.status(401).json({mag : error})
    }
    
})
app.get("/:shortURL", async (req, res) => {
    const {shortURL} = await req.params;
    console.log(shortURL)
    try {
        const result = await db.query("SELECT orginal_url FROM public.url WHERE short_url=$1",[shortURL])
        //const upDate = await db.query("UPDATE public.url SET click = click + 1 WHERE short_url = $1",[shortURL])
            if(result.rows.length > 0){
                const originWebsite = await result.rows[0].orginal_url
                res.redirect(originWebsite)
            }
    }
    catch(error){
        console.log(error)
        res.status(401).json({mag : error})
    }
});
app.put("/update/:id", async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await db.query("SELECT * FROM public.url WHERE id = $1", [id]);
        
      if (result.rows.length > 0) {
        const updateResult = await db.query("UPDATE public.url SET click = click + 1 WHERE id = $1", [id]);
        res.status(200).json({ message: "URL updated successfully" });
      } else {
        res.status(404).json({ message: "URL not found" });
      }
    } catch (e) {
      console.error(e); 
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

app.listen(port,()=>{
    console.log('Server is running on port '+port)
})
