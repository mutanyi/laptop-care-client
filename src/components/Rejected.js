import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Sidebar from "./Sidebar"; // Import the Sidebar component

const Rejected = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [rejectedJobCards, setRejectedJobCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRejectedJobCards = async () => {
      try {
        const response = await fetch("${process.env.REACT_APP_API_ENDPOINT}/jobcards?status=Rejected");
        if (!response.ok) {
          throw new Error("Failed to fetch rejected job cards");
        }
        const data = await response.json();
        setRejectedJobCards(data);
      } catch (error) {
        console.error("Error fetching rejected job cards:", error);
        enqueueSnackbar("Error fetching rejected job cards", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchRejectedJobCards();
  }, [enqueueSnackbar]);

  const handleViewDetails = (jobId) => {
    navigate(`/jobcards/${jobId}`); // Navigate to the job card details page
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar /> {/* Render the Sidebar component on the left */}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Rejected Job Cards</h2>
            {rejectedJobCards.length === 0 ? (
              <p>No rejected job cards found.</p>
            ) : (
              <ul className="space-y-4">
                {rejectedJobCards.map((job) => (
                  <li key={job.jobcard_id} className="p-4 border rounded-md shadow">
                    <h3 className="text-lg font-semibold">Job Card #{job.jobcard_id}</h3>
                    <p className="text-gray-600">Problem: {job.problem_description}</p>
                    <button
                      onClick={() => handleViewDetails(job.jobcard_id)}
                      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      View Details
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Rejected;