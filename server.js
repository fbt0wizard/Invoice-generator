const express = require('express')

const db = require("./config/db")

const cors = require('cors');

const app = express();

// connect database
db.connect((err) => {
  if (err) throw err;
  console.log("Database is connected successfully !");
});

//init Middleware
app.use(express.json({extended: false}))

// setting CORS
app.use(cors({
  origin: '*'
}));


//Define route
app.use('/api/users', require('./routes/api/users'))
app.use('/api/auth', require('./routes/api/auth'))
app.use('/api/estimates', require('./routes/api/estimates'))
app.use('/api/clients', require('./routes/api/clients'))
app.use('/api/history', require('./routes/api/history'))
app.use('/api/pdfstructure', require('./routes/api/pdfstructure'))


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log(`server started on port ${PORT}`))
