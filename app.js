const express = require('express');
const contractRoutes = require('./routes/contract');
const app = express();

app.use(express.json());
app.use('/contract', contractRoutes);

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
