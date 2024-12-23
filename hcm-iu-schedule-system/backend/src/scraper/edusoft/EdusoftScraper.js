const some = require('lodash/some');
const path = require('path');
const fs = require('fs');
class EdusoftScraper {
  constructor(page, details) {
    this.details = details;
    this.page = page;
    this.courseHashTable = new Map();
  }

  async saveRecordToFile(Record) {
    const filePath = path.join(__dirname, '../../../storage/record.json');
    fs.writeFileSync(filePath, JSON.stringify(Record, null, 2));
  }

  async handleCaptcha() {
    try {
      console.log('Attempting to find captcha element...');
      const captchaElement = await this.page.$('#ContentPlaceHolder1_ctl00_lblCapcha');
      if (captchaElement) {
        console.log('Captcha element found.');
        const captchaText = await this.page.$eval('#ContentPlaceHolder1_ctl00_lblCapcha', el => el.textContent);
        console.log('Captcha text:', captchaText);
        await this.page.type('#ContentPlaceHolder1_ctl00_txtCaptcha', captchaText);
        console.log('Typed captcha text.');
        await this.page.click('#ContentPlaceHolder1_ctl00_btnXacNhan');
        console.log('Clicked confirm button.');
        console.log('Captcha handled!');
      } else {
        console.log('No captcha found.');
      }
    } catch (error) {
      console.error('Error handling captcha:', error);
      throw error;
    }
  }

  async signIn() {
    try {
      const logoutButtonSelector = '#Header1_Logout1_lbtnLogOut';
      const logoutButtonExists = (await this.page.$(logoutButtonSelector)) !== null;
      if (logoutButtonExists) {
        await this.page.click(logoutButtonSelector);
        await this.page.waitForNavigation();
      }
      await this.page.goto(this.details.host + this.details.signInPath);
      await this.handleCaptcha();

      await this.page.waitForSelector('#ContentPlaceHolder1_ctl00_ucDangNhap_txtTaiKhoa');
      const button1Selector = '#ContentPlaceHolder1_ctl00_btnDangNhap';
      const button2Selector = '#ContentPlaceHolder1_ctl00_ucDangNhap_btnDangNhap';

      const button1Visible = await this.page.$(button1Selector) !== null;
      const button2Visible = await this.page.$(button2Selector) !== null;

      await this.page.type('#ContentPlaceHolder1_ctl00_ucDangNhap_txtTaiKhoa', this.details.credentials.username);
      await this.page.type('#ContentPlaceHolder1_ctl00_ucDangNhap_txtMatKhau', this.details.credentials.password);
      if (button1Visible) {
        await this.page.click(button1Selector);
      } else if (button2Visible) {
        await this.page.click(button2Selector);
      } else {
        throw new Error('No login button found.');
      }
      await this.page.waitForNavigation();

      const errorLabelVisible = await this.page.$('#ContentPlaceHolder1_ctl00_ucDangNhap_lblError') !== null;
      if (errorLabelVisible) {
        throw new Error('Sign-in failed: Invalid credentials or other error.');
      }

      console.log('Signed in successfully (Edusoft)!');
    } catch (error) {
      console.error('Error during sign-in attempt:', error);
      throw error;
    }
  }

