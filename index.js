const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Load jokes data from jokes.json file
let jokesData = [];
fs.readFile('jokes.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading jokes.json file:', err);
    } else {
        jokesData = JSON.parse(data);
    }
});

app.use(bodyParser.json());

// Get a random joke
app.get('/jokes/random', (req, res) => {
    const randomIndex = Math.floor(Math.random() * jokesData.length);
    const randomJoke = jokesData[randomIndex];
    res.json(randomJoke);
});

// Get a specific joke by ID
app.get('/jokes/:id', (req, res) => {
    const jokeId = parseInt(req.params.id);
    const joke = jokesData.find(joke => joke.id === jokeId);
    if (joke) {
        res.json(joke);
    } else {
        res.status(404).json({ message: 'جوک یافت نشد!' });
    }
});

// Get a joke by filtering joke type
app.get('/jokes', (req, res) => {
    const jokeType = req.query.type;
    if (!jokeType) {
        res.status(400).json({ message: 'جوک با فیلتر یافت نشد!' });
        return;
    }
    const filteredJokes = jokesData.filter(joke => joke.jokeType === jokeType);
    res.json(filteredJokes);
});

// Post a new joke
app.post('/jokes', (req, res) => {
    const newJoke = req.body;
    if (!newJoke.jokeText || !newJoke.jokeType) {
        res.status(400).json({ message: 'جوک ثبت نشد! لطفاً متن جوک و نوع جوک را وارد کنید.' });
        return;
    }

    // Generate a new ID for the joke
    const maxId = jokesData.reduce((max, joke) => (joke.id > max ? joke.id : max), 0);
    newJoke.id = maxId + 1;

    jokesData.push(newJoke);
    updateJokesFile(jokesData);
    res.status(201).json({ message: 'جوک موفقانه ثبت گردید', joke: newJoke });
});


// Put a joke
app.put('/jokes/:id', (req, res) => {
    const jokeId = parseInt(req.params.id);
    const updatedJoke = req.body;
    const index = jokesData.findIndex(joke => joke.id === jokeId);
    if (index === -1) {
        res.status(404).json({ message: 'جوک یافت نشد!' });
        return;
    }
    jokesData[index] = { ...jokesData[index], ...updatedJoke };
    updateJokesFile(jokesData);
    res.json({ message: 'جوک موفقانه آپدیت شد!', joke: jokesData[index] });
});

// Patch a joke
app.patch('/jokes/:id', (req, res) => {
    const jokeId = parseInt(req.params.id);
    const updatedFields = req.body;
    const index = jokesData.findIndex(joke => joke.id === jokeId);
    if (index === -1) {
        res.status(404).json({ message: 'جوک یافت نشد!' });
        return;
    }
    jokesData[index] = { ...jokesData[index], ...updatedFields };
    updateJokesFile(jokesData);
    res.json({ message: 'جوک موفقانه آپدیت شد!', joke: jokesData[index] });
});

// Delete a specific joke
app.delete('/jokes/:id', (req, res) => {
    const jokeId = parseInt(req.params.id);
    const index = jokesData.findIndex(joke => joke.id === jokeId);
    if (index === -1) {
        res.status(404).json({ message: 'جوک یافت نشد!' });
        return;
    }
    const deletedJoke = jokesData.splice(index, 1);
    updateJokesFile(jokesData);
    res.json({ message: 'جوک موفقانه حذف شد!', joke: deletedJoke });
});

// Delete all jokes
app.delete('/jokes', (req, res) => {
    jokesData.splice(0, jokesData.length);
   // updateJokesFile(jokesData);
    res.json({ message: 'تمام جوک ها موفقانه حذف شدند!' });
});

// Function to update jokes.json file
function updateJokesFile(data) {
    fs.writeFile('jokes.json', JSON.stringify(data, null, 2), err => {
        if (err) {
            console.error('Error writing to jokes.json file:', err);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
