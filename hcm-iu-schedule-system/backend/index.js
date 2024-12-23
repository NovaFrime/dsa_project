const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');
const EdusoftScraper = require('./src/scraper/edusoft/EdusoftScraper');
const BlackBoardScraper = require('./src/scraper/blackboard/BlackBoardScraper');
const fs = require('fs');
const path = require('path');
const Queue = require('./src/utils');
dotenv.config();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const taskQueue = new Queue();

app.get('/', (req, res) => {
  res.send('HCM-IU Backend is running!');
});

app.post('/api/courses', (req, res) => {
  const task = async () => {
    let browser;
    try {
      const { username, Edusoft_password } = req.body;
      if (!username || !Edusoft_password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }
      const memIDPath = path.join(__dirname, 'storage', 'memID.json');
      const memIDData = JSON.parse(fs.readFileSync(memIDPath, 'utf8'));

      const memberIDs = memIDData.members.map(member => member.id);
      if (!memberIDs.includes(username)) {
        return res.status(401).json({ error: 'Authentication Failed: Invalid credentials, you must be a GDGIU Member.' });
      }

      const scraperDetails = {
        host: 'https://edusoftweb.hcmiu.edu.vn',
        signInPath: '/',
        coursePath: '/Default.aspx?page=dkmonhoc',
        credentials: {
          username: username,
          password: Edusoft_password,
        },
      };

      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      const scraper = new EdusoftScraper(page, scraperDetails);

      const timetable = await scraper.scrapeCourses();

      res.json(timetable);
    } catch (error) {
      console.error('Error during authentication process:', error);
      if (error.message === 'Sign-in failed: Invalid credentials or other error.') {
        res.status(401).json({ error: 'Authentication Failed: Invalid credentials or other error.' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  };

  taskQueue.enqueue(task);
  processQueue();
});

app.post('/api/calendar', (req, res) => {
  const task = async () => {
    let browser;
    try {
      const { username, Edusoft_password } = req.body;
      if (!username || !Edusoft_password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }
      const memIDPath = path.join(__dirname, 'storage', 'memID.json');
      const memIDData = JSON.parse(fs.readFileSync(memIDPath, 'utf8'));

      const memberIDs = memIDData.members.map(member => member.id);
      if (!memberIDs.includes(username)) {
        return res.status(401).json({ error: 'Authentication Failed: Invalid credentials, you must be a GDGIU Member.' });
      }

      const scraperDetails = {
        host: 'https://edusoftweb.hcmiu.edu.vn',
        signInPath: '/',
        calendarPath: '/Default.aspx?page=thoikhoabieu&sta=1',
        credentials: {
          username: username,
          password: Edusoft_password,
        },
      };

      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      const scraper = new EdusoftScraper(page, scraperDetails);

      const calendar = await scraper.scrapeCalendar();

      res.json(calendar);
    } catch (error) {
      console.error('Error during authentication process:', error);
      if (error.message === 'Sign-in failed: Invalid credentials or other error.') {
        res.status(401).json({ error: 'Authentication Failed: Invalid credentials or other error.' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  };

  taskQueue.enqueue(task);
  processQueue();
});

app.post('/api/finalExam', (req, res) => {
  const task = async () => {
    let browser;
    try {
      const { username, Edusoft_password } = req.body;
      if (!username || !Edusoft_password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }
      const memIDPath = path.join(__dirname, 'storage', 'memID.json');
      const memIDData = JSON.parse(fs.readFileSync(memIDPath, 'utf8'));

      const memberIDs = memIDData.members.map(member => member.id);
      if (!memberIDs.includes(username)) {
        return res.status(401).json({ error: 'Authentication Failed: Invalid credentials, you must be a GDGIU Member.' });
      }

      const scraperDetails = {
        host: 'https://edusoftweb.hcmiu.edu.vn',
        signInPath: '/',
        examPath: '/Default.aspx?page=xemlichthi',
        credentials: {
          username: username,
          password: Edusoft_password,
        },
      };

      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      const scraper = new EdusoftScraper(page, scraperDetails);

      const calendar = await scraper.scrapeExam();

      res.json(calendar);
    } catch (error) {
      console.error('Error during authentication process:', error);
      if (error.message === 'Sign-in failed: Invalid credentials or other error.') {
        res.status(401).json({ error: 'Authentication Failed: Invalid credentials or other error.' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  };

  taskQueue.enqueue(task);
  processQueue();
});

app.post('/api/auth', (req, res) => {
  const task = async () => {
    let browser;
    try {
      const { username, Edusoft_password, Blackboard_password } = req.body;

      if (!username || !Edusoft_password || !Blackboard_password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const memIDPath = path.join(__dirname, 'storage', 'memID.json');
      const memIDData = JSON.parse(fs.readFileSync(memIDPath, 'utf8'));

      const memberIDs = memIDData.members.map(member => member.id);
      if (!memberIDs.includes(username)) {
        return res.status(401).json({ error: 'Authentication Failed: Invalid credentials, you must be a GDGIU Member.' });
      }

      const EduDetails = {
        host: 'https://edusoftweb.hcmiu.edu.vn',
        signInPath: '/',
        credentials: {
          username: username,
          password: Edusoft_password,
        },
      };

      const BlackBoardDetails = {
        host: 'https://blackboard.hcmiu.edu.vn',
        signInPath: '/',
        credentials: {
          username: username,
          password: Blackboard_password,
        },
      };

      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      const authEdu = new EdusoftScraper(page, EduDetails);
      await authEdu.signIn();

      const authBB = new BlackBoardScraper(page, BlackBoardDetails);
      await authBB.signIn();

      res.status(200).json({ message: 'Authentication successful' });
    } catch (error) {
      console.error('Error during authentication process:', error);

      if (error.message === 'Sign-in failed: Invalid credentials or other error.') {
        res.status(401).json({ error: 'Authentication Failed: Invalid credentials.' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  };

  taskQueue.enqueue(task);
  processQueue();
});

app.post('/api/prerequisites', (req, res) => {
  const task = async () => {
    let browser;
    try {
      const { username, Edusoft_password } = req.body;
      if (!username || !Edusoft_password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }
      const memIDPath = path.join(__dirname, 'storage', 'memID.json');
      const memIDData = JSON.parse(fs.readFileSync(memIDPath, 'utf8'));

      const memberIDs = memIDData.members.map(member => member.id);
      if (!memberIDs.includes(username)) {
        return res.status(401).json({ error: 'Authentication Failed: Invalid credentials, you must be a GDGIU Member.' });
      }

      const scraperDetails = {
        host: 'https://edusoftweb.hcmiu.edu.vn',
        signInPath: '/',
        prerequisitesPath: '/Default.aspx?page=xemmontienquyet',
        curriculumPath: '/Default.aspx?page=ctdtkhoisv',
        credentials: {
          username: username,
          password: Edusoft_password,
        },
      };

      browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      const scraper = new EdusoftScraper(page, scraperDetails);

      const prerequisites = await scraper.scrapePrerequisites();

      res.json(prerequisites);
    } catch (error) {
      console.error('Error during authentication process:', error);
      if (error.message === 'Sign-in failed: Invalid credentials or other error.') {
        res.status(401).json({ error: 'Authentication Failed: Invalid credentials or other error.' });
      } else {
        res.status(500).json({ error: 'Internal Server Error' });
      }
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  };

  taskQueue.enqueue(task);
  processQueue();
});

async function processQueue() {
  if (taskQueue.isEmpty()) {
    return;
  }

  const task = taskQueue.dequeue();
  try {
    await task();
  } catch (error) {
    console.error('Error processing task:', error);
  }

  processQueue();
}

app.listen(port, () => {
  console.log(`HCM-IU Backend is running on port ${port}`);
});
