import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const MarkAttendance = () => {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { studentId: status }
    const [manualEnrollment, setManualEnrollment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get('http://localhost:5000/api/academic/subjects', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const mySubjects = data.filter(sub => sub.faculty?._id === user._id || sub.faculty === user._id);
                setSubjects(mySubjects);
            } catch (error) {
                console.error("Error fetching subjects", error);
            }
        };
        fetchSubjects();
    }, [user._id]);

    useEffect(() => {
        if (!selectedSubject) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`http://localhost:5000/api/attendance/students/${selectedSubject}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStudents(data);

                const initialAttendance = {};
                data.forEach(student => {
                    initialAttendance[student._id] = 'Present';
                });
                setAttendance(initialAttendance);
            } catch (error) {
                toast.error('Error fetching students');
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [selectedSubject]);

    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleAddManualStudent = async () => {
        if (!manualEnrollment.trim()) return;

        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`http://localhost:5000/api/attendance/student/${manualEnrollment}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Check if student already in list
            if (students.find(s => s._id === data._id)) {
                toast.info('Student already in list');
                return;
            }

            setStudents(prev => [...prev, data]);
            setAttendance(prev => ({ ...prev, [data._id]: 'Present' }));
            setManualEnrollment('');
            toast.success(`Added ${data.user.name}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Student not found');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const records = Object.keys(attendance).map(studentId => ({
                student: studentId,
                status: attendance[studentId]
            }));

            const payload = {
                subjectId: selectedSubject,
                date,
                records
            };

            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/attendance/mark', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Attendance marked successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error marking attendance');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">Mark Attendance</h1>
                        <p className="text-gray-500 mt-2">Select a subject to begin marking student attendance.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Controls Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Session Info</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                    <select
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={selectedSubject}
                                        onChange={e => setSelectedSubject(e.target.value)}
                                    >
                                        <option value="">-- Select Subject --</option>
                                        {subjects.map(sub => (
                                            <option key={sub._id} value={sub._id}>{sub.name} ({sub.code})</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {selectedSubject && (
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Add Extra Student</h3>
                                <div className="space-y-3">
                                    <p className="text-xs text-gray-500">Manually add students who aren't in this department/semester.</p>
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Enrollment No"
                                            className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                                            value={manualEnrollment}
                                            onChange={(e) => setManualEnrollment(e.target.value)}
                                        />
                                        <button
                                            onClick={handleAddManualStudent}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition shadow-md"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Student List Section */}
                    <div className="lg:col-span-2">
                        {!selectedSubject ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No Subject Selected</h3>
                                <p className="text-gray-500">Pick a subject from the side panel to see the student roster.</p>
                            </div>
                        ) : loading ? (
                            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Fetching student list...</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                                    <h3 className="font-bold text-gray-800">Student Roster ({students.length})</h3>
                                    <div className="flex items-center space-x-4">
                                        <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                            Present: {Object.values(attendance).filter(v => v === 'Present').length}
                                        </span>
                                        <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                                            Absent: {Object.values(attendance).filter(v => v === 'Absent').length}
                                        </span>
                                    </div>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-100">
                                            <thead className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-bold tracking-widest">
                                                <tr>
                                                    <th className="px-6 py-4 text-left">Student Info</th>
                                                    <th className="px-6 py-4 text-left">Detail</th>
                                                    <th className="px-6 py-4 text-center">Attendance Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {students.map(student => (
                                                    <tr key={student._id} className="hover:bg-gray-50/80 transition">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900">{student.user?.name}</div>
                                                            <div className="text-xs text-indigo-600 font-mono font-bold tracking-tight">{student.enrollmentNo}</div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            <div>Dept: {student.department}</div>
                                                            <div>Sem: {student.semester}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex justify-center space-x-3">
                                                                {['Present', 'Absent', 'Late'].map(status => (
                                                                    <button
                                                                        key={status}
                                                                        type="button"
                                                                        onClick={() => handleStatusChange(student._id, status)}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${attendance[student._id] === status
                                                                            ? status === 'Present' ? 'bg-green-600 text-white shadow-md' :
                                                                                status === 'Absent' ? 'bg-red-600 text-white shadow-md' :
                                                                                    'bg-yellow-500 text-white shadow-md'
                                                                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                                            }`}
                                                                    >
                                                                        {status}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="p-6 bg-gray-50/50 border-t border-gray-100">
                                        <button
                                            type="submit"
                                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
                                        >
                                            Submit Attendance Records
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;
