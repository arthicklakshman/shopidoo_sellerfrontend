import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Switch,
  MenuItem,
  InputLabel,
  Tooltip,
  FormHelperText,
  Autocomplete,
} from "@mui/material";

// Icons
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

// 🌟 IMPORT SERVICE
import onboardingService from "../../../features/onboarding/onboarding.service";

// Import Validation Helpers
import {
  validateRequired,
  validatePAN,
  validatePincode,
  validateGST,
} from "../../../utils/validation";

// Reusable Components
import StepWrapper from "../../../features/onboarding/components/StepWrapper";
import NavigationButtons from "../../../features/onboarding/components/NavigationButtons";

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const StyledInputLabel = ({ children, required }) => (
  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
    <InputLabel sx={{ color: "#111827", fontSize: "13px", fontWeight: 600 }}>
      {children}
    </InputLabel>
    {required && (
      <Typography
        sx={{ color: "#ef4444", ml: 0.5, fontSize: "13px", fontWeight: 600 }}
      >
        *
      </Typography>
    )}
  </Box>
);

const customInputStyles = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  "& .MuiOutlinedInput-root": {
    "& fieldset": { border: "none" },
    "&:hover fieldset": { border: "none" },
    "&.Mui-focused fieldset": { border: "1px solid #3b82f6" },
    "&.Mui-error fieldset": { border: "1px solid #ef4444" },
  },
  "& .MuiOutlinedInput-input": {
    padding: "10px 14px",
    fontSize: "14px",
    color: "#111827",
  },
};

