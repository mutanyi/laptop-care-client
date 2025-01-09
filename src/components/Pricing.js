import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Sidebar from "./Sidebar"; // Import the Sidebar component

const Pricing = () => {
  const [jobCards, setJobCards] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_ENDPOINT}/jobcards?status=Pricing`
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
    navigate(`/pricing/${jobCard.id}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar /> {/* Render the Sidebar component on the left */}

      <div className="flex-1 flex flex-col items-center py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Pricing Job Cards</h1>

        <div className="w-full max-w-4xl space-y-6">
          {jobCards.length > 0 ? (
            jobCards.map((jobCard) => (
              <div
                key={jobCard.id}
                className="p-6 bg-primary rounded-lg shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handleCardClick(jobCard)}
              >
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-xl font-semibold text-gray-700">
                    Job Card #{jobCard.id}
                  </h2>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {jobCard.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Device:</span> {jobCard.device_brand} {jobCard.device_model}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Problem:</span> {jobCard.problem_description || "N/A"}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Diagnostic:</span> {jobCard.diagnostic || "N/A"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No job cards in pricing stage found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Pricing;