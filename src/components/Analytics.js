import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { Bar, Pie } from "react-chartjs-2";
import { Link } from "react-router-dom"; 
import Sidebar from "./Sidebar"; // Import the Sidebar component

// Chart.js setup
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [jobCards, setJobCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalJobs: 0,
    statusDistribution: {},
    brandDistribution: {},
  });
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [expandedJobCard, setExpandedJobCard] = useState(null);
  const { enqueueSnackbar } = useSnackbar();


  useEffect(() => {
    const fetchJobCards = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://api.railway.internal:5000/jobcards");
        if (!response.ok) {
          throw new Error("Failed to fetch job cards");
        }
        const data = await response.json();
        setJobCards(data);

        const statusDist = data.reduce((acc, card) => {
          acc[card.status] = (acc[card.status] || 0) + 1;
          return acc;
        }, {});
        const brandDist = data.reduce((acc, card) => {
          const brand = card.device_brand || "Unknown";
          acc[brand] = (acc[brand] || 0) + 1;
          return acc;
        }, {});
        setAnalytics({
          totalJobs: data.length,
          statusDistribution: statusDist,
          brandDistribution: brandDist,
        });
      } catch (error) {
        enqueueSnackbar("Error fetching job cards.", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchJobCards();
  }, [enqueueSnackbar]);

  // Filtering job cards by selected status
  const filteredJobCards = selectedStatus
    ? jobCards.filter((card) => card.status === selectedStatus)
    : [];

  


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar /> {/* Render the Sidebar component */}

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>

            <Link
              to="/pricing"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              View Pricing Dashboard
            </Link>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full border-8 border-gray-300 border-t-blue-600 w-16 h-16"></div>
            </div>
          ) : (
            <>
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div
                  className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
                  onClick={() => setSelectedStatus(null)}
                >
                  <h3 className="text-lg font-semibold text-gray-600">Total Jobs</h3>
                  <p className="text-4xl font-bold text-blue-600">
                    {analytics.totalJobs}
                  </p>
                </div>
                {Object.entries(analytics.statusDistribution).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition"
                      onClick={() => setSelectedStatus(status)}
                    >
                      <h3 className="text-lg font-semibold text-gray-600">
                        {status}
                      </h3>
                      <p className="text-4xl font-bold text-blue-600">{count}</p>
                    </div>
                  )
                )}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {/* Job Cards by Status */}
                {selectedStatus && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">
                      Job Cards: {selectedStatus} ({filteredJobCards.length})
                    </h2>
                    <div className="space-y-6">
                      {filteredJobCards.map((card) => (
                        <div
                          key={card.id}
                          className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
                          onClick={() =>
                            setExpandedJobCard(
                              expandedJobCard === card.id ? null : card.id
                            )
                          }
                        >
                          <h3 className="text-lg font-semibold text-gray-700">
                            {card.client_name || "Client Name Not Available"}
                          </h3>
                          <p className="text-gray-600">
                            <span className="font-medium">Email:</span>{" "}
                            {card.client_email || "N/A"}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Device Model:</span>{" "}
                            {card.device_model || "N/A"}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Device Brand:</span>{" "}
                            {card.device_brand || "N/A"}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Problem Description:</span>{" "}
                            {card.problem_description || "N/A"}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Distribution Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-600 mb-4">
                    Status Distribution
                  </h3>
                  <Pie
                    data={{
                      labels: Object.keys(analytics.statusDistribution),
                      datasets: [
                        {
                          data: Object.values(analytics.statusDistribution),
                          backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                          ],
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>

                {/* Brand Distribution Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-600 mb-4">
                    Brand Distribution
                  </h3>
                  <Bar
                    data={{
                      labels: Object.keys(analytics.brandDistribution),
                      datasets: [
                        {
                          label: "Number of Devices",
                          data: Object.values(analytics.brandDistribution),
                          backgroundColor: "#36A2EB",
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;