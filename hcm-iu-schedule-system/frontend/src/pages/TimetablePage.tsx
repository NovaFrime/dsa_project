import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const periodTimes = [
    "8h00 - 8h50", "8h50 - 9h40", "9h40 - 10h30", "10h35 - 11h25",
    "11h25 - 12h15", "12h15 - 13h05", "13h15 - 14h05", "14h05 - 14h55",
    "14h55 - 15h45", "15h50 - 16h40", "16h40 - 17h30", "17h30 - 18h20",
];

const days = ["Hai", "Ba", "Tư", "Năm", "Sáu", "Bảy", "CN"];

const TimetablePanel = () => {
    const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
    const [hoveredCourse, setHoveredCourse] = useState<any>(null);
    const { toast } = useToast();

    useEffect(() => {
        const storedCourses = JSON.parse(localStorage.getItem("selectedCourses") || "[]");
        setSelectedCourses(storedCourses);
    }, []);

    const clearSelection = () => {
        localStorage.removeItem("selectedCourses");
        setSelectedCourses([]);
        toast({
            title: "Selection Cleared",
            description: "All selected courses have been removed.",
            variant: "destructive",
        });
    };

    const generateTimetable = () => {
        const timetable = Array.from({ length: 7 }, () => Array(12).fill(null));
        selectedCourses.forEach((course: any) => {
            const dayIndex = days.indexOf(course.day);
            if (dayIndex === -1) return;
            const start = parseInt(course.beginPeriod) - 1;
            const end = parseInt(course.endPeriod) - 1;
            for (let i = start; i <= end; i++) {
                timetable[dayIndex][i] = course;
            }
        });
        return timetable;
    };

    // const findFreeDays = (timetable: any) => {
    //     return timetable.map((day: any) => day.every((slot: any) => slot === null));
    // };


    // useEffect(() => {
    //     const timetable = generateTimetable();
    //     const freeDaysArray = findFreeDays(timetable);
    //     setFreeDays(freeDaysArray.filter((isFree: any) => isFree).length);
    // }, [selectedCourses]);


    const renderTimetable = () => {
        const timetable = generateTimetable();

        return (
            <div className="grid grid-cols-8 gap-2 sm:grid-cols-8">
                <div className="font-semibold text-center">Time / Day</div>
                {days.map((day, index) => (
                    <div key={index} className="font-semibold text-center">
                        {day}
                    </div>
                ))}

                {/* Render Periods */}
                {periodTimes.map((time, periodIndex) => (
                    <React.Fragment key={periodIndex}>
                        <div className="font-medium text-center">{time}</div>

                        {/* Render Day's Courses */}
                        {timetable.map((day, dayIndex) => {
                            const course = day[periodIndex];
                            const isCourseInPeriod = course !== null;
                            if (isCourseInPeriod) {
                                const startPeriod = parseInt(course.beginPeriod) - 1;
                                const endPeriod = parseInt(course.endPeriod) - 1;
                                const isInThisPeriod = periodIndex >= startPeriod && periodIndex <= endPeriod;


                                return (
                                    <div
                                        key={`${dayIndex}-${periodIndex}`}
                                        className={`relative border p-2 min-h-[40px] flex justify-center items-center ${isInThisPeriod ? "bg-blue-200" : "bg-gray-50 dark:bg-gray-700 dark:border-gray-600"}`}
                                        onMouseEnter={() => setHoveredCourse(course.courseName || null)}
                                        onMouseLeave={() => setHoveredCourse(null)}
                                    >
                                        {isInThisPeriod && (
                                            <div className="w-full text-center">
                                                <p>{course.courseName}</p>
                                                <p className="text-xs">{course.room || "N/A"}</p>
                                            </div>
                                        )}
                                        {hoveredCourse === course.courseName && (
                                            <div className="absolute z-10 top-full mt-1 left-1/2 -translate-x-1/2 bg-white p-2 rounded shadow-lg text-sm border dark:bg-gray-800 dark:border-gray-600 w-max">
                                                <p className="font-semibold">{course.courseName || "N/A"}</p>
                                                <p>Room: {course.room || "N/A"}</p>
                                                <p>Instructor: {course.lecturer || "N/A"}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        key={`${dayIndex}-${periodIndex}`}
                                        className="relative border p-2 min-h-[40px] flex justify-center items-center bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                                        onMouseEnter={() => setHoveredCourse(null)}
                                        onMouseLeave={() => setHoveredCourse(null)}
                                    ></div>
                                );
                            }
                        })}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    // const handleFreeDaysChange = (e: any) => {
    //     setFreeDays(Math.min(Math.max(Number(e.target.value), 0), 7));
    // };

    return (
        <Card className="dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Create Your Timetable</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    View your selected courses for the week.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* <div className="mb-4">
                    <label
                        className="block text-sm text-gray-600 dark:text-gray-400"
                        htmlFor="free-days"
                    >
                        How many days do you want to be free from school? (Currently: {freeDays} days)
                    </label>
                    <input
                        id="free-days"
                        type="number"
                        value={freeDays}
                        onChange={handleFreeDaysChange}
                        className="mt-2 p-2 border rounded-lg w-full dark:bg-gray-700 dark:border-gray-600"
                        min={0}
                        max={7}
                    />
                </div> */}
                {selectedCourses.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">
                        You have no selected courses. Please select courses first.
                    </p>
                ) : (
                    <>
                        {renderTimetable()}
                        <Button
                            onClick={clearSelection}
                            className="mt-4"
                            variant="outline"
                            size="sm"
                        >
                            Clear Selections
                        </Button>
                    </>
                )}
            </CardContent>
            <CardFooter>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last updated: {new Date().toLocaleString()}
                </p>
            </CardFooter>
        </Card>
    );
};

export default TimetablePanel;
