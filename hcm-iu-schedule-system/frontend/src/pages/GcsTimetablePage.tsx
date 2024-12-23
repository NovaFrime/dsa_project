import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Course {
    code: string;
    name: string;
    credits: string;
    classCode: string;
    day: string;
    startPeriod: string;
    numPeriods: string;
    room: string;
    professor_code: string;
    weeks: string;
    link: string;
}

const GcsTimetablePage: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const requestInProgress = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const fetchCourses = async () => {
            if (requestInProgress.current) return;
            requestInProgress.current = true;

            try {
                const userCredentials = JSON.parse(localStorage.getItem("userCredentials") || "{}");

                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/calendar`, {
                    username: userCredentials.account,
                    Edusoft_password: userCredentials.edusoftPassword,
                });
                setCourses(response.data);

                if (isMounted) {
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to fetch data');
                    setLoading(false);
                    toast({
                        title: "Error",
                        description: "Failed to fetch courses.",
                        variant: "destructive",
                    });
                }
            } finally {
                requestInProgress.current = false;
                setLoading(false);
            }
        };

        fetchCourses();

        return () => {
            isMounted = false;
        };
    }, [toast]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Card className="dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Timetable</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    View your timetable for the semester.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Day</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {courses.map((course) => (
                            <tr key={course.code}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{course.code}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{course.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{course.day}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{course.startPeriod}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{course.room}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <a href={course.link} target="_blank" rel="noopener noreferrer">
                                        <button className="text-blue-500 hover:underline">View</button>
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
            <CardFooter>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last updated: {new Date().toLocaleString()}
                </p>
            </CardFooter>
        </Card>
    );
};

export default GcsTimetablePage;