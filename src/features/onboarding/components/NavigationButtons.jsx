import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import GradientOutlineButton from '../../../components/shared/GradientButton/GradientOutlineButton';






const NavigationButtons = ({ onBack, onContinue, isLastStep, isLoading }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 6 }}>
      {/* Back Button - Left exactly as is */}
      {onBack ? (
        <GradientOutlineButton
          disabled={isLoading}
          onClick={onBack}
          sx={{
            borderRadius: '8px', // Overrides the default 6px
            px: 4,
            py: 1,
            fontWeight: 600
          }}
        >
          &larr; Back
        </GradientOutlineButton>
      ) : (
        <Box /> // Empty box keeps the flex "space-between" layout aligned
      )}

      {/* Next / Submit Button - Now with your Gradient Theme! */}
      <Button
        variant="contained"
        disabled={isLoading}
        onClick={onContinue}
        sx={{
          background: "linear-gradient(90deg, #0FB9B1 0%, #0B8457 100%)", // ✅ Gradient applied
          color: "#000000", // ✅ Changed to black to match your theme
          textTransform: "none",
          borderRadius: "8px",
          px: 4,
          py: 1,
          minWidth: "130px",
          fontWeight: 700, // Slightly bolder looks better on gradients
          "&:hover": {
            background: "linear-gradient(90deg, #0FB9B1 20%, #0B8457 120%)",
            opacity: 0.9,
          },
          "&.Mui-disabled": {
            background: "#e5e7eb", // Turns flat gray when loading/disabled
            color: "#9ca3af",
          },
        }}
      >
        {isLoading ? (
          <CircularProgress size={24} color="inherit" />
        ) : isLastStep ? (
          "Submit Application"
        ) : (
          "Continue \u2192"
        )}
      </Button>
    </Box>
  );
};

export default NavigationButtons;

