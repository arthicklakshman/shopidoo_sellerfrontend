import { useState, useEffect } from "react";
import { Box, Card, Typography, Divider, useTheme, CircularProgress, IconButton, Collapse } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchSettingsOnce } from "../../../utils/settingsCache";

/**
 * ---- Fee calculation utility ----
 * Pure math. Takes whatever rates are passed in.
 * commission: flat platform fee (₹) for this order amount, taken from the seller's payout.
 * productGstRate: the product's own GST % (chosen in the product form) - used only to derive
 * the TCS taxable base, not applied as a tax on the order itself.
 * tcsRate: TCS % (from admin Settings > TCS Rate), defaults to 1% if not provided.
 */
export function calculateSettlement(orderAmount, razorpayFeeRate, gstRate, commission = 0, productGstRate = 0, tcsRate = 1) {
  // Round each deduction BEFORE summing, so "Net payout" always equals
  // orderAmount minus exactly the rounded figures shown on screen.
  const razorpayFee = round2(orderAmount * (razorpayFeeRate / 100));
  const razorpayGst = round2(razorpayFee * (gstRate / 100));
  const productGstDeduction = round2(orderAmount * (productGstRate / 100));
  const taxableBase = orderAmount - orderAmount * (productGstRate / 100);
  const tcs = round2(taxableBase * (tcsRate / 100));
  const roundedCommission = round2(commission);
  const totalDeductions = round2(razorpayFee + razorpayGst + roundedCommission + tcs);
  const netPayout = round2(orderAmount - totalDeductions);

  return {
    orderAmount: round2(orderAmount),
    razorpayFee,
    razorpayGst,
    commission: roundedCommission,
    productGstDeduction,
    taxableBase: round2(taxableBase),
    tcs,
    totalDeductions,
    netPayout,
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function formatINR(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
}

/**
 * Pulls the live Payment Gateway Fee % and GST % from admin settings.
 * IMPORTANT: field names below (paymentGatewayFee / gstRate) are a best guess
 * based on your commissionSlabs pattern - open your browser console once,
 * log the raw settings object, and confirm the actual key names your
 * backend returns for these two admin fields. Adjust the two lines marked
 * below if the names differ.
 */
function useGatewaySettings() {
  const [rates, setRates] = useState({ razorpayFeeRate: null, gstRate: null, tcsRate: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchSettingsOnce()
      .then((raw) => {
        if (!mounted) return;
        const razorpayFeeRate = Number(raw?.gatewayFee ?? 0);
        const gstRate = Number(raw?.gst ?? 0);
        const tcsRate = Number(raw?.tcsRate ?? 1);
        setRates({ razorpayFeeRate, gstRate, tcsRate });
      })
      .catch(() => {
        if (mounted) setError(true);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return { ...rates, loading, error };
}

/**
 * ---- UI component (MUI, read-only) ----
 * Usage:
 *   <SettlementBreakdown orderAmount={1000} orderId="SH1042" />
 *
 * Fee rate and GST rate are no longer editable here - they come live from
 * admin Settings > Payment Gateway Fee (%) and GST Rate (%). Change them
 * there and every seller's Wallet + Product Form updates automatically.
 */
export default function SettlementBreakdown({ orderAmount, orderId, commission = 0, productGstRate = 0 }) {
  const theme = useTheme();
  const { razorpayFeeRate, gstRate, tcsRate, loading, error } = useGatewaySettings();
  const [tcsExpanded, setTcsExpanded] = useState(false);

  if (loading) {
    return (
      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, maxWidth: 380, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={22} />
      </Card>
    );
  }

  if (error || razorpayFeeRate == null) {
    return (
      <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, maxWidth: 380 }}>
        <Typography variant="body2" color="text.secondary">
          Unable to load settlement rates. Please try again later.
        </Typography>
      </Card>
    );
  }

  const s = calculateSettlement(orderAmount, razorpayFeeRate, gstRate, commission, productGstRate, tcsRate);

  const rows = [
    { label: "Order amount", value: s.orderAmount, isDeduction: false },
    { label: `Razorpay gateway fee (${razorpayFeeRate}%)`, value: s.razorpayFee, isDeduction: true },
    { label: `GST on gateway fee (${gstRate}%)`, value: s.razorpayGst, isDeduction: true },
    { label: "Platform Fee", value: s.commission, isDeduction: true },
  ];

  return (
    <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3, maxWidth: 380 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="body1" fontWeight={700}>Bank Settlement Amount</Typography>
        {orderId && (
          <Typography variant="caption" color="text.secondary">Order #{orderId}</Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {rows.map((row) => (
          <Box key={row.label} sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">{row.label}</Typography>
            <Typography
              variant="body2"
              fontWeight={row.isDeduction ? 500 : 600}
              color={row.isDeduction ? theme.palette.error.main : "text.primary"}
            >
              {row.isDeduction ? "-" : ""}{formatINR(row.value)}
            </Typography>
          </Box>
        ))}

        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <Typography variant="body2" color="text.secondary">{`TCS (${tcsRate}%)`}</Typography>
              <IconButton
                size="small"
                onClick={() => setTcsExpanded((v) => !v)}
                aria-label="Show how TCS is calculated"
                sx={{ p: 0.25 }}
              >
                <ExpandMoreIcon
                  fontSize="small"
                  sx={{ transform: tcsExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
                />
              </IconButton>
            </Box>
            <Typography variant="body2" fontWeight={500} color={theme.palette.error.main}>
              -{formatINR(s.tcs)}
            </Typography>
          </Box>

          <Collapse in={tcsExpanded}>
            <Box sx={{ mt: 1, p: 1.25, borderRadius: 2, bgcolor: "action.hover", display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">Order amount</Typography>
                <Typography variant="caption">{formatINR(s.orderAmount)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">Less: Product GST ({productGstRate}%)</Typography>
                <Typography variant="caption">-{formatINR(s.productGstDeduction)}</Typography>
              </Box>
              <Divider sx={{ my: 0.25 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">Taxable base</Typography>
                <Typography variant="caption" fontWeight={600}>{formatINR(s.taxableBase)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="text.secondary">TCS = Taxable base × {tcsRate}%</Typography>
                <Typography variant="caption" fontWeight={600}>{formatINR(s.tcs)}</Typography>
              </Box>
            </Box>
          </Collapse>
        </Box>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="body2" fontWeight={700}>Net payout</Typography>
        <Typography variant="h6" fontWeight={800} color={theme.palette.success.main}>
          {formatINR(s.netPayout)}
        </Typography>
      </Box>
    </Card>
  );
}

