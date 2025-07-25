const express = require('express')
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require("cors");
const mongoose = require("mongoose");

const supportModel = require("./Database/models/Support")
const PlanModel = require("./Database/models/Loan_Plan_schedule")

const port = 5002;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
var db=require('./Database/dbconnection');
db.connect()


const apiroutes = require("./Database/api/allapiroutes");


app.post('/api/support', async (req, res) => {
    try {
      const { name, query_type, contact, email,query } = req.body;
  
      // Validate input if needed
  
      // Create a new Office document
      const newOffice = new supportModel({
        _id: new mongoose.Types.ObjectId(),
        name,
        query_type,
        contact,
        email,
        query
      });
  
      // Save the office details to the database
      const savedOffice = await newOffice.save();
  
      res.status(201).json({ message: 'Submitted', office: savedOffice });
    } catch (error) {
      console.error('Error saving office details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/api/support', async (req, res) => {
    try {
     
  
      // Save the office details to the database
      const data = await supportModel.find({})
  
      res.status(201).json({ data });
    } catch (error) {
      console.error('Error saving office details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/api/plans', async (req, res) => {
    try {

      const data = await PlanModel.find({})
  
      res.status(201).json({ data });
    } catch (error) {
      console.error('Error getting details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  

app.use("/api", apiroutes);

app.listen(port, () =>console.log("Site Running on http://localhost:" + port));



