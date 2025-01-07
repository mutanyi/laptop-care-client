import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import Sidebar from "./Sidebar"; // Import the Sidebar component

const PendingExpanded = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [jobDetails, setJobDetails] = useState(null);
  const [diagnostic, setDiagnostic] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState(""); // To track whether it's approve or reject

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

  const handleApprove = async () => {
    try {
      const response = await fetch(`http://api.railway.internal:5000/jobcards/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "Approved", // Set the status to Approved
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve job");
      }

      enqueueSnackbar("Job approved successfully.", { variant: "success" });
      navigate("/receptionist");
    } catch (error) {
      console.error("Error approving job:", error);
      enqueueSnackbar("Error approving job", { variant: "error" });
    }
  };

  const handleReject = async () => {
    try {
      const response = await fetch(`http://api.railway.internal:5000/jobcards/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: "Rejected", // Set the status to Rejected
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject job");
      }

      enqueueSnackbar("Job rejected successfully.", { variant: "success" });
      navigate("/receptionist");
    } catch (error) {
      console.error("Error rejecting job:", error);
      enqueueSnackbar("Error rejecting job", { variant: "error" });
    }
  };

  const handleActionConfirmation = (type) => {
    setActionType(type);
    setIsModalOpen(true);
  };

  const confirmAction = () => {
    if (actionType === "approve") {
      handleApprove();
    } else if (actionType === "reject") {
      handleReject();
    }
    setIsModalOpen(false);
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
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-medium">Problem Description</h3>
              <p className="text-gray-600">{jobDetails.problem_description}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-medium">Email</h3>
              <p className="text-gray-600">{jobDetails.client_email}</p>
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

            <div className="flex justify-between mt-4">
              <button
                onClick={() => handleActionConfirmation("approve")}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleActionConfirmation("reject")}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
            </div>

            {/* Confirmation Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-4 rounded shadow-md">
                  <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
                  <p>Are you sure you want to {actionType === "approve" ? "approve" : "reject"} this job?</p>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmAction}
                      className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      {actionType === "approve" ? "Approve" : "Reject"}
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

export default PendingExpanded;