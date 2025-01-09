import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Sidebar from './Sidebar'; // Import the Sidebar component

const Invoice = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [jobDetails, setJobDetails] = useState(null);
  const [items, setItems] = useState([
    { type: 'service', description: '', price: '' }
  ]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const addItem = (type) => {
    setItems([...items, { type, description: '', price: '' }]);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
  };

  const handleGenerateInvoice = async () => {
    setIsGenerating(true);
    try {
      const totalCost = calculateTotal();
      
      // Prepare invoice data in the required format
      const invoiceData = {
        jobcard_id: jobDetails.jobcard_id,
        client_name: jobDetails.client_name,

        client_email: jobDetails.client_email,
        client_phone: jobDetails.client_phone,
        device_info: `${jobDetails.device_brand} ${jobDetails.device_model}`,
        diagnostic: jobDetails.diagnostic,
        items: items.map(item => ({
          type: item.type,
          description: item.description,
          price: parseFloat(item.price),
          quantity: 1
        })),
        total: totalCost
      };

      // Send invoice data to the server
      const response = await fetch('${process.env.REACT_APP_API_ENDPOINT}/jobcards/generate-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      // Update jobcard status to Completed
      const updateResponse = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/jobcards/${jobId}/update`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          cost: totalCost
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update job card status');
      }

      // The response should be the PDF file
      const pdfBlob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(pdfBlob);
      
      // Open PDF in a new tab
      window.open(pdfUrl, '_blank');

      enqueueSnackbar('Invoice generated and job completed successfully', { variant: 'success' });
      navigate('/pricing');
    } catch (error) {
      console.error('Error generating invoice:', error);
      enqueueSnackbar(error.message || 'Failed to generate invoice', { variant: 'error' });
    } finally {
      setIsGenerating(false);
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar /> {/* Render the Sidebar component on the left */}

      <div className="flex-1 flex flex-col items-center py-8">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Generate Invoice</h1>
            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Back
            </button>
          </div>

          {jobDetails && (
            <>
              {/* Client and Device Information */}
              <div className="mb-8 grid grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-semibold mb-2">Client Information</h2>
                  <p><span className="font-medium">Name:</span> {jobDetails.client_name}</p>
                  <p><span className="font-medium">Email:</span> {jobDetails.client_email}</p>
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">Device Information</h2>
                  <p>{jobDetails.device_brand} {jobDetails.device_model}</p>
                </div>
              </div>

              {/* Diagnostic Information */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Diagnostic</h2>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="whitespace-pre-wrap">{jobDetails.diagnostic}</p>
                </div>
              </div>

              {/* Invoice Items */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Invoice Items</h2>
                  <div className="space-x-2">
                    <button
                      onClick={() => addItem('service')}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                      Add Service
                    </button>
                    <button
                      onClick={() => addItem('part')}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                    >
                      Add Part
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-4 items-start">
                      <select
                        value={item.type}
                        onChange={(e) => updateItem(index, 'type', e.target.value)}
                        className="p-2 border rounded-md w-32"
                      >
                        <option value="service">Service</option>
                        <option value="part">Part</option>
                      </select>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="p-2 border rounded-md flex-1"
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(index, 'price', e.target.value)}
                        placeholder="Price"
                        className="p-2 border rounded-md w-32"
                      />
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-right">
                  <p className="text-xl font-semibold">
                    Total: KsH.{calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={items.length === 0 || isGenerating}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isGenerating ? 'Generating...' : 'Generate Invoice'}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4">Confirm Invoice Generation</h2>
              <p className="mb-6">
                Are you sure you want to generate and send the invoice to {jobDetails?.client_email}?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateInvoice}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isGenerating ? 'Generating...' : 'Yes, Generate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;