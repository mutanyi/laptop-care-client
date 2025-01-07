import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Sidebar from "./Sidebar"; // Import the Sidebar component


const Approved = () => {
  const [jobCards, setJobCards] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate(); // Use navigate from react-router-dom
   // Get user info if needed

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const technicianId = localStorage.getItem("id"); // Assuming user_id is stored in localStorage

        if (!technicianId) {
          enqueueSnackbar("User not logged in", { variant: "error" });
          return;
        }

        const response = await fetch(
          `http://api.railway.internal:5000/jobcards?status=Approved&assigned_technician_id=${technicianId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job cards");
        }

        const data = await response.json();
        setJobCards(data);
      } catch (error) {
        console.error("Error fetching job cards:", error);
        enqueueSnackbar("Error fetching job cards.", { variant: "error" });
      }
    };

    fetchJobCards();
  }, [enqueueSnackbar]);

  const handleCardClick = (jobCard) => {
    // Navigate to the JobCardExpanded route with the job ID
    navigate(`/approved/${jobCard.id}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar /> {/* Render the Sidebar component */}

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Approved Job Cards</h1>

        <div className="w-full max-w-4xl space-y-6">
          {jobCards.length > 0 ? (
            jobCards.map((jobCard, index) => (
              <div
                key={index}
                className="p-6 bg-primary rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handleCardClick(jobCard)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Job Card #{jobCard.id}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    jobCard.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                    jobCard.status === 'pricing' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {jobCard.status}
                  </span>
                </div>
                <p className="text-gray-600">
                  <span className="font-medium">Problem:</span> {jobCard.problem_description || "N/A"}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No Approved job cards found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Approved;