  async scrapeCourses() {
    try {
      const filePath = path.join(__dirname, '../../../storage/record.json');
      if (fs.existsSync(filePath)) {
        const fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const fileDate = new Date(fileData.updatedAt.text);
        const currentDate = new Date();
        if (
          fileDate.getDate() === currentDate.getDate() &&
          fileDate.getMonth() === currentDate.getMonth() &&
          fileDate.getFullYear() === currentDate.getFullYear()
        ) {
          console.log('Returning data from file as it is up-to-date.');
          return fileData;
        }
      }

      await this.signIn();
      await this.page.goto(this.details.host + this.details.coursePath);

      const checkboxSelector = '#ContentPlaceHolder1_ctl00_pnlLocDK input[type="checkbox"]';
      if (await this.page.$(checkboxSelector)) {
        await this.page.click(checkboxSelector);
      }

      await this.page.waitForSelector('#selectKhoa');
      const universityRecord = {
        faculties: {},
        courses: {},
        updatedAt: {
          seconds: 0,
          text: 'Unknown',
        },
      };

      const faculties = await this.page.$$eval(
        '#selectKhoa option:not(:first-child):not(:nth-last-child(2)):not(:last-child)',
        (options) =>
          options.map((opt) => ({
            name: String(opt.textContent),
            value: String(opt.getAttribute('value')),
          }))
      );

      for (const faculty of faculties) {
        console.log(`Scraping [${faculty.name}]`);
        universityRecord.faculties[faculty.name] = {
          lecturers: [],
          courseLecturers: {},
        };

        await this.page.select('#selectKhoa', faculty.value);
        const res = await this.page.waitForResponse(
          'https://edusoftweb.hcmiu.edu.vn/ajaxpro/EduSoft.Web.UC.DangKyMonHoc,EduSoft.Web.ashx'
        );

        const resText = await res.text();
        if (resText.includes('Object reference not set to an instance of an object.')) {
          console.warn(`Skipping faculty: ${faculty.name}`);
          continue;
        }
        await this.page.waitForFunction('document.body.style.cursor === "default"');
        // This is where i store data to UniversityRecord object
        const courseRows = await this.page.$$eval('#divTDK > table tr', (rows) =>
          rows.map((row) => {
            const extractText = (selector) => {
              const cell = row.querySelector(selector);
              return cell ? cell.textContent.trim() : null;
            };
            return {
              code: row.querySelector('td:nth-child(1) > input')?.value || '',
              id: extractText('td:nth-child(2)'),
              name: extractText('td:nth-child(4)'),
              credits: parseInt(extractText('td:nth-child(7)')) || 0,
              classId: extractText('td:nth-child(9)'),
              capacity: parseInt(extractText('td:nth-child(10)')) || 0,
              daysOfWeek: Array.from(
                row.querySelectorAll('td:nth-child(13) .top-fline'),
                (el) => el.textContent.trim()
              ),
              begins: Array.from(
                row.querySelectorAll('td:nth-child(14) .top-fline'),
                (el) => parseInt(el.textContent.trim()) || 0
              ),
              periods: Array.from(
                row.querySelectorAll('td:nth-child(15) .top-fline'),
                (el) => parseInt(el.textContent.trim()) || 0
              ),
              rooms: Array.from(
                row.querySelectorAll('td:nth-child(16) .top-fline'),
                (el) => el.textContent.trim()
              ),
              lecturers: Array.from(
                row.querySelectorAll('td:nth-child(17) .top-fline'),
                (el) => el.textContent.trim()
              ),
            };
          })
        );

        for (const course of courseRows.filter((c) => c.capacity > 0)) {
          const lessons = course.daysOfWeek.map((day, index) => ({
            day: convertDayStringToDayNumber(day),
            room: course.rooms[index] || 'Homeless',
            begin: course.begins[index],
            periods: course.periods[index],
            lecturers: [course.lecturers[index] || 'Unknown'],
          }));

          if (!universityRecord.faculties[faculty.name].courseLecturers[course.name]) {
            universityRecord.faculties[faculty.name].courseLecturers[course.name] = [];
          }
          if (!universityRecord.courses[course.name]) {
            universityRecord.courses[course.name] = {
              items: [],
              lecturers: [],
            };
          }
          if (!some(universityRecord.courses[course.name].items, (e) => e.id === course.id)) {
            universityRecord.courses[course.name].items.push({
              ...course,
              lessons,
            });
          }
          lessons.forEach((lesson) => {
            lesson.lecturers.forEach((lecturer) => {
              if (!universityRecord.faculties[faculty.name].lecturers.includes(lecturer)) {
                universityRecord.faculties[faculty.name].lecturers.push(lecturer);
              }
              if (
                !universityRecord.faculties[faculty.name].courseLecturers[course.name].includes(
                  lecturer
                )
              ) {
                universityRecord.faculties[faculty.name].courseLecturers[course.name].push(lecturer);
              }
              if (!universityRecord.courses[course.name].lecturers.includes(lecturer)) {
                universityRecord.courses[course.name].lecturers.push(lecturer);
              }
            });
          });
        }
      }
      universityRecord.updatedAt = {
        seconds: Date.now() / 1000,
        text: new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
      }

      await this.saveRecordToFile(universityRecord);
      return universityRecord;
    } catch (error) {
      console.error('Error during scraping process:', error);
      throw error;
    }

  }

