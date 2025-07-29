const logger = require('../Middleware/log.js');

const express = require('express');
const bodyParser = require('body-parser');
const { Pool} = require('pg');
const app = express();

app.use(bodyParser.json());

const pool = new Pool({
  user:"postgres",
  host:"localhost",
  database:"postgres",
  password:"post",
  port:5432,
})

const port = 5000;

app.get('/',(req,res)=>{
  res.send("API is working");
})

app.post('/shorturls',async(req, res)=>{
  const {url, validity, shortcode } = req.body;
  try{
    if (!url || !shortcode){
      return res.status(400).json({error:'url and shortcode must not be null'});
    }
    const result = await pool.query(`INSERT INTO url(url,validity,shortcode) VALUES ($1,$2,$3) RETURNING *`,
      [url, validity, shortcode]
    );
    if(!validity){
      validity = 30;
    }
    const expiry=Date.now() + validity*60*1000;
    res.send({
      shortUrl:`http://localhost:${port}/${result.rows[0].short}`,
      expiry: new Date(expiry).toISOString()
    });
  }catch(err){
    console.log(err);
    res.send("Error in post");
  }
});


app.get('/shorturls/:abcd1', async(req, res)=>{
  const shortcode = req.params.shortcode;
  try{
    const result = await pool.query(`SELECT * FROM url WHERE shortcode = $1`,[shortcode]);
    if (!result) 
      return res.status(400).send('shortcode is invalid');
    if (Date.now()>result.expiry) {
      return res.statusMessage(400).send('shortcode has expired');
    }
    res.redirect(result.rows[0].url);
  }catch(err){
    console.log(err);
    res.send("Error in get");
  }
});

app.listen(5000,()=>{
  console.log(`Server running at http://localhost:5000`);
});
