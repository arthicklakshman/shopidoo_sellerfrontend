// Shared UI pieces for the admin QUICK pages (Shopidoo teal theme).
import { useState } from 'react';
import {
  Box, Typography, Button, Popover, TextField, Stack, Card, alpha,
} from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

export const QUICK = {
  main: '#0D9488',
  dark: '#0B8457',
  soft: '#E6F6F4',
  border: '#CDEFEA',
};

export const TONES = {
  purple: { fg: '#0D9488', bg: '#E6F6F4' },
  blue: { fg: '#3B6BF6', bg: '#EAF0FF' },
  amber: { fg: '#D97706', bg: '#FEF3E2' },
  violet: { fg: '#0891B2', bg: '#E0F5F9' },
  green: { fg: '#16A34A', bg: '#E8F7EE' },
  red: { fg: '#E5484D', bg: '#FDECEC' },
  teal: { fg: '#0D9488', bg: '#E6F6F4' },
  orange: { fg: '#EA580C', bg: '#FFF0E6' },
  grey: { fg: '#64748B', bg: '#F1F5F9' },
};

export const BUCKETS = {
  new: { label: 'New', tone: 'blue' },
  processing: { label: 'Processing', tone: 'amber' },
  ready: { label: 'Ready for Dispatch', tone: 'violet' },
  out_for_delivery: { label: 'Out for Delivery', tone: 'purple' },
  delivered: { label: 'Delivered', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

export const primaryBtnSx = {
  background: 'linear-gradient(135deg, #0FB9B1 0%, #0B8457 100%)', // Shopidoo button gradient
  color: '#fff',
  textTransform: 'none',
  fontWeight: 600,
  borderRadius: '10px',
  boxShadow: 'none',
  px: 2.25,
  '&:hover': { background: 'linear-gradient(135deg, #0D9488 0%, #09704A 100%)', boxShadow: 'none' },
};

export const cardSx = {
  borderRadius: '14px',
  border: 1,
  borderColor: 'divider',
  boxShadow: 'none',
  bgcolor: 'background.paper',
};

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatINR = (v) => inr.format(Number(v) || 0);

export const formatShortINR = (v) => {
  const n = Number(v) || 0;
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  if (n >= 1e3) return `₹${(n / 1e3).toFixed(1)}K`;
  return formatINR(n);
};

export const formatDateTime = (d) => {
  if (!d) return '-';
  const dt = new Date(d);
  return `${dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}, ${dt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}`;
};

const toISO = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

export const defaultRange = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: toISO(from), to: toISO(to) };
};

export const rangeLabel = ({ from, to }) => {
  const f = (s) => new Date(`${s}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const y = new Date(`${to}T00:00:00`).getFullYear();
  return `${f(from)} – ${f(to)} ${y}`;
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export const PageHeader = ({ eyebrow, title, subtitle, actions }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-end', justifyContent: 'space-between', mb: 3 }}>
    <Box>
      {eyebrow && (
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: QUICK.main, textTransform: 'uppercase', mb: 0.75 }}>
          {eyebrow}
        </Typography>
      )}
      <Typography sx={{ fontSize: { xs: 24, md: 28 }, fontWeight: 600, lineHeight: 1.15 }}>{title}</Typography>
      {subtitle && <Typography sx={{ mt: 0.75, fontSize: 14, color: 'text.secondary' }}>{subtitle}</Typography>}
    </Box>
    {actions && <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>{actions}</Stack>}
  </Box>
);

export const StatCard = ({ label, value, change, icon: Icon, tone = 'purple', hint }) => {
  const t = TONES[tone] || TONES.purple;
  const up = Number(change) >= 0;
  return (
    <Card sx={{ ...cardSx, p: 2.25, display: 'flex', gap: 2, alignItems: 'flex-start', height: '100%' }}>
      {Icon && (
        <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: t.bg, color: t.fg, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Icon fontSize="small" />
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{label}</Typography>
        <Typography sx={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2, mt: 0.25 }}>{value}</Typography>
        {change !== null && change !== undefined ? (
          <Typography sx={{ fontSize: 12, mt: 0.5, color: 'text.secondary' }}>
            <Box component="span" sx={{ color: up ? '#16A34A' : '#E5484D', fontWeight: 600 }}>
              {up ? '+' : ''}{change}%
            </Box>{' '}vs previous period
          </Typography>
        ) : hint ? (
          <Typography sx={{ fontSize: 12, mt: 0.5, color: 'text.secondary' }}>{hint}</Typography>
        ) : null}
      </Box>
    </Card>
  );
};

export const ToneChip = ({ label, tone = 'grey', dot = true }) => {
  const t = TONES[tone] || TONES.grey;
  return (
    <Box sx={{
      display: 'inline-flex', alignItems: 'center', gap: 0.75, px: 1.1, height: 24, borderRadius: '6px',
      bgcolor: t.bg, color: t.fg, fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
    }}
    >
      {dot && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: t.fg }} />}
      {label}
    </Box>
  );
};

export const StatusChip = ({ bucket }) => {
  const b = BUCKETS[bucket] || BUCKETS.new;
  return <ToneChip label={b.label} tone={b.tone} />;
};

export const PaymentChip = ({ value }) => {
  const tone = value === 'Paid' ? 'green' : value === 'COD' ? 'orange' : 'grey';
  return <ToneChip label={value} tone={tone} dot={false} />;
};

export const DateRangeButton = ({ value, onChange }) => {
  const [anchor, setAnchor] = useState(null);
  const [draft, setDraft] = useState(value);
  return (
    <>
      <Button
        variant="outlined"
        onClick={(e) => { setDraft(value); setAnchor(e.currentTarget); }}
        startIcon={<CalendarMonthOutlinedIcon fontSize="small" />}
        endIcon={<KeyboardArrowDownIcon fontSize="small" />}
        sx={{
          textTransform: 'none', borderRadius: '10px', color: 'text.primary', borderColor: 'divider',
          bgcolor: 'background.paper', fontWeight: 500, height: 40,
        }}
      >
        {rangeLabel(value)}
      </Button>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        disableScrollLock
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Stack spacing={1.5}>
            <TextField label="From" type="date" size="small" value={draft.from} InputLabelProps={{ shrink: true }}
              onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))} />
            <TextField label="To" type="date" size="small" value={draft.to} InputLabelProps={{ shrink: true }}
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))} />
            <Stack direction="row" spacing={1}>
              {[7, 30, 90].map((days) => (
                <Button key={days} size="small" variant="outlined" sx={{ textTransform: 'none', flex: 1 }}
                  onClick={() => {
                    const to = new Date();
                    const from = new Date();
                    from.setDate(from.getDate() - (days - 1));
                    setDraft({ from: toISO(from), to: toISO(to) });
                  }}
                >
                  {days}d
                </Button>
              ))}
            </Stack>
            <Button
              sx={primaryBtnSx}
              disabled={!draft.from || !draft.to || draft.from > draft.to}
              onClick={() => { onChange(draft); setAnchor(null); }}
            >
              Apply
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

export const downloadCsv = (rows, filename) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const EmptyRow = ({ text = 'Nothing here yet.' }) => (
  <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary', fontSize: 14 }}>{text}</Box>
);

export const softBg = (theme) => alpha(QUICK.main, theme.palette.mode === 'dark' ? 0.15 : 0.06);
