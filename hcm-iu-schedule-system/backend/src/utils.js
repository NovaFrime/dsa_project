
const Univerisity = {
    HCMIU: 'HCMIU',

};

const DayOfWeek = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
};

const NotificationType = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success',
};

const ScraperDetails = {
    university: Univerisity.HCMIU,
    host: 'https://edusoftweb.hcmiu.edu.vn',
    signInPath: '/',
    coursePath: '/Default.aspx?page=dkmonhoc',
    credentials: {
        username: '',
        password: '',
    },
    sensitiveTimes: [
        {
            from: { hour: 0, minute: 30 },
            to: { hour: 3, minute: 0 },
        },
    ],
};

class Scraper {
    constructor(page, details) {
        this.page = page;
        this.details = details;
    }

    async scrape() {

        return null;
    }
}

const UniversityRecord = {
    faculties: {},
    courses: {},
    updatedAt: { seconds: 0, text: 'Unknown' },
};

const FacultyRecord = {
    lecturers: [],
    courseLecturers: {},
};


const CourseRecord = {
    items: [],
    lecturers: [],
};


const UniversityStorage = {
    [Univerisity.HCMIU]: undefined,
};


const Notification = {
    type: NotificationType.INFO,
    title: 'Sample Notification',
    message: 'This is a message',
    status: 'success',
    isShowed: false,
};


const TimetableType = [
    [
        {
            code: 'CS101',
            id: '1',
            name: 'Computer Science 101',
            credits: 3,
            capacity: 30,
            classId: 'CS101-01',
            lessons: [
                {
                    day: DayOfWeek.MONDAY,
                    room: 'LA101',
                    begin: 8,
                    periods: 2,
                    lecturers: ['Dr. Smith'],
                },
            ],
            color: 'red',
        },
    ],
];

const Course = {
    code: 'CS101',
    id: '1',
    name: 'Computer Science 101',
    credits: 3,
    capacity: 30,
    classId: 'CS101-01',
    lessons: [
        {
            day: DayOfWeek.MONDAY,
            room: 'LA101',
            begin: 8,
            periods: 2,
            lecturers: ['Dr. Smith'],
        },
    ],
};

const Lesson = {
    day: DayOfWeek.MONDAY,
    room: 'LA101',
    begin: 8,
    periods: 2,
    lecturers: ['Dr. Smith'],
};

