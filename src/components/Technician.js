import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const Technician = () => {
  const [jobCards, setJobCards] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate(); // Use navigate from react-router-dom

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const technicianId = localStorage.getItem("id"); // Assuming user_id is stored in localStorage

        if (!technicianId) {
          enqueueSnackbar("User not logged in", { variant: "error" });
          return;
        }

        const response = await fetch(
          `http://127.0.0.1:5000/jobcards?status=Pending&assigned_technician_id=${technicianId}`
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
    navigate(`/jobcard/${jobCard.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Pending Job Cards</h1>

      <div className="w-full max-w-4xl space-y-6">
        {jobCards.length > 0 ? (
          jobCards.map((jobCard, index) => (
            <div
              key={index}
              className="p-6 bg-primary rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleCardClick(jobCard)}
            >
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {jobCard.client_name || "Client Name Not Available"}
              </h2>
              <p className="text-gray-600"><span className="font-medium">Email:</span> {jobCard.client_email || "N/A"}</p>
              <p className="text-gray-600"><span className="font-medium">Status:</span> {jobCard.status}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-600">No pending job cards found.</p>
        )}
      </div>
    </div>
  );
};

export default Technician;
