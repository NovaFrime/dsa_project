const some = require('lodash/some');
class BlackBoardScraper
 {
  constructor(page, details) {
    this.page = page;
    this.details = details;
  }
  async signIn() {
    try {
      await this.page.goto(this.details.host + this.details.signInPath);
      await this.page.waitForSelector('#user_id');
      await this.page.type(
        '#user_id',
        this.details.credentials.username
      );
      await this.page.type(
        '#password',
        this.details.credentials.password
      );
      await this.page.click('#entry-login');
      await this.page.waitForNavigation();

      const errorLabelVisible = await this.page.$('#loginErrorMessage') !== null;
      if (errorLabelVisible) {
        throw new Error('Sign-in failed: Invalid credentials or other error.');
      }

      console.log('Signed in successfully (BlackBoard)!');
    } catch (error) {
      console.error('Error during sign-in:', error);
      throw error;
    }
  }
  async scrapeCourses() {
    try {
      await this.signIn();
      await this.page.waitForNavigation();
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
      return universityRecord;
    } catch (error) {
      console.error('Error during scraping process:', error);
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
module.exports = BlackBoardScraper
;
