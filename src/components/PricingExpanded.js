import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Sidebar from "./Sidebar"; // Import the Sidebar component

const PricingExpanded = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [jobDetails, setJobDetails] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/jobcards/${jobId}/details`);
        if (!response.ok) {
          throw new Error("Failed to fetch job details");
        }
        const data = await response.json();
        setJobDetails(data);
      } catch (error) {
        console.error("Error fetching job details:", error);
        enqueueSnackbar("Error fetching job details", { variant: "error" });
      }
    };

    fetchJobDetails();
  }, [jobId, enqueueSnackbar]);

  const handleGenerateInvoice = () => {
    navigate(`/invoice/${jobId}`);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar /> {/* Render the Sidebar component on the left */}

      <div className="flex-1 flex flex-col items-center py-8">
        {jobDetails ? (
          <div className="p-6 bg-primary rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Job Card #{jobDetails.jobcard_id}</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Back to Pricing
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Client Information</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-gray-600">
                    <span className="font-medium">Name:</span> {jobDetails.client_name}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {jobDetails.client_email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Phone:</span> {jobDetails.client_phone || "N/A"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Device Information</h3>
                <p className="text-gray-600">
                  {jobDetails.device_brand} {jobDetails.device_model}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Problem Description</h3>
                <p className="text-gray-600">{jobDetails.problem_description}</p>
              </div>

              <div>
                <h3 className="text-lg font-medium">Diagnostic</h3>
                <div className="mt-2 bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-600 whitespace-pre-wrap">{jobDetails.diagnostic || "No diagnostic information"}</p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={handleGenerateInvoice}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default PricingExpanded;