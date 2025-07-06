import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';  // Import Link for routing
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [softwareUsage, setSoftwareUsage] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [peakHour, setPeakHour] = useState('');
  const [lowestHour, setLowestHour] = useState('');
  const [countryCounts, setCountryCounts] = useState([]);
  const GEOCODE_API_KEY = "309640c5509c437d9b48f9e37a03653d";  // Use your OpenCage API key
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is an admin
    const isAdmin = localStorage.getItem("adminRole");

    // If the user is not an admin, redirect them to the login page
    if (isAdmin !== "true") {
      navigate("/adminlogin"); // Redirect to login page
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminRole");  // Remove the admin role from localStorage
    navigate("/adminlogin");  // Redirect to login page
  };

  useEffect(() => {
    fetchUsers();
    fetchLoginLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://loacalhost/admins/users/', { headers: {} });
      const data = await response.json();
      
      // Convert lat-long to country for each user
      const usersWithCountry = await Promise.all(data.users.map(async user => {
        let country = "Unknown";  // Default value if location is not available

        if (typeof user.location === 'string' && user.location) {
          const [lat, lon] = user.location.split(',').map(coord => parseFloat(coord.trim()));
          country = await convertLatLongToCountry(lat, lon);
      } else {
          // Handle cases where user.location is not a string or is empty
          console.error('user.location is not a valid string:', user.location);
      } 
        
        return { ...user, country };  // Add country to user data
      }));
      
      setUsers(usersWithCountry);
      setFilteredUsers(usersWithCountry);  // Initially display all users with country
      updateCountryCounts(usersWithCountry);  // Update country count for bar chart
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLoginLogs = async () => {
    try {
      const response = await fetch('http://loacalhost/admins/login-logs/', { headers: {} });
      const data = await response.json();
      
      if (Array.isArray(data.login_logs)) {
        // Aggregate logins by hour
        const aggregatedData = aggregateLoginsByHour(data.login_logs);
        
        // Find the peak (max) and lowest (min) login hours
        const { peakHour, lowestHour } = findPeakAndLowestUsage(aggregatedData);
        
        setSoftwareUsage(aggregatedData); // Update the chart with aggregated data
        setPeakHour(peakHour);
        setLowestHour(lowestHour);
      }
    } catch (err) {
      console.error("Error fetching login logs:", err);
    }
  };

  const aggregateLoginsByHour = (logs) => {
    const loginCountsByHour = {};
    logs.forEach(log => {
      const timestamp = new Date(log.timestamp);
      const hour = timestamp.getHours();  // Get the hour (0-23)
      loginCountsByHour[hour] = (loginCountsByHour[hour] || 0) + 1;
    });

    return Object.keys(loginCountsByHour).map(hour => ({
      hour: `${hour}:00`,
      loginCount: loginCountsByHour[hour],
    }));
  };

  const findPeakAndLowestUsage = (aggregatedData) => {
    let peakHour = null;
    let lowestHour = null;
    let maxLogins = -1;
    let minLogins = Infinity;

    aggregatedData.forEach(data => {
      if (data.loginCount > maxLogins) {
        maxLogins = data.loginCount;
        peakHour = data.hour;
      }
      if (data.loginCount < minLogins) {
        minLogins = data.loginCount;
        lowestHour = data.hour;
      }
    });

    return { peakHour, lowestHour };
  };

  const convertLatLongToCountry = async (lat, lon) => {
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${GEOCODE_API_KEY}`);
      if (response.data && response.data.results && response.data.results[0]) {
        return response.data.results[0].components.city+", "+response.data.results[0].components.country;
      }
    } catch (error) {
      console.error("Error fetching country data:", error);
    }
    return "Unknown Country";
  };

  const updateCountryCounts = (usersWithCountry) => {
    const counts = usersWithCountry.reduce((acc, user) => {
      acc[user.country] = (acc[user.country] || 0) + 1;
      return acc;
    }, {});

    const countryCountsArray = Object.keys(counts).map(country => ({
      country,
      userCount: counts[country],
    }));

    setCountryCounts(countryCountsArray);
  };

  const handleDateFilter = () => {
    const filtered = users.filter(user => {
      const createdAt = new Date(user.created_at);

      // Convert fromDate and toDate to UTC time
      const from = fromDate ? new Date(fromDate) : null;
      let to = toDate ? new Date(toDate) : null;

      // Set the time to the end of the day (23:59:59.999) in UTC
      if (to) {
          to.setUTCHours(23, 59, 59, 999); // Set time to 23:59:59.999 (end of the day) in UTC
      }

      // Log the UTC 'to' date
      console.log(to); 

      // Return true if the user's created_at falls within the filtered date range
      return (
          (!from || createdAt >= from) && 
          (!to || createdAt <= to)
      );
    });

    // Update the filtered users list
    setFilteredUsers(filtered);
  };

  const exportToExcel = () => {
    const usersToExport = filteredUsers.length > 0 ? filteredUsers : users;
    const fileData = usersToExport.map(user => ({
      Name: `${user.first_name} ${user.last_name}`,
      Email: user.email,
      ResumeCount: user.total_resumes,
      Location: user.country,  // Use country here instead of location
      created_at: user.created_at,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(fileData);
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, 'user_data.xlsx');
  };

  const deleteUser = async (userId) => {
    try {
      await fetch(`http://loacalhost/admins/deleteusers/${userId}`, { method: 'DELETE' });
      alert('User deleted');
      fetchUsers();  // Refresh the list after deletion
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white min-h-screen">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Logout Button */}
      <button 
        onClick={handleLogout} 
        className="absolute top-4 right-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
        Logout
      </button>

      {/* User List Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Users</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          {/* Date Range Inputs */}
          <div className="flex gap-4">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-4 py-2 border border-gray-500 rounded-md bg-gray-700 text-white"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-4 py-2 border border-gray-500 rounded-md bg-gray-700 text-white"
            />
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleDateFilter}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Filter
            </button>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Export Users
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-gray-700 shadow-lg rounded-lg">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-600">
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Name</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Email</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Resume Count</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Location</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Created At</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-t border-gray-600">
                  <td className="px-4 py-2">
                    <Link
                      to={`/user/${user.id}/resumes?username=${user.first_name} ${user.last_name}`}  // Pass the username in the query parameter
                      className="text-blue-500 hover:underline"
                    >
                      {user.first_name} {user.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.total_resumes}</td>
                  <td className="px-4 py-2">{user.country}</td>
                  <td className="px-4 py-2">{user.created_at}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => deleteUser(user.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Software Usage Section */}
      <div className="mb-8">
        <h2 className="text-xl font-medium mb-4">Software Usage Statistics</h2>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={softwareUsage}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="loginCount" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryCounts}>
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="userCount" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary of Peak/Lowest Hour */}
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4">Peak and Lowest Usage Hour</h2>
        <div className="text-lg text-white">
          <p>Peak Hour: {peakHour}</p>
          <p>Lowest Hour: {lowestHour}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
