import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  InputLabel,
  FormHelperText,
} from "@mui/material";

// Icons
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import LockIcon from "@mui/icons-material/Lock";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

// 🌟 IMPORT SERVICE
import onboardingService from "../../../features/onboarding/onboarding.service";

// Reusable Components
import StepWrapper from "../../../features/onboarding/components/StepWrapper";
import NavigationButtons from "../../../features/onboarding/components/NavigationButtons";
import GradientOutlineButton from '../../../components/shared/GradientButton/GradientOutlineButton';
import ImagePreview from './ImagePreview';




// Validation & File Helpers
import {
  validateRequired,
  validateAccountNumber,
  validateIFSC,
} from "../../../utils/validation";
import { convertToBase64 } from "../../../utils/fileHelpers";

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
  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
  "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #3b82f6",
  },
  "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline": {
    border: "1px solid #ef4444",
  },
  "& .MuiOutlinedInput-input": {
    padding: "10px 14px",
    fontSize: "14px",
    color: "#111827",
  },
};

const GreenBullet = () => (
  <Box
    sx={{
      width: 6,
      height: 6,
      borderRadius: "50%",
      backgroundColor: "#059669",
      mt: 0.8,
      mr: 1.5,
      flexShrink: 0,
    }}
  />
);

export default function BankDetails({ onBack, onNext }) {
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem("onboarding_step_3");
    const parsedData = savedData ? JSON.parse(savedData) : null;


    return {
      accountName: parsedData?.accountName || "",
      accountNumber: parsedData?.accountNumber || "",
      ifscCode: parsedData?.ifscCode || "",
      bankProofImage: parsedData?.bankProofImage || "",
      documentName: parsedData?.documentName || "",
    };
  });

      const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    // 🌟 Make sure we don't save Base64 strings to localStorage to avoid QuotaExceededError
    const safeData = {
      ...formData,
      bankProofImage: formData.bankProofImage ? { name: formData.bankProofImage.name } : null
    };
    localStorage.setItem("onboarding_step_3", JSON.stringify(safeData));
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    if (apiError) setApiError("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5000000) {
      setErrors((prev) => ({
        ...prev,
        bankProofImage: "File is too large. Maximum size is 5MB.",
      }));
      return;
    }

    try {
      const base64String = await convertToBase64(file);
      setFormData((prev) => ({
        ...prev,
        bankProofImage: base64String,
        documentName: file.name,
      }));
      if (errors.bankProofImage)
        setErrors((prev) => ({ ...prev, bankProofImage: null }));
    } catch (error) {
      console.error("Error converting file to Base64:", error);
      setErrors((prev) => ({
        ...prev,
        bankProofImage: "Failed to process file.",
      }));
    }
  };

  const handleContinue = async () => {
    const newErrors = {
      accountName: validateRequired(
        formData.accountName,
        "Account Holder Name",
      ),
      accountNumber: validateAccountNumber(formData.accountNumber),
      ifscCode: validateIFSC(formData.ifscCode),
      bankProofImage: null,
    };

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

      // 🌟 USING THE SERVICE FILE
      await onboardingService.updateBankDetails(sellerId, {
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        bankProofImage: formData.bankProofImage,
      });

      onNext();
    } catch (err) {
      setApiError(err.response?.data?.message || "Server connection failed.");
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
      <Grid
        container
        spacing={4}
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
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}
              >
                <LockOutlinedIcon sx={{ color: "#047857", fontSize: 28 }} />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: "#064e3b" }}
                >
                  Secure Banking
                </Typography>
              </Box>

              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  p: 2,
                  mb: 4,
                  textAlign: "center",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <LockIcon sx={{ color: "#f59e0b", fontSize: 20 }} />
                  <Typography
                    sx={{ fontWeight: 600, color: "#059669", fontSize: "16px" }}
                  >
                    Your bank details are सुरक्षित (secure)
                  </Typography>
                </Box>
                <Typography sx={{ color: "#4b5563", fontSize: "13px" }}>
                  Your information is encrypted with bank-grade security
                </Typography>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <GreenBullet />
                  <Typography sx={{ color: "#4b5563", fontSize: "14px" }}>
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, color: "#111827" }}
                    >
                      Why we need this:{" "}
                    </Box>
                    To transfer your earnings directly to your account
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <GreenBullet />
                  <Typography sx={{ color: "#4b5563", fontSize: "14px" }}>
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, color: "#111827" }}
                    >
                      Verification:{" "}
                    </Box>
                    Micro-deposit verification for security
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <GreenBullet />
                  <Typography sx={{ color: "#4b5563", fontSize: "14px" }}>
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, color: "#111827" }}
                    >
                      Payment Cycle:{" "}
                    </Box>
                    Weekly settlements to your account
                  </Typography>
                </Box>
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
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "#111827", mb: 3 }}
              >
                Accepted Documents
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Typography sx={{ color: "#4b5563", fontSize: "14px" }}>
                  ✓ Cancelled Cheque (Preferred)
                </Typography>
                <Typography sx={{ color: "#4b5563", fontSize: "14px" }}>
                  ✓ Bank Passbook (First page)
                </Typography>
                <Typography sx={{ color: "#4b5563", fontSize: "14px" }}>
                  ✓ Bank Statement (Recent)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Form Card */}
        <Grid item xs={12} md={7}>
          <StepWrapper>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#111827", mb: 4 }}
            >
              Bank Details
            </Typography>

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

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <StyledInputLabel required>
                  Account Holder Name
                </StyledInputLabel>
                <TextField
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="As per bank records"
                  variant="outlined"
                  size="small"
                  error={!!errors.accountName}
                  helperText={errors.accountName}
                  sx={customInputStyles}
                />
              </Box>

              <Box>
                <StyledInputLabel required>
                  Bank Account Number
                </StyledInputLabel>
                <TextField
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="Enter account number"
                  variant="outlined"
                  size="small"
                  error={!!errors.accountNumber}
                  helperText={errors.accountNumber}
                  sx={customInputStyles}
                />
              </Box>

              <Box>
                <StyledInputLabel required>IFSC Code</StyledInputLabel>
                <TextField
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  fullWidth
                  placeholder="11-character IFSC code"
                  variant="outlined"
                  size="small"
                  error={!!errors.ifscCode}
                  sx={customInputStyles}
                />
                {errors.ifscCode ? (
                  <FormHelperText error>{errors.ifscCode}</FormHelperText>
                ) : (
                  <Typography
                    sx={{ color: "#6b7280", fontSize: "12px", mt: 1, ml: 0.5 }}
                  >
                    Bank name will be auto-detected
                  </Typography>
                )}
              </Box>

              <Box>
                <StyledInputLabel>
                  Cancelled Cheque / Passbook Upload
                </StyledInputLabel>
                <Box
                  component="label"
                  sx={{
                    border: "1.5px dashed",
                    borderColor: errors.bankProofImage ? "#ef4444" : "#d1d5db",
                    borderRadius: "12px",
                    p: 4,
                    textAlign: "center",
                    backgroundColor: errors.bankProofImage ? "#fef2f2" : "#fafafa",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1.5,
                    "&:hover": {
                      backgroundColor: formData.bankProofImage ? "#fafafa" : "#f3f4f6",
                      borderColor: formData.bankProofImage ? "#d1d5db" : "#9ca3af",
                      cursor: formData.bankProofImage ? "default" : "pointer",
                    },
                  }}
                >
                  {/* Hide input if file is uploaded to stop accidental clicks */}
                  {!formData.bankProofImage && (
                    <input
                      type="file"
                      hidden
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  )}

                  {formData.bankProofImage ? (
                    <>
                      <InsertDriveFileOutlinedIcon sx={{ fontSize: 36, color: "#059669" }} />
                      <Typography
                        sx={{
                          color: "#111827",
                          fontSize: "14px",
                          fontWeight: 600,
                        }}
                      >
                        {formData.documentName}
                      </Typography>
                   
                     {/* 🌟 NEW: Preview & Remove Buttons Group */}
                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                        <Button
                          variant="text" // 👈 Changed from "outlined" to "text"
                          size="small"
                          startIcon={<VisibilityOutlinedIcon />}
                          sx={{ color: '#059669', textTransform: 'none' }} // 👈 Removed borderColor
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation(); 
                            setIsPreviewOpen(true); 
                          }}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setFormData((prev) => ({
                              ...prev,
                              bankProofImage: null,
                              documentName: "",
                            }));
                          }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <FileUploadOutlinedIcon sx={{ fontSize: 36, color: errors.bankProofImage ? "#ef4444" : "#9ca3af" }} />
                      <Typography sx={{ color: errors.bankProofImage ? "#ef4444" : "#4b5563", fontSize: "14px", fontWeight: 500 }}>
                        Click to upload or drag and drop
                      </Typography>
                      <Typography sx={{ color: "#9ca3af", fontSize: "12px", mb: 1 }}>
                        PDF, JPG, PNG (Max 5MB)
                      </Typography>
                      <GradientOutlineButton size="small" component="span">
                        Choose File
                      </GradientOutlineButton>
                    </>
                  )}
                </Box>
                {errors.bankProofImage && (
                  <FormHelperText error sx={{ mt: 1, ml: 1 }}>
                    {errors.bankProofImage}
                  </FormHelperText>
                )}
              </Box>

              <Box
                sx={{
                  backgroundColor: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  borderRadius: "8px",
                  p: 2.5,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 1.5,
                }}
              >
                <LockOutlinedIcon
                  sx={{ color: "#059669", fontSize: 20, mt: 0.2 }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: "#064e3b",
                      fontSize: "14px",
                      mb: 0.5,
                    }}
                  >
                    Your data is protected
                  </Typography>
                  <Typography sx={{ color: "#047857", fontSize: "13px" }}>
                    We use 256-bit encryption to secure your banking
                    information.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <NavigationButtons
              onBack={onBack}
              onContinue={handleContinue}
              isLoading={isLoading}
              isLastStep={false}
            />
          </StepWrapper>
        </Grid>
      </Grid>

      <ImagePreview 
        open={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        fileData={formData.bankProofImage}
        fileName={formData.documentName}
      />
    </Box>
  );
}