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

interface Exam {
    examDate: string;
    examGroup: string;
    examSession: string;
    link: string;
    note: string;
    numberOfParticipants: string;
    room: string;
    startTime: string;
    stt: string;
    subjectCode: string;
    subjectName: string;
}

const GcsExamPage: React.FC = () => {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const requestInProgress = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const fetchExams = async () => {
            if (requestInProgress.current) return;
            requestInProgress.current = true;

            try {
                const userCredentials = JSON.parse(localStorage.getItem("userCredentials") || "{}");

                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/finalExam`, {
                    username: userCredentials.account,
                    Edusoft_password: userCredentials.edusoftPassword,
                });
                setExams(response.data);

                if (isMounted) {
                    setLoading(false);
                }
            } catch (error) {
                if (isMounted) {
                    setError('Failed to fetch data');
                    setLoading(false);
                    toast({
                        title: "Error",
                        description: "Failed to fetch exams.",
                        variant: "destructive",
                    });
                }
            } finally {
                requestInProgress.current = false;
                setLoading(false);
            }
        };

        fetchExams();

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
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Exam Schedule</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    View your exam schedule for the semester.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Link</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {exams.map((exam) => (
                            <tr key={exam.stt}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{exam.subjectCode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exam.subjectName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exam.examDate}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exam.startTime}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{exam.room}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    <a href={exam.link} target="_blank" rel="noopener noreferrer">
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

export default GcsExamPage;