export default function BusinessDetails({ onBack, onNext }) {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("onboarding_step_2");
    return savedData
      ? JSON.parse(savedData)
      : {
          businessName: "",
          displayStoreName: "",
          gstNumber: "",
          aadhaarNumber: "",
          panNumber: "",
          addressLine1: "",
          addressLine2: "",
          city: "",
          pincode: "",
          state: "",
        };
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    localStorage.setItem("onboarding_step_2", JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (apiError) setApiError("");
  };

  const handleContinue = async () => {
    const newErrors = {
      businessName: validateRequired(formData.businessName, "Business Name"),
      displayStoreName: validateRequired(
        formData.displayStoreName,
        "Store Name",
      ),
      aadhaarNumber: validateRequired(formData.aadhaarNumber, "Aadhaar Number"),
      panNumber: validatePAN(formData.panNumber),
      addressLine1: validateRequired(formData.addressLine1, "Address"),
      city: validateRequired(formData.city, "City"),
      pincode: validatePincode(formData.pincode),
      state: validateRequired(formData.state, "State"),
    };

    newErrors.gstNumber = validateGST(formData.gstNumber);

    const actualErrors = Object.entries(newErrors).reduce(
      (acc, [key, value]) => {
        if (value !== null && value !== undefined) acc[key] = value;
        return acc;
      },
      {},
    );

    if (Object.keys(actualErrors).length > 0) {
      setErrors(actualErrors);
      return;
    }

    try {
      setIsLoading(true);
      setApiError("");

      const sellerId = localStorage.getItem("sellerId");

      if (!sellerId) {
        setApiError("Seller ID missing. Please restart from Step 1.");
        return;
      }

      await onboardingService.updateBusinessDetails(sellerId, {
        businessName: formData.businessName,
        storeName: formData.displayStoreName,
        gstNumber: formData.gstNumber,
        aadhaarNumber: formData.aadhaarNumber,
        panNumber: formData.panNumber,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
      });

      onNext();
    } catch (err) {
      console.error("Business details save error:", err);
      setApiError(err.response?.data?.message || err.message || "Server connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        backgroundColor: "#fafafa",
        minHeight: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      {/* 🌟 FIX: Changed spacing={4} to responsive spacing={{ xs: 2, md: 4 }} */}
      <Grid
        container
        spacing={{ xs: 2, md: 4 }}
        justifyContent="center"
        maxWidth="1200px"
        mx="auto"
        alignItems="flex-start"
      >
        {/* Left Column: Info Cards */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Card
            sx={{
              borderRadius: "16px",
              backgroundColor: "#f0fdfa", 
              border: "1px solid #ccfbf1", 
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ color: "#0B8457", mb: 2 }}>
                <DomainOutlinedIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#111827", mb: 3 }}
              >
                Business Information
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {[
                  { title: "Store Name:", desc: "This is what customers will see on your storefront" },
                  { title: "Mandatory Documents:", desc: "GST number, GST certificate, and signature image are required." },
                  { title: "Documents Required:", desc: "PAN and Aadhaar needed for verification" }
                ].map((item, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Box sx={{ 
                        width: 6, height: 6, borderRadius: "50%", 
                        backgroundColor: "#0B8457", mt: 0.8, mr: 1.5, flexShrink: 0 
                    }} />
                    <Typography sx={{ color: "#4b5563", fontSize: "14px" }}>
                      <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>
                        {item.title}{" "}
                      </Box>
                      {item.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "none",
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Box sx={{ color: "#0B8457", mb: 2 }}> 
                <LocationOnOutlinedIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#111827", mb: 2 }}
              >
                Address Tips
              </Typography>
              <Typography
                sx={{ color: "#6b7280", fontSize: "13px", lineHeight: 1.5 }}
              >
                Provide your registered business address. This will be used for
                legal documentation and may be displayed to customers.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Form Card */}
        <Grid item xs={12} md={7}>
          {apiError && (
            <Box
              sx={{
                backgroundColor: "#fef2f2",
                border: "1px solid #ef4444",
                p: 2,
                borderRadius: "8px",
                mb: 3,
              }}
            >
              <Typography color="error" fontSize="14px" fontWeight="600">
                {apiError}
              </Typography>
            </Box>
          )}

          <StepWrapper>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#111827", mb: 4 }}
            >
              Business Details
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: { xs: 2.5, md: 3 }, 
                maxHeight: { xs: "none", md: "550px" }, 
                overflowY: { xs: "visible", md: "auto" },
                pr: { xs: 0, md: 2 }, 
                
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-track": { background: "transparent" },
                "&::-webkit-scrollbar-thumb": {
                  background: "#d1d5db",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb:hover": { background: "#9ca3af" },
              }}
            >
              <Box>
                <StyledInputLabel required>Business Name</StyledInputLabel>
                <TextField
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Your registered business name"
                  variant="outlined"
                  size="small"
                  error={!!errors.businessName}
                  helperText={errors.businessName}
                  sx={customInputStyles}
                />
              </Box>

              <Box>
                <StyledInputLabel required>Display Store Name</StyledInputLabel>
                <TextField
                  name="displayStoreName"
                  value={formData.displayStoreName}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Name visible to customers"
                  variant="outlined"
                  size="small"
                  error={!!errors.displayStoreName}
                  sx={customInputStyles}
                />
                {errors.displayStoreName ? (
                  <FormHelperText error>
                    {errors.displayStoreName}
                  </FormHelperText>
                ) : (
                  <Typography
                    sx={{ color: "#6b7280", fontSize: "12px", mt: 1, ml: 0.5 }}
                  >
                    This is how your store will appear to customers
                  </Typography>
                )}
              </Box>

              <Box>
                <StyledInputLabel required>GST Number</StyledInputLabel>
                <TextField
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="e.g., 22AAAAA0000A1Z5"
                  variant="outlined"
                  size="small"
                  error={!!errors.gstNumber}
                  helperText={errors.gstNumber}
                  sx={customInputStyles}
                />
              </Box>

              <Box>
                <StyledInputLabel required>Aadhaar Number</StyledInputLabel>
                <TextField
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="12-digit Aadhaar number"
                  variant="outlined"
                  size="small"
                  error={!!errors.aadhaarNumber}
                  helperText={errors.aadhaarNumber}
                  sx={customInputStyles}
                />
              </Box>

              <Box>
                <StyledInputLabel required>PAN Number</StyledInputLabel>
                <TextField
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="e.g., ABCDE1234F"
                  variant="outlined"
                  size="small"
                  error={!!errors.panNumber}
                  helperText={errors.panNumber}
                  sx={customInputStyles}
                />
              </Box>

              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#111827", mt: 2, mb: 1 }}
              >
                Business Address
              </Typography>

              <Box>
                <StyledInputLabel required>Address Line 1</StyledInputLabel>
                <TextField
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Building name, street"
                  variant="outlined"
                  size="small"
                  error={!!errors.addressLine1}
                  helperText={errors.addressLine1}
                  sx={customInputStyles}
                />
              </Box>

              <Box>
                <StyledInputLabel>Address Line 2</StyledInputLabel>
                <TextField
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Landmark (optional)"
                  variant="outlined"
                  size="small"
                  sx={customInputStyles}
                />
              </Box>

              {/* 🌟 FIX: Applied responsive spacing to this nested inner grid as well */}
              <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                <Grid item xs={12} sm={6}>
                  <StyledInputLabel required>City</StyledInputLabel>
                  <TextField
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="City"
                    variant="outlined"
                    size="small"
                    error={!!errors.city}
                    helperText={errors.city}
                    sx={customInputStyles}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledInputLabel required>Pincode</StyledInputLabel>
                  <TextField
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="6-digit pincode"
                    variant="outlined"
                    size="small"
                    error={!!errors.pincode}
                    helperText={errors.pincode}
                    sx={customInputStyles}
                  />
                </Grid>
              </Grid>

              <Box>
                <StyledInputLabel required>State</StyledInputLabel>
                <Autocomplete
                  options={INDIAN_STATES}
                  value={formData.state || null}
                  onChange={(event, newValue) => {
                    handleInputChange({
                      target: { name: "state", value: newValue || "" },
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search and select state"
                      variant="outlined"
                      size="small"
                      error={!!errors.state}
                      helperText={errors.state}
                      sx={customInputStyles}
                    />
                  )}
                />
              </Box>
            </Box>

            <Box sx={{ mt: { xs: 3, md: 4 } }}>
              <NavigationButtons
                onBack={onBack}
                onContinue={handleContinue}
                isLoading={isLoading}
                isLastStep={false}
              />
            </Box>
          </StepWrapper>
        </Grid>
      </Grid>
    </Box>
  );
}