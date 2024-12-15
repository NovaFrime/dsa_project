import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const periodTimes = [
  "8h00 - 8h50", "8h50 - 9h40", "9h40 - 10h30", "10h35 - 11h25",
  "11h25 - 12h15", "12h15 - 13h05", "13h15 - 14h05", "14h05 - 14h55",
  "14h55 - 15h45", "15h50 - 16h40", "16h40 - 17h30", "17h30 - 18h20"
];

const formatPeriodTime = (period: number) => periodTimes[period - 1];
const getBeginPeriod = (formatPeriodTime: string) => {
  return formatPeriodTime ? formatPeriodTime.slice(0, 5) : "";
};
const getEndPeriod = (formatPeriodTime: string) => {
  return formatPeriodTime ? formatPeriodTime.slice(-5) : "";
};

const UtilsPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedCourses = JSON.parse(localStorage.getItem("selectedCourses") || "[]");
    setSelectedCourses(storedCourses);
  }, []);
  const handleClearSelection = () => {
    localStorage.removeItem("selectedCourses");
    setSelectedCourses([]);
    toast({
      title: "Selection Cleared",
      description: "All selected courses have been removed.",
      variant: "destructive",
    });
  };
  const handleFetchData = async () => {
    setIsLoading(true);
    try {
      const userCredentials = JSON.parse(localStorage.getItem("userCredentials") || "{}");

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/courses`, {
        username: userCredentials.account,
        Edusoft_password: userCredentials.edusoftPassword,
      });

      const fetchedCourses = response.data.courses || {};
      const fetchedFaculties = response.data.faculties || {};

      const coursesArray = Object.keys(fetchedCourses).flatMap((key) =>
        fetchedCourses[key].items.flatMap((item: any) => {
          return item.daysOfWeek.map((day: string, index: number) => ({
            courseName: item.rooms.some((room: string) => room.includes("LA") && !item.name.includes("Lab"))
              ? `${item.name} Laboratory`
              : item.name,
            credits: item.credits,
            capacity: item.capacity,
            classId: item.classId,
            courseGroupName: key,
            room: item.rooms[index],
            lecturer: item.lecturers[index],
            day: day,
            beginPeriod: item.begins[index] ? item.begins[index].toString().padStart(2, "0") : "",
            endPeriod: item.begins[index] + item.periods[index] - 1,
            periods: `${item.begins[index]} - ${item.begins[index] + item.periods[index] - 1}`,
          }));
        })
      );

      setAllCourses(coursesArray);
      setFilteredCourses(coursesArray);

      const validFaculties = Object.keys(fetchedFaculties).filter(
        (faculty) => fetchedFaculties[faculty].lecturers.length > 0
      );
      setFaculties(validFaculties);

      toast({
        title: "Success",
        description: "Courses and faculties fetched successfully.",
      });
    } catch (error) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    const filtered = allCourses.filter((course) => {
      const matchesSearch = course.courseName && course.courseName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFaculty =
        facultyFilter === ""
          ? true
          : facultyFilter === "EFA"
            ? course.classId.startsWith("BA")
            : facultyFilter === "CEE" || facultyFilter === "CE"
              ? course.classId.startsWith("CHCE")
              : course.classId.startsWith(facultyFilter);

      return matchesSearch && matchesFaculty;
    });
    setFilteredCourses(filtered);
  };

  useEffect(() => {
    filterCourses();
  }, [searchTerm, facultyFilter, allCourses]);

  const handleSelectCourse = (course: any, isSelected: boolean) => {
    const updatedSelectedCourses = isSelected
      ? [...selectedCourses, course]
      : selectedCourses.filter((selected) => selected.classId !== course.classId);

    setSelectedCourses(updatedSelectedCourses);
    localStorage.setItem("selectedCourses", JSON.stringify(updatedSelectedCourses));
  };

  return (
    <Card className="dark:bg-gray-800 h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">All Courses Fetcher</CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">Fetch and manage your data here.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4">
          <Button onClick={handleFetchData} disabled={isLoading} className="mr-4">
            {isLoading ? "Fetching..." : "Fetch Data"}
          </Button>
          <input
            type="text"
            placeholder="Search by course name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-100"
          />
          <select
            value={facultyFilter}
            onChange={(e) => setFacultyFilter(e.target.value)}
            className="ml-4 border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-100"
            disabled={!faculties.length}
          >
            <option value="">All Faculties</option>
            {faculties.map((faculty, index) => (
              <option key={index} value={faculty.split(" - ")[0]}>
                {faculty}
              </option>
            ))}
          </select>
        </div>
        {filteredCourses.length > 0 ? (
          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full bg-white dark:bg-gray-700">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b dark:border-gray-600">Select</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600">Course Name</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600">Credits</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600">Class ID</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600">Room</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600">Lecturer</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600">Day</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600">Begin Period</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600">End Period</th>
                  <th className="py-2 px-4 border-b dark:border-gray-600">Periods</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course, index) => (
                  <tr key={index} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                    <td className="border px-4 py-2 dark:border-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedCourses.some((selected) => selected.classId === course.classId)}
                        onChange={(e) => handleSelectCourse(course, e.target.checked)}
                      />
                    </td>
                    <td className="border px-4 py-2 dark:border-gray-600">{course.courseName}</td>
                    <td className="border px-4 py-2 dark:border-gray-600">{course.credits}</td>
                    <td className="border px-4 py-2 dark:border-gray-600">{course.classId}</td>
                    <td className="border px-4 py-2 dark:border-gray-600">{course.room}</td>
                    <td className="border px-4 py-2 dark:border-gray-600">{course.lecturer}</td>
                    <td className="border px-4 py-2 dark:border-gray-600">{course.day}</td>
                    <td className="border px-4 py-2 dark:border-gray-600">
                      {getBeginPeriod(formatPeriodTime(course.beginPeriod))}
                    </td>
                    <td className="border px-4 py-2 dark:border-gray-600">
                      {getEndPeriod(formatPeriodTime(course.endPeriod))}
                    </td>
                    <td className="border px-4 py-2 dark:border-gray-600">{course.periods}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">Please try fetch the courses.</p>
        )}
        <Button onClick={handleClearSelection} className="mt-4" variant="outline" size="sm">
          Clear Selections
        </Button>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleString()}</p>
      </CardFooter>
    </Card>
  );
};

export default UtilsPanel;
