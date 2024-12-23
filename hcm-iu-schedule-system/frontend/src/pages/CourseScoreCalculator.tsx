import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

const CourseScoreCalculator: React.FC = () => {
    const [inClassPercent, setInClassPercent] = useState(30);
    const [midtermPercent, setMidtermPercent] = useState(30);
    const [finalPercent, setFinalPercent] = useState(40);
    const [inClassScore, setInClassScore] = useState<number | null>(null);
    const [midtermScore, setMidtermScore] = useState<number | null>(null);
    const [finalScore, setFinalScore] = useState<number | null>(null);
    const [desiredOverall, setDesiredOverall] = useState(50);
    const [results, setResults] = useState<string[]>([]);

    const calculateScores = () => {
        let estimates: string[] = [];

        if (inClassPercent + midtermPercent + finalPercent !== 100) {
            setResults(["Error: Percentages must add up to 100%"]);
            return;
        }

        if (inClassScore !== null && midtermScore === null && finalScore === null) {
            for (let midterm = 0; midterm <= 100; midterm += 5) {
                const final = Math.max(
                    0,
                    Math.min(
                        100,
                        (desiredOverall - (inClassScore * inClassPercent) / 100 - (midterm * midtermPercent) / 100) /
                            (finalPercent / 100)
                    )
                );
                estimates.push(`Midterm: ${midterm}, Final: ${final.toFixed(2)}`);
            }
        } else if (midtermScore !== null && inClassScore === null && finalScore === null) {
            for (let inClass = 0; inClass <= 100; inClass += 5) {
                const final = Math.max(
                    0,
                    Math.min(
                        100,
                        (desiredOverall - (midtermScore * midtermPercent) / 100 - (inClass * inClassPercent) / 100) /
                            (finalPercent / 100)
                    )
                );
                estimates.push(`In-class: ${inClass}, Final: ${final.toFixed(2)}`);
            }
        } else if (finalScore !== null && inClassScore === null && midtermScore === null) {
            for (let inClass = 0; inClass <= 100; inClass += 5) {
                const midterm = Math.max(
                    0,
                    Math.min(
                        100,
                        (desiredOverall - (finalScore * finalPercent) / 100 - (inClass * inClassPercent) / 100) /
                            (midtermPercent / 100)
                    )
                );
                estimates.push(`In-class: ${inClass}, Midterm: ${midterm.toFixed(2)}`);
            }
        } else if (inClassScore !== null && midtermScore !== null && finalScore === null) {
            const final = Math.max(
                0,
                Math.min(
                    100,
                    (desiredOverall -
                        (inClassScore * inClassPercent) / 100 -
                        (midtermScore * midtermPercent) / 100) /
                        (finalPercent / 100)
                )
            );
            estimates.push(`Final: ${final.toFixed(2)}`);
        } else if (inClassScore !== null && finalScore !== null && midtermScore === null) {
            const midterm = Math.max(
                0,
                Math.min(
                    100,
                    (desiredOverall -
                        (inClassScore * inClassPercent) / 100 -
                        (finalScore * finalPercent) / 100) /
                        (midtermPercent / 100)
                )
            );
            estimates.push(`Midterm: ${midterm.toFixed(2)}`);
        } else if (midtermScore !== null && finalScore !== null && inClassScore === null) {
            const inClass = Math.max(
                0,
                Math.min(
                    100,
                    (desiredOverall -
                        (midtermScore * midtermPercent) / 100 -
                        (finalScore * finalPercent) / 100) /
                        (inClassPercent / 100)
                )
            );
            estimates.push(`In-class: ${inClass.toFixed(2)}`);
        }

        setResults(estimates);
    };

    return (
        <Card className="dark:bg-gray-800">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Score Calculator</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    Calculate your required scores for different assessments.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assessment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Percentage</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">In-Class</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <Slider
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={[inClassPercent]}
                                        onValueChange={(value:any) => setInClassPercent(value[0])}
                                        className="w-full"
                                    />
                                    <Input
                                        type="number"
                                        value={inClassPercent}
                                        onChange={(e) => setInClassPercent(Number(e.target.value))}
                                        min={0}
                                        max={100}
                                        className="w-16"
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <Input
                                    type="number"
                                    value={inClassScore ?? ''}
                                    onChange={(e) => setInClassScore(e.target.value ? Number(e.target.value) : null)}
                                    min={0}
                                    max={100}
                                    className="w-full"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Midterm</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <Slider
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={[midtermPercent]}
                                        onValueChange={(value:any) => setMidtermPercent(value[0])}
                                        className="w-full"
                                    />
                                    <Input
                                        type="number"
                                        value={midtermPercent}
                                        onChange={(e) => setMidtermPercent(Number(e.target.value))}
                                        min={0}
                                        max={100}
                                        className="w-16"
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <Input
                                    type="number"
                                    value={midtermScore ?? ''}
                                    onChange={(e) => setMidtermScore(e.target.value ? Number(e.target.value) : null)}
                                    min={0}
                                    max={100}
                                    className="w-full"
                                />
                            </td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">Final</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <Slider
                                        min={0}
                                        max={100}
                                        step={1}
                                        value={[finalPercent]}
                                        onValueChange={(value:any) => setFinalPercent(value[0])}
                                        className="w-full"
                                    />
                                    <Input
                                        type="number"
                                        value={finalPercent}
                                        onChange={(e) => setFinalPercent(Number(e.target.value))}
                                        min={0}
                                        max={100}
                                        className="w-16"
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <Input
                                    type="number"
                                    value={finalScore ?? ''}
                                    onChange={(e) => setFinalScore(e.target.value ? Number(e.target.value) : null)}
                                    min={0}
                                    max={100}
                                    className="w-full"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div className="mt-4">
                    <Label htmlFor="desiredOverall" className="text-sm font-medium text-gray-700 dark:text-gray-300">Desired Overall Score</Label>
                    <Input
                        id="desiredOverall"
                        type="number"
                        value={desiredOverall}
                        onChange={(e) => setDesiredOverall(Number(e.target.value))}
                        min={0}
                        max={100}
                        className="mt-1"
                    />
                </div>
                <Button onClick={calculateScores} className="w-full mt-6">
                    Calculate
                </Button>
                {results.length > 0 && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Results:</h2>
                        <ul className="space-y-2 list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                            {results.map((result, index) => (
                                <li key={index}>{result}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        
        </Card>
    );
};

export default CourseScoreCalculator;