  async scrapeCalendar() {
    try {
      await this.signIn();
      await this.page.goto(this.details.host + this.details.calendarPath);

      const semesterOptions = await this.page.$$eval(
        '#ContentPlaceHolder1_ctl00_ddlChonNHHK option',
        options => options.map(option => ({ value: option.value, text: option.textContent.trim() }))
      );

      const selectedOption = semesterOptions.find(option => option.value === '20241');
      if (selectedOption) {
        console.log('Selected option:', selectedOption);
      } else {
        console.log('Option with value 20241 not found');
      }

      await this.page.select('#ContentPlaceHolder1_ctl00_ddlChonNHHK', selectedOption.value);
      await this.page.waitForSelector('#ContentPlaceHolder1_ctl00_rad_ThuTiet', { visible: true });
      await this.page.click('#ContentPlaceHolder1_ctl00_rad_ThuTiet');
      await this.page.waitForNavigation({ waitUntil: 'load' });
      await this.page.waitForSelector('#ContentPlaceHolder1_ctl00_pnlHeader > table > tbody > tr:nth-child(2)');
      const tables = await this.page.$$eval('.body-table', tables => tables.map(table => table.innerHTML));
      let results = [];
      for (let table of tables) {
        const rows = await this.page.$$eval(
          `.body-table tbody tr`,
          (rows) => rows.map(row => {
            const cells = row.querySelectorAll('td');
            return {
              code: cells[0]?.innerText.trim(),
              name: cells[1]?.innerText.trim(),
              credits: cells[3]?.innerText.trim(),
              classCode: cells[4]?.innerText.trim(),
              day: cells[8]?.innerText.trim(),
              startPeriod: cells[9]?.innerText.trim(),
              numPeriods: cells[10]?.innerText.trim(),
              room: cells[11]?.innerText.trim(),
              professor_code: cells[12]?.innerText.trim(),
              weeks: cells[13]?.innerText.trim(),
              link: "",
            };
          })
        );
        results.push(...rows);
      }

      const periodTimes = [
        "invalid", "8h00", "8h50", "9h40", "10h35",
        "11h25", "12h15", "13h15", "14h05",
        "14h55", "15h50", "16h40", "17h30"
      ];

      function generateGoogleCalendarLink(course) {
        try {
          const [startDate, endDate] = course.weeks.split('--').map(date => date.trim());
          const startTime = new Date(startDate.split('/').reverse().join('-'));
          startTime.setHours(...periodTimes[course.startPeriod].split('h').map(Number));
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + course.numPeriods * 50);

          const startDateTime = startTime.toISOString().replace(/-|:|\.\d+/g, '');
          const endDateTime = endTime.toISOString().replace(/-|:|\.\d+/g, '');

          const link = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(course.name)}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(`Course Code: ${course.code}, Professor: ${course.professor_code}`)}&location=${encodeURIComponent(course.room)}&trp=false&sprop=&sprop=name:`;

          return link;
        } catch (error) {
          console.error('Error generating Google Calendar link:', error);
          return null;
        }
      }
      results.forEach(course => {
        const link = generateGoogleCalendarLink(course);
        if (link) {
          course.link = link;
        }
      });


      // Store courses in the hash table
      results.forEach(course => {
        this.courseHashTable.set(course.code, course);
      });
      const uniqueResults = results.filter((course, index, self) =>
        index === self.findIndex((c) => (
          c.code === course.code && c.classCode === course.classCode
        ))
      );
      // console.log('Courses:', Array.from(this.courseHashTable.values()));

      return uniqueResults;
    } catch (error) {
      console.error('Error during scraping process:', error);
      throw error;
    }
  }

  async scrapeExam() {
    try {
      await this.signIn();
      await this.page.goto(this.details.host + this.details.examPath);

      await this.page.waitForSelector('#ContentPlaceHolder1_ctl00_gvXem', { visible: true });

      const rows = await this.page.$$eval('#ContentPlaceHolder1_ctl00_gvXem tbody tr', rows => {
        return rows.slice(1).map(row => {
          const cells = row.querySelectorAll('td');
          return {
            stt: cells[0]?.innerText.trim(),
            subjectCode: cells[1]?.innerText.trim(),
            subjectName: cells[2]?.innerText.trim(),
            examGroup: cells[3]?.innerText.trim(),
            numberOfParticipants: cells[4]?.innerText.trim(),
            examDate: cells[5]?.innerText.trim(),
            startTime: cells[6]?.innerText.trim(),
            room: cells[8]?.innerText.trim(),
            note: cells[9]?.innerText.trim(),
            examSession: cells[10]?.innerText.trim(),
            link: ""
          };
        });
      });

      function generateGoogleCalendarLink(exam) {
        try {
          const [day, month, year] = exam.examDate.split('/');
          const [hours, minutes] = exam.startTime.split(':');
          const startDateTime = new Date(year, month - 1, day, hours, minutes);

          if (isNaN(startDateTime.getTime())) {
            throw new Error(`Invalid date or time: ${exam.examDate} ${exam.startTime}`);
          }

          const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);

          const startFormatted = startDateTime.toISOString().replace(/-|:|\.\d+/g, '');
          const endFormatted = endDateTime.toISOString().replace(/-|:|\.\d+/g, '');

          const link = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(exam.subjectName)}&dates=${startFormatted}/${endFormatted}&details=${encodeURIComponent(`Subject Code: ${exam.subjectCode}, Exam Group: ${exam.examGroup}`)}&location=${encodeURIComponent(exam.room)}&trp=false&sprop=&sprop=name:`;

          return link;
        } catch (error) {
          console.error('Error generating Google Calendar link:', error);
          return null;
        }
      }

      rows.forEach(exam => {
        const link = generateGoogleCalendarLink(exam);
        if (link) {
          exam.link = link;
        }
      });

      const uniqueRows = rows.filter((exam, index, self) =>
        index === self.findIndex((e) => (
          e.subjectCode === exam.subjectCode && e.examGroup === exam.examGroup
        ))
      );

      return uniqueRows;
    } catch (error) {
      console.error('Error during scraping process:', error);
      throw error;
    }
  }

  async scrapePrerequisites() {
    try {
      await this.signIn(); 
  
      const mapRowsToObject = (rows) => {
        const dataMap = {};
        for (let i = 1; i < rows.length; i++) { 
          const cells = rows[i].querySelectorAll('td');
          const data = {
            stt: cells[0]?.innerText.trim(), 
            subjectCode: cells[1]?.innerText.trim(), 
            subjectName: cells[2]?.innerText.trim(), 
            requiredSubjectCode: cells[3]?.innerText.trim(), 
            requiredSubjectName: cells[4]?.innerText.trim(), 
            educationSystem: cells[5]?.innerText.trim(), 
            major: cells[6]?.innerText.trim(), 
            block: cells[7]?.innerText.trim()
          };
          if (!dataMap[data.subjectCode]) {
            dataMap[data.subjectCode] = [];
          }
          dataMap[data.subjectCode].push(data);
        }
        return dataMap;
      };
  
      // Scrape prerequisites
      await this.page.goto(`${this.details.host}${this.details.prerequisitesPath}`);
      await this.page.click('#ContentPlaceHolder1_ctl00_radLoaiTQ_0');
      await this.page.waitForSelector('#ContentPlaceHolder1_ctl00_gvDSMonHoc', { visible: true});
      const prerequisites = await this.page.$$eval('#ContentPlaceHolder1_ctl00_gvDSMonHoc tbody tr', mapRowsToObject);
  
      // Scrape recommended prior courses
      await this.page.click('#ContentPlaceHolder1_ctl00_radLoaiTQ_1');
      await this.page.waitForNavigation();
      await this.page.waitForSelector('#ContentPlaceHolder1_ctl00_gvDSMonHoc', { visible: true });
      const recommendedPriorCourses = await this.page.$$eval('#ContentPlaceHolder1_ctl00_gvDSMonHoc tbody tr', mapRowsToObject);
  
      // Scrape corequisite courses
      await this.page.click('#ContentPlaceHolder1_ctl00_radLoaiTQ_2');
      await this.page.waitForNavigation();
      await this.page.waitForSelector('#ContentPlaceHolder1_ctl00_gvDSMonHoc', { visible: true });
      const corequisiteCourses = await this.page.$$eval('#ContentPlaceHolder1_ctl00_gvDSMonHoc tbody tr', mapRowsToObject);
  
      // Scrape curriculum
      await this.page.goto(`${this.details.host}${this.details.curriculumPath}`);
      await this.page.waitForSelector('#ContentPlaceHolder1_ctl00_gvDSMonHoc', { visible: true });
      const curriculum = await this.page.$$eval('#ContentPlaceHolder1_ctl00_gvDSMonHoc tbody tr', rows => {
        const dataMap = {};
        for (let i = 1; i < rows.length; i++) { 
          const cells = rows[i].querySelectorAll('td');
          const data = {
            stt: cells[0]?.innerText.trim(),
            subjectCode: cells[1]?.innerText.trim(),
            subjectName: cells[2]?.innerText.trim(),
            credits: cells[3]?.innerText.trim(),
            requiredCredits: cells[4]?.innerText.trim(),
            year: cells[5]?.innerText.trim(),
            semester: cells[6]?.innerText.trim(),
            type: cells[7]?.innerText.trim(),
            hasStudied: cells[8]?.innerText.trim() === 'X'
          };
          if (!data.hasStudied) {
            dataMap[data.subjectCode] = data;
          }
        }
        return dataMap;
      });
  
      const graph = {
        nodes: [],
        edges: []
      };
  
      for (let key in curriculum) {
        const course = curriculum[key];
        graph.nodes.push({
          id: course.subjectCode,
          label: course.subjectName,
          data: course
        });
  
        const addEdges = (relations, type) => {
          relations.forEach(relation => {
            graph.edges.push({
              from: course.subjectCode,
              to: relation.requiredSubjectCode,
              label: type,
              data: relation
            });
          });
        };
  
        addEdges(prerequisites[course.subjectCode] || [], 'prerequisite');
        addEdges(recommendedPriorCourses[course.subjectCode] || [], 'recommended');
        addEdges(corequisiteCourses[course.subjectCode] || [], 'corequisite');
      }
  
      return graph;
    } catch (error) {
      console.error('Error during prerequisites scraping process:', error);
      throw error;
    }
  }
  
}


function convertDayStringToDayNumber(dayString) {
  const days = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 0,
  };
  return days[dayString] || -1;
}

module.exports = EdusoftScraper;