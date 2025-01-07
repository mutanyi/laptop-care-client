import * as Yup from "yup";
import { FormikStepper, InputField, SelectField } from "formik-stepper";
import "formik-stepper/dist/style.css";
import { useSnackbar } from "notistack";
import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar"; // Import the Sidebar component

const JobCardSchema = Yup.object().shape({
  clientName: Yup.string().required("Client name is required"),
  clientEmail: Yup.string().email("Invalid email").required("Client email is required"),
  clientPhone: Yup.string().required("Client phone is required"),
  clientAddress: Yup.string().required("Client address is required"),
  deviceModel: Yup.string().required("Device model is required"),
  deviceSerialNumber: Yup.string().required("Device serial number is required"),
  brand: Yup.string().required("Brand is required"),
  hddOrSsd: Yup.string().required("HDD/SSD type is required"),
  hddOrSsdSerialNumber: Yup.string().required("HDD/SSD serial number is required"),
  hddOrSsdOnboard: Yup.string().required("Onboard HDD/SSD type is required"),
  memory: Yup.string().required("Memory is required"),
  memorySerialNumber: Yup.string().required("Memory serial number is required"),
  memoryOnboard: Yup.string().required("Onboard memory type is required"),
  battery: Yup.string().required("Battery type is required"),
  batterySerialNumber: Yup.string().required("Battery serial number is required"),
  adapter: Yup.string().required("Adapter type is required"),
  adapterSerialNumber: Yup.string().required("Adapter serial number is required"),
  warrantyStatus: Yup.string().required("Warranty status is required"),
  problemDescription: Yup.string().required("Problem description is required"),
  assignedTechnician: Yup.string().required("Assigned technician id is required"),
  status: Yup.string().required("Status is required"),
  creationDate: Yup.date().required("Creation date is required"),
});

const JobCard = () => {
  const { enqueueSnackbar } = useSnackbar();
  const technicianId = localStorage.getItem("technicianId") || "";
  const [existingClient, setExistingClient] = useState(null);
  const [deviceExists, setDeviceExists] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState("");

  // Function to fetch all users with the role of technician
  const fetchTechnicians = useCallback(async () => {
    try {
      const response = await fetch("http://api.railway.internal:5000/users/technicians");
      const technicians = await response.json();
      if (response.ok) {
        setTechnicians(technicians);
      } else {
        enqueueSnackbar("Failed to fetch technicians.", { variant: "error" });
      }
    } catch (error) {
      console.error("Error fetching technicians:", error);
      enqueueSnackbar("Error fetching technicians", { variant: "error" });
    }
  }, [enqueueSnackbar]);  // Make sure any dependencies are included here
  
  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  const onClientPhoneBlur = async (phone) => {
    try {
      const response = await fetch(`http://api.railway.internal:5000/clients/search?phone_number=${phone}`);
      if (response.ok) {
        const data = await response.json();
        if (data.message === "Client not found") {
          setExistingClient(null);
        } else {
          setExistingClient(data);
          enqueueSnackbar("Existing client data found. Prefilling form.", { variant: "info" });
        }
      }
    } catch (error) {
      console.error("Error checking client phone number:", error);
      enqueueSnackbar("Error checking client phone number", { variant: "error" });
    }
  };

  const onDeviceSerialNumberBlur = async (serialNumber) => {
    try {
      const response = await fetch(`http://api.railway.internal:5000/devices/search?device_serial_number=${serialNumber}`);
      if (response.ok) {
        const data = await response.json();
        if (data.message === "Device not found") {
          setDeviceExists(null);
        } else {
          setDeviceExists(data);
          enqueueSnackbar("Existing device data found. Prefilling form.", { variant: "info" });
        }
      }
    } catch (error) {
      console.error("Error checking device serial number:", error);
      enqueueSnackbar("Error checking device serial number", { variant: "error" });
    }
  };

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      const clientId = existingClient ? existingClient.id : await createClient(values);
      const deviceId = deviceExists ? deviceExists.id : await createDevice(values, clientId);

      const jobCardResponse = await fetch("http://api.railway.internal:5000/jobcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problem_description: values.problemDescription,
          status: "Assigned",
          device_id: deviceId,
          assigned_technician_id: values.assignedTechnician,
          email_data: {
            recipient: values.clientEmail,
            subject: "Device Service Update",
            body: "Your device service is in progress.",
            client_name: values.clientName,
            device_details: {
              brand: values.brand,
              model: values.deviceModel,
              serial_number: values.deviceSerialNumber
            }
          },
          hdd_or_ssd_onboard: values.hddOrSsdOnboard, // New field
          memory_onboard: values.memoryOnboard, // New field
        }),
      });

      const jobCardData = await jobCardResponse.json();

      if (!jobCardResponse.ok) {
        if (!selectedTechnician && !technicianId) {
          enqueueSnackbar("Please assign a technician before submitting.", { variant: "warning" });
          return;
        } 
        enqueueSnackbar("Failed to submit job card.", { variant: "error" });
        return;
      }

      // Check email sending status
      if (jobCardData.email_sent) {
        enqueueSnackbar("Job card submitted successfully and email sent!", { variant: "success" });
      } else {
        enqueueSnackbar("Job card submitted, but failed to send email notification.", { variant: "warning" });
      }

      resetForm();
      setExistingClient(null); // Clear form on submit
      setDeviceExists(null);
      setSelectedTechnician(""); // Clear selected technician on submit
    } catch (error) {
      console.error("Error during job card submission:", error);
      enqueueSnackbar("An error occurred while submitting the job card.", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const createClient = async (values) => {
    const clientResponse = await fetch("http://api.railway.internal:5000/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.clientName,
        email: values.clientEmail,
        phone_number: values.clientPhone,
        address: values.clientAddress,
      }),
    });
    if (!clientResponse.ok) {
      throw new Error("Failed to create client");
    }
    const clientData = await clientResponse.json();
    return clientData.id;
  };

  const createDevice = async (values, clientId) => {
    const deviceResponse = await fetch("http://api.railway.internal:5000/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        device_serial_number: values.deviceSerialNumber,
        device_model: values.deviceModel,
        brand: values.brand,
        hdd_or_ssd: values.hddOrSsd,
        hdd_or_ssd_serial_number: values.hddOrSsdSerialNumber,
        memory: values.memory,
        memory_serial_number: values.memorySerialNumber,
        battery: values.battery,
        battery_serial_number: values.batterySerialNumber,
        adapter: values.adapter,
        adapter_serial_number: values.adapterSerialNumber,
        client_id: clientId,
        warranty_status: values.warrantyStatus,
        hdd_or_ssd_onboard: values.hddOrSsdOnboard, // New field
        memory_onboard: values.memoryOnboard, // New field
      }),
    });

    if (!deviceResponse.ok) {
      throw new Error("Failed to create device");
    }

    const deviceData = await deviceResponse.json();
    return deviceData.id;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar /> {/* Render the Sidebar component on the left */}
      <div className="flex items-center justify-center w-full">
        <div className="w-full max-w-xl p-8 bg-white rounded-lg shadow-lg">
          <FormikStepper
            onSubmit={onSubmit}
            initialValues={{
              clientName: existingClient?.name || "",
              clientEmail: existingClient?.email || "",
              clientPhone: existingClient?.phone_number || "",
              clientAddress: existingClient?.address || "",
              deviceModel: deviceExists?.device_model || "",
              deviceSerialNumber: deviceExists?.device_serial_number || "",
              brand: deviceExists?.brand || "",
              hddOrSsd: deviceExists?.hdd_or_ssd || "",
              hddOrSsdSerialNumber: deviceExists?.hdd_or_ssd_serial_number || "",
              memory: deviceExists?.memory || "",
              memorySerialNumber: deviceExists?.memory_serial_number || "",
              battery: deviceExists?.battery || "",
              batterySerialNumber: deviceExists?.battery_serial_number || "",
              adapter: deviceExists?.adapter || "",
              adapterSerialNumber: deviceExists?.adapter_serial_number || "",
              warrantyStatus: deviceExists?.warranty_status || "in_warranty",
              problemDescription: "",
              assignedTechnician: "",
              status: "Assigned",
              creationDate: new Date().toISOString(),
              hddOrSsdOnboard: "", // New field
              memoryOnboard: "", // New field
            }}
            validationSchema={JobCardSchema}
            enableReinitialize={true}
            withStepperLine
            nextButton={{
              label: "Next Step",
              className: "bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition",
            }}
            prevButton={{
              label: "Previous",
              className: "bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition",
            }}
            submitButton={{
              label: "Submit",
              className: "bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition",
            }}
          >
            {/* Step 1: Client Information */}
            <FormikStepper.Step label="Client Info" labelColor="#37bf5e" circleColor="#37bf5e">
              <div className="flex flex-col space-y-2">
                <InputField
                  name="clientPhone"
                  label="Client Phone"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onBlur={(e) => onClientPhoneBlur(e.target.value)}
                />
                <InputField
                  name="clientName"
                  label="Client Name"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!existingClient}
                />
                <InputField
                  name="clientEmail"
                  label="Email"
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!existingClient}
                />
                <InputField
                  name="clientAddress"
                  label="Client Address"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!existingClient}
                />
              </div>
            </FormikStepper.Step>

            {/* Step 2: Device Information */}
            <FormikStepper.Step label="Device Info" labelColor="#37bf5e" circleColor="#37bf5e">
              <div className="flex flex-col space-y-2">
                <InputField
                  name="deviceModel"
                  label="Device Model"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!deviceExists}
                />
                <InputField
                  name="deviceSerialNumber"
                  label="Device Serial Number"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onBlur={(e) => onDeviceSerialNumberBlur(e.target.value)}
                />
                <SelectField
                  name="brand"
                  label="Brand"
                  options={[
                    { value: "apple", label: "Apple" },
                    { value: "dell", label: "Dell" },
                    { value: "hp", label: "HP" },
                    { value: "lenovo", label: "Lenovo" },
                    { value: "asus", label: "ASUS" },
                    { value: "msi", label: "MSI" },
                    { value: "acer", label: "Acer" },
                    { value: "samsung", label: "Samsung" },
                    { value: "other", label: "Other"}
                  ]}
                  disabled={!!deviceExists}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <SelectField
                  name="hddOrSsd"
                  label="HDD or SSD"
                  options={[
                    { value: "hdd", label: "HDD" },
                    { value: "ssd", label: "SSD" },
                  ]}
                  disabled={!!deviceExists}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  name="hddOrSsdSerialNumber"
                  label="HDD/SSD Serial Number"
                  disabled={!!deviceExists}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  name="memory"
                  label="Memory"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!deviceExists}
                />
                <InputField
                  name="memorySerialNumber"
                  label="Memory Serial Number"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!deviceExists}
                />
                <SelectField
                  name="hddOrSsdOnboard"
                  label="Onboard HDD/SSD Type"
                  options={[
                    { value: "onboard", label: "Onboard" },
                    { value: "removable", label: "Removable" },
                  ]}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <SelectField
                  name="memoryOnboard"
                  label="Onboard Memory Type"
                  options={[
                    { value: "onboard", label: "Onboard" },
                    { value: "removable", label: "Removable" },
                  ]}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <SelectField
                  name="battery"
                  label="Battery Type"
                  options={[
                    { value: "lithium-ion", label: "Lithium-Ion" },
                    { value: "lithium-polymer", label: "Lithium-Polymer" },
                  ]}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!deviceExists}
                />
                <InputField
                  name="batterySerialNumber"
                  label="Battery Serial Number"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!deviceExists}
                />
                <SelectField
                  name="adapter"
                  label="Adapter Type"
                  options={[
                    { value: "standard", label: "Standard" },
                    { value: "high-power", label: "High Power" },
                  ]}
                  disabled={!!deviceExists}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <InputField
                  name="adapterSerialNumber"
                  label="Adapter Serial Number"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!deviceExists}
                />
                
              </div>
            </FormikStepper.Step>

            {/* Step 3: Problem Description */}
            <FormikStepper.Step label="Problem Description" labelColor="#37bf5e" circleColor="#37bf5e">
              <div className="flex flex-col space-y-2">
                <InputField
                  name="problemDescription"
                  label="Problem Description"
                  component="textarea"
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <SelectField
                    name="assignedTechnician"
                    label="Assigned Technician"
                    options={technicians.map((tech) => ({
                      value: tech.id,
                      label: tech.username,
                    }))}
                    onChange={(e) => setSelectedTechnician(e.target.value)}
                    fullWidth
                />
              </div>
            </FormikStepper.Step>
          </FormikStepper>
        </div>
      </div>
    </div>
  );
};

export default JobCard;