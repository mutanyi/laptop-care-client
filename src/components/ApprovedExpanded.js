import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Sidebar from "./Sidebar"; // Import the Sidebar component

const ApprovedExpanded = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [jobDetails, setJobDetails] = useState(null);
  const [diagnostic, setDiagnostic] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`http://api.railway.internal:5000/jobcards/${jobId}/details`);
        if (!response.ok) {
          throw new Error("Failed to fetch job details");
        }
        const data = await response.json();
        setJobDetails(data);
        setDiagnostic(data.diagnostic || "");
      } catch (error) {
        console.error("Error fetching job details:", error);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleSaveDiagnostic = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`http://api.railway.internal:5000/jobcards/${jobId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          diagnostic: diagnostic
        }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update diagnostic");
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating diagnostic:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForPricing = async () => {
    try {
      const response = await fetch(`http://api.railway.internal:5000/jobcards/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Pricing'
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update job status");
      }

      enqueueSnackbar("Job status updated to Pricing", { variant: "success" });
      navigate('/technician'); // Navigate to the technician dashboard
    } catch (error) {
      console.error("Error updating job status:", error);
      enqueueSnackbar("Failed to update job status", { variant: "error" });
    }
  };

  const handleConfirmSubmit = () => {
    setIsModalOpen(false);
    handleSubmitForPricing();
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar /> {/* Render the Sidebar component on the left */}

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        {jobDetails ? (
          <div className="p-6 bg-primary rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Job Card #{jobDetails.jobcard_id}</h2>
              <div className="mt-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  Submit for Pricing
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium">Problem Description</h3>
              <p className="text-gray-600">{jobDetails.problem_description}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium">Diagnostic</h3>
              {isEditing ? (
                <div className="mt-2">
                  <textarea
                    value={diagnostic}
                    onChange={(e) => setDiagnostic(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    rows="4"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleSaveDiagnostic}
                      disabled={isSaving}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setDiagnostic(jobDetails.diagnostic || "");
                      }}
                      disabled={isSaving}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-gray-600">{diagnostic || "No diagnostic information available"}</p>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Edit Diagnostic
                  </button>
                </div>
              )}
            </div>

            {/* Confirmation Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
                  <h3 className="text-lg font-bold mb-4">Confirm Submission</h3>
                  <p>Are you sure you want to submit this job card for pricing?</p>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmSubmit}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default ApprovedExpanded;