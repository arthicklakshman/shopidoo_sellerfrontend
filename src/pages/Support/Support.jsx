// import { useEffect, useMemo, useState } from 'react';
// import { useTheme, alpha } from '@mui/material';
// import {
//   Alert,
//   Box,
//   Button,
//   Card,
//   CardContent,
//   Chip,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   Grid,
//   IconButton,
//   MenuItem,
//   Skeleton,
//   Stack,
//   TextField,
//   Typography,
// } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
// import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
// import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
// import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
// import CloseIcon from '@mui/icons-material/Close';
// import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
// import { useDispatch } from 'react-redux';
// import EmptyState from '../../components/common/EmptyState/EmptyState';
// import { sellerService } from '../../services/seller.service';
// import { formatDate, formatDateTime } from '../../utils/formatDate';
// import { getErrorMessage } from '../../utils/getErrorMessage';
// import { showToast } from '../../features/ui/uiSlice';

// const INITIAL_FORM = {
//   subject: '',
//   category: '',
//   priority: '',
//   description: '',
// };

// const CATEGORY_OPTIONS = [
//   'Product Issues',
//   'Payment Issues',
//   'Order Issues',
//   'Delivery Issues',
//   'Inventory Issues',
//   'Account Issues',
//   'Technical Support',
// ];

// const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

// const statusChipSx = (theme) => ({
//   Open: { bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark },
//   'In Progress': { bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.dark },
//   Resolved: { bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark },
// });

// const priorityChipSx = (theme) => ({
//   Low: { bgcolor: theme.palette.action.hover, color: theme.palette.text.secondary },
//   Medium: { bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark },
//   High: { bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.dark },
// });

// const FALLBACK_SUMMARY = { open: 0, inProgress: 0, resolved: 0 };

// const normalizeTicket = (ticket = {}) => ({
//   id: ticket.id ?? ticket.display_id ?? `${ticket.subject || 'ticket'}-${ticket.created_at || 'new'}`,
//   subject: ticket.subject || 'Untitled Ticket',
//   status: ticket.status || 'Open',
//   priority: ticket.priority || 'Low',
//   category: ticket.category || 'General',
//   display_id: ticket.display_id || ticket.ticket_id || 'Ticket',
//   description: typeof ticket.description === 'string' ? ticket.description : '',
//   message_count: Number.isFinite(ticket.message_count) ? ticket.message_count : (ticket.reply ? 2 : 1),
//   created_at: ticket.created_at || null,
//   updated_at: ticket.updated_at || ticket.created_at || null,
//   reply: typeof ticket.reply === 'string' ? ticket.reply : '',
// });

// const SummaryCard = ({ title, value, icon: Icon, tint }) => {
//   const theme = useTheme();
//   return (
//     <Card sx={{ borderRadius: 4, height: '100%' }}>
//       <CardContent sx={{ p: 3 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
//           <Box>
//             <Typography color="text.secondary" sx={{ mb: 1 }}>{title}</Typography>
//             <Typography variant="h4" fontWeight={700}>{value}</Typography>
//           </Box>
//           <Box
//             sx={{
//               width: 68,
//               height: 68,
//               borderRadius: 3,
//               display: 'grid',
//               placeItems: 'center',
//               bgcolor: alpha(tint.color, 0.1),
//               color: tint.color,
//             }}
//           >
//             <Icon />
//           </Box>
//         </Box>
//       </CardContent>
//     </Card>
//   );
// };

// const TicketCard = ({ ticket, onOpen, onDelete, deleting }) => {
//   const theme = useTheme();
//   const STATUS_STYLES = statusChipSx(theme);
//   const PRIORITY_STYLES = priorityChipSx(theme);

//   return (
//     <Card
//       variant="outlined"
//       onClick={() => onOpen(ticket)}
//       sx={{
//         borderRadius: 3,
//         cursor: 'pointer',
//         transition: 'transform 0.2s ease, box-shadow 0.2s ease',
//         '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
//       }}
//     >
//       <CardContent sx={{ p: 3 }}>
//         <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
//           <Box sx={{ minWidth: 0 }}>
//             <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
//               <Typography variant="h6" fontWeight={700}>{ticket.subject}</Typography>
//               <Chip label={ticket.status} size="small" sx={{ ...(STATUS_STYLES[ticket.status] || STATUS_STYLES.Open), fontWeight: 700 }} />
//               <Chip label={ticket.priority} size="small" sx={{ ...(PRIORITY_STYLES[ticket.priority] || PRIORITY_STYLES.Low), fontWeight: 700 }} />
//             </Stack>
//             <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
//               <Typography color="text.secondary">{ticket.display_id}</Typography>
//               <Typography color="text.secondary">•</Typography>
//               <Typography color="text.secondary">{ticket.category}</Typography>
//               <Typography color="text.secondary">•</Typography>
//               <Typography color="text.secondary">{ticket.message_count} message{ticket.message_count > 1 ? 's' : ''}</Typography>
//             </Stack>
//             <Typography color="text.secondary" sx={{ mt: 1.5 }}>
//               {ticket.description.length > 140 ? `${ticket.description.slice(0, 140)}...` : (ticket.description || 'No description provided.')}
//             </Typography>
//           </Box>
//           <Box sx={{ minWidth: { md: 185 } }}>
//             <Typography color="text.secondary" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
//               Created: {ticket.created_at ? formatDate(ticket.created_at) : 'N/A'}
//             </Typography>
//             <Typography color="text.secondary" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
//               Updated: {ticket.updated_at ? formatDate(ticket.updated_at) : 'N/A'}
//             </Typography>
//             <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: 1.5 }}>
//               <Button
//                 color="error"
//                 variant="text"
//                 size="small"
//                 startIcon={<DeleteOutlineRoundedIcon />}
//                 disabled={deleting}
//                 onClick={(event) => {
//                   event.stopPropagation();
//                   onDelete(ticket);
//                 }}
//                 sx={{ textTransform: 'none', fontWeight: 600 }}
//               >
//                 Delete
//               </Button>
//             </Box>
//           </Box>
//         </Box>
//       </CardContent>
//     </Card>
//   );
// };

// const Support = () => {
//   const theme = useTheme();
//   const STATUS_STYLES = statusChipSx(theme);
//   const PRIORITY_STYLES = priorityChipSx(theme);

//   const dispatch = useDispatch();
//   const [tickets, setTickets] = useState([]);
//   const [summary, setSummary] = useState(FALLBACK_SUMMARY);
//   const [loading, setLoading] = useState(true);
//   const [fetchError, setFetchError] = useState('');
//   const [createOpen, setCreateOpen] = useState(false);
//   const [detailsOpen, setDetailsOpen] = useState(false);
//   const [selectedTicket, setSelectedTicket] = useState(null);
//   const [deleteOpen, setDeleteOpen] = useState(false);
//   const [ticketToDelete, setTicketToDelete] = useState(null);
//   const [form, setForm] = useState(INITIAL_FORM);
//   const [formError, setFormError] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [deletingTicketId, setDeletingTicketId] = useState(null);

//   const stats = useMemo(() => ([
//     {
//       title: 'Open Tickets',
//       value: summary.open || 0,
//       icon: AccessTimeOutlinedIcon,
//       tint: { color: theme.palette.warning.main },
//     },
//     {
//       title: 'In Progress',
//       value: summary.inProgress || 0,
//       icon: ChatBubbleOutlineRoundedIcon,
//       tint: { color: theme.palette.info.main },
//     },
//     {
//       title: 'Resolved',
//       value: summary.resolved || 0,
//       icon: CheckCircleOutlineRoundedIcon,
//       tint: { color: theme.palette.success.main },
//     },
//   ]), [summary, theme.palette]);

//   const loadTickets = async () => {
//     setLoading(true);
//     setFetchError('');
//     try {
//       const { data } = await sellerService.getSupportTickets();
//       const normalizedTickets = Array.isArray(data?.data?.tickets)
//         ? data.data.tickets.map(normalizeTicket)
//         : [];
//       setTickets(normalizedTickets);
//       setSummary(data?.data?.summary || FALLBACK_SUMMARY);
//     } catch (error) {
//       setFetchError(getErrorMessage(error));
//       setTickets([]);
//       setSummary(FALLBACK_SUMMARY);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadTickets();
//   }, []);

//   const handleFormChange = (key) => (event) => {
//     setForm((prev) => ({ ...prev, [key]: event.target.value }));
//   };

//   const resetForm = () => {
//     setForm(INITIAL_FORM);
//     setFormError('');
//   };

//   const handleCreateClose = () => {
//     if (submitting) return;
//     setCreateOpen(false);
//     resetForm();
//   };

//   const handleSubmit = async () => {
//     if (!form.subject.trim() || !form.category || !form.priority || !form.description.trim()) {
//       setFormError('Please fill in all required ticket details.');
//       return;
//     }

//     setSubmitting(true);
//     setFormError('');
//     try {
//       const { data } = await sellerService.createSupportTicket({
//         subject: form.subject.trim(),
//         category: form.category,
//         priority: form.priority,
//         description: form.description.trim(),
//       });

//       const newTicket = normalizeTicket(data?.data);
//       dispatch(showToast({ message: `Ticket ${newTicket.display_id} created successfully.`, severity: 'success' }));
//       handleCreateClose();
//       await loadTickets();
//       setSelectedTicket(newTicket);
//       setDetailsOpen(true);
//     } catch (error) {
//       setFormError(getErrorMessage(error));
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const openDeleteDialog = (ticket) => {
//     setTicketToDelete(ticket);
//     setDeleteOpen(true);
//   };

//   const closeDeleteDialog = () => {
//     if (deletingTicketId) return;
//     setDeleteOpen(false);
//     setTicketToDelete(null);
//   };

//   const handleDelete = async () => {
//     if (!ticketToDelete?.id) return;

//     setDeletingTicketId(ticketToDelete.id);
//     try {
//       await sellerService.deleteSupportTicket(ticketToDelete.id);
//       setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketToDelete.id));

//       if (selectedTicket?.id === ticketToDelete.id) {
//         setSelectedTicket(null);
//         setDetailsOpen(false);
//       }

//       dispatch(showToast({
//         message: `${ticketToDelete.display_id} deleted successfully.`,
//         severity: 'success',
//       }));

//       setDeleteOpen(false);
//       setTicketToDelete(null);
//       await loadTickets();
//     } catch (error) {
//       dispatch(showToast({ message: getErrorMessage(error), severity: 'error' }));
//     } finally {
//       setDeletingTicketId(null);
//     }
//   };

//   return (
//     <Box>
//       <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, mb: 4 }}>
//         <Box>
//           <Typography variant="h4" fontWeight={700} gutterBottom color="text.primary">Support</Typography>
//           <Typography color="text.secondary">Get help and manage support tickets</Typography>
//         </Box>
//         <Button
//   variant="contained"
//   startIcon={<AddIcon />}
//   onClick={() => setCreateOpen(true)}
//   sx={{
//   background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
//   color: '#000',
//   '&:hover': {
//     background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
//     color: '#000',
//   },
// }}
// >
//   Raise Ticket
// </Button>
//       </Box>

//       <Grid container spacing={3} sx={{ mb: 4 }}>
//         {loading
//           ? Array.from({ length: 3 }).map((_, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <Skeleton variant="rounded" height={148} />
//             </Grid>
//           ))
//           : stats.map((stat) => (
//             <Grid item xs={12} md={4} key={stat.title}>
//               <SummaryCard {...stat} />
//             </Grid>
//           ))}
//       </Grid>

//       <Card sx={{ borderRadius: 4 }}>
//         <CardContent sx={{ p: { xs: 2, md: 3 } }}>
//           <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>My Tickets</Typography>

//           {fetchError && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}

//           {loading ? (
//             <Stack spacing={2}>
//               {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} variant="rounded" height={138} />)}
//             </Stack>
//           ) : tickets.length === 0 ? (
//             <EmptyState
//               icon={ConfirmationNumberOutlinedIcon}
//               title="No support tickets yet"
//               description="Create your first support ticket and our team can follow up from there."
//               actionLabel="Raise Ticket"
//               onAction={() => setCreateOpen(true)}
//             />
//           ) : (
//             <Stack spacing={2}>
//               {tickets.map((ticket) => (
//                 <TicketCard
//                   key={ticket.id}
//                   ticket={ticket}
//                   deleting={deletingTicketId === ticket.id}
//                   onOpen={(value) => {
//                     setSelectedTicket(value);
//                     setDetailsOpen(true);
//                   }}
//                   onDelete={openDeleteDialog}
//                 />
//               ))}
//             </Stack>
//           )}
//         </CardContent>
//       </Card>

//       <Dialog open={createOpen} onClose={handleCreateClose} fullWidth maxWidth="sm">
//         <DialogTitle sx={{ px: 4, pt: 3, pb: 1 }}>
//           <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
//             <Box>
//               <Typography variant="h4" fontWeight={700}>Raise Support Ticket</Typography>
//               <Typography color="text.secondary" sx={{ mt: 0.5 }}>
//                 Describe your issue and our support team will assist you.
//               </Typography>
//             </Box>
//             <IconButton onClick={handleCreateClose} disabled={submitting}>
//               <CloseIcon />
//             </IconButton>
//           </Box>
//         </DialogTitle>
//         <DialogContent sx={{ px: 4, pb: 2 }}>
//           {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
//           <Stack spacing={2.5} sx={{ mt: 1 }}>
//             <Box>
//               <Typography fontWeight={600} sx={{ mb: 1 }}>Subject</Typography>
//               <TextField
//                 fullWidth
//                 placeholder="Brief description of your issue"
//                 value={form.subject}
//                 onChange={handleFormChange('subject')}
//               />
//             </Box>

//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <Typography fontWeight={600} sx={{ mb: 1 }}>Category</Typography>
//                 <TextField
//                   select
//                   fullWidth
//                   value={form.category}
//                   onChange={handleFormChange('category')}
//                   placeholder="Select category"
//                 >
//                   {CATEGORY_OPTIONS.map((category) => (
//                     <MenuItem key={category} value={category}>{category}</MenuItem>
//                   ))}
//                 </TextField>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Typography fontWeight={600} sx={{ mb: 1 }}>Priority</Typography>
//                 <TextField
//                   select
//                   fullWidth
//                   value={form.priority}
//                   onChange={handleFormChange('priority')}
//                   placeholder="Select priority"
//                 >
//                   {PRIORITY_OPTIONS.map((priority) => (
//                     <MenuItem key={priority} value={priority}>{priority}</MenuItem>
//                   ))}
//                 </TextField>
//               </Grid>
//             </Grid>

//             <Box>
//               <Typography fontWeight={600} sx={{ mb: 1 }}>Description</Typography>
//               <TextField
//                 fullWidth
//                 multiline
//                 rows={5}
//                 placeholder="Provide detailed information about your issue"
//                 value={form.description}
//                 onChange={handleFormChange('description')}
//               />
//             </Box>
//           </Stack>
//         </DialogContent>
//         <DialogActions sx={{ px: 4, pb: 3 }}>
//           <Button onClick={handleCreateClose} color="inherit" disabled={submitting}>Cancel</Button>
//           <Button 
//             onClick={handleSubmit} 
//             variant="contained" 
//             disabled={submitting}
//             sx={{
//               background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
//               color: '#000',
//               fontWeight: 600,
//               textTransform: 'none',
//               borderRadius: '8px',
//               '&:hover': {
//                 background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
//               }
//             }}
//           >
//             {submitting ? 'Submitting...' : 'Submit Ticket'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm">
//         <DialogTitle sx={{ px: 3, pt: 3 }}>
//           <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
//             <Box>
//               <Typography variant="h5" fontWeight={700}>Ticket Details</Typography>
//               <Typography color="text.secondary" sx={{ mt: 0.5 }}>
//                 {selectedTicket?.display_id}
//               </Typography>
//             </Box>
//             <IconButton onClick={() => setDetailsOpen(false)}>
//               <CloseIcon />
//             </IconButton>
//           </Box>
//         </DialogTitle>
//         <DialogContent sx={{ px: 3, pb: 2 }}>
//           {selectedTicket && (
//             <Stack spacing={2}>
//               <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
//                 <Chip label={selectedTicket.status} sx={{ ...(STATUS_STYLES[selectedTicket.status] || STATUS_STYLES.Open), fontWeight: 700 }} />
//                 <Chip label={selectedTicket.priority} sx={{ ...(PRIORITY_STYLES[selectedTicket.priority] || PRIORITY_STYLES.Low), fontWeight: 700 }} />
//                 <Chip label={selectedTicket.category} variant="outlined" />
//               </Stack>

//               <Box>
//                 <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
//                 <Typography variant="h6" fontWeight={700}>{selectedTicket.subject}</Typography>
//               </Box>

//               <Box>
//                 <Typography variant="subtitle2" color="text.secondary">Description</Typography>
//                 <Typography>{selectedTicket.description || 'No description provided.'}</Typography>
//               </Box>

//               <Box>
//                 <Typography variant="subtitle2" color="text.secondary">Created</Typography>
//                 <Typography>{selectedTicket.created_at ? formatDateTime(selectedTicket.created_at) : 'N/A'}</Typography>
//               </Box>

//               <Box>
//                 <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
//                 <Typography>{selectedTicket.updated_at ? formatDateTime(selectedTicket.updated_at) : 'N/A'}</Typography>
//               </Box>

//               {selectedTicket.reply && (
//                 <Box>
//                   <Typography variant="subtitle2" color="text.secondary">Support Reply</Typography>
//                   <Typography>{selectedTicket.reply}</Typography>
//                 </Box>
//               )}
//             </Stack>
//           )}
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 3 }}>
//           {selectedTicket && (
//             <Button
//               color="error"
//               startIcon={<DeleteOutlineRoundedIcon />}
//               onClick={() => openDeleteDialog(selectedTicket)}
//               disabled={deletingTicketId === selectedTicket.id}
//               sx={{ mr: 'auto' }}
//             >
//               Delete Ticket
//             </Button>
//           )}
//           <Button onClick={() => setDetailsOpen(false)}>Close</Button>
//         </DialogActions>
//       </Dialog>

//       <Dialog open={deleteOpen} onClose={closeDeleteDialog} fullWidth maxWidth="xs">
//         <DialogTitle>Delete Ticket</DialogTitle>
//         <DialogContent>
//           <Typography sx={{ mt: 1 }}>
//             Are you sure you want to delete {ticketToDelete?.display_id || 'this ticket'}? This will also remove it from the admin support page.
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ px: 3, pb: 3 }}>
//           <Button onClick={closeDeleteDialog} color="inherit" disabled={Boolean(deletingTicketId)}>
//             Cancel
//           </Button>
//           <Button
//             color="error"
//             variant="contained"
//             onClick={handleDelete}
//             disabled={Boolean(deletingTicketId)}
//           >
//             {deletingTicketId ? 'Deleting...' : 'Delete'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default Support;

import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { useDispatch } from 'react-redux';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import { sellerService } from '../../services/seller.service';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { showToast } from '../../features/ui/uiSlice';

const INITIAL_FORM = {
  subject: '',
  category: '',
  description: '',
};

const CATEGORY_OPTIONS = [
  'Product Issues',
  'Payment Issues',
  'Order Issues',
  'Delivery Issues',
  'Inventory Issues',
  'Account Issues',
  'Technical Support',
];


const statusChipSx = {
  Open: { bgcolor: '#FFF4E5', color: '#B45309' },
  'In Progress': { bgcolor: '#E8F1FF', color: '#1D4ED8' },
  Resolved: { bgcolor: '#EAF7EE', color: '#15803D' },
};



const FALLBACK_SUMMARY = { open: 0, inProgress: 0, resolved: 0 };

const normalizeTicket = (ticket = {}) => ({
  id: ticket.id ?? ticket.display_id ?? `${ticket.subject || 'ticket'}-${ticket.created_at || 'new'}`,
  subject: ticket.subject || 'Untitled Ticket',
  status: ticket.status || 'Open',
  category: ticket.category || 'General',
  display_id: ticket.display_id || ticket.ticket_id || 'Ticket',
  description: typeof ticket.description === 'string' ? ticket.description : '',
  message_count: Number.isFinite(ticket.message_count) ? ticket.message_count : (ticket.reply ? 2 : 1),
  created_at: ticket.created_at || null,
  updated_at: ticket.updated_at || ticket.created_at || null,
  reply: typeof ticket.reply === 'string' ? ticket.reply : '',
});

const SummaryCard = ({ title, value, icon: Icon, tint }) => (
  <Card sx={{ borderRadius: 4, height: '100%' }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography color="text.secondary" sx={{ mb: 1 }}>{title}</Typography>
          <Typography variant="h4" fontWeight={700}>{value}</Typography>
        </Box>
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: 3,
            display: 'grid',
            placeItems: 'center',
            bgcolor: tint.bg,
            color: tint.color,
          }}
        >
          <Icon />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const TicketCard = ({ ticket, onOpen, onDelete, deleting }) => (
  <Card
    variant="outlined"
    onClick={() => onOpen(ticket)}
    sx={{
      borderRadius: 3,
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
    }}
  >
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>{ticket.subject}</Typography>
            <Chip label={ticket.status} size="small" sx={{ ...(statusChipSx[ticket.status] || statusChipSx.Open), fontWeight: 700 }} />
            
          </Stack>
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Typography color="text.secondary">{ticket.display_id}</Typography>
            <Typography color="text.secondary">•</Typography>
            <Typography color="text.secondary">{ticket.category}</Typography>
            <Typography color="text.secondary">•</Typography>
            <Typography color="text.secondary">{ticket.message_count} message{ticket.message_count > 1 ? 's' : ''}</Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            {ticket.description.length > 140 ? `${ticket.description.slice(0, 140)}...` : (ticket.description || 'No description provided.')}
          </Typography>
        </Box>
        <Box sx={{ minWidth: { md: 185 } }}>
          <Typography color="text.secondary" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            Created: {ticket.created_at ? formatDate(ticket.created_at) : 'N/A'}
          </Typography>
          <Typography color="text.secondary" sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            Updated: {ticket.updated_at ? formatDate(ticket.updated_at) : 'N/A'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, mt: 1.5 }}>
            <Button
              color="error"
              variant="text"
              size="small"
              startIcon={<DeleteOutlineRoundedIcon />}
              disabled={deleting}
              onClick={(event) => {
                event.stopPropagation();
                onDelete(ticket);
              }}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Support = () => {
  const dispatch = useDispatch();
  const [tickets, setTickets] = useState([]);
  const [summary, setSummary] = useState(FALLBACK_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingTicketId, setDeletingTicketId] = useState(null);

  const stats = useMemo(() => ([
    {
      title: 'Open Tickets',
      value: summary.open || 0,
      icon: AccessTimeOutlinedIcon,
      tint: { bg: '#FFF7ED', color: '#F59E0B' },
    },
    {
      title: 'In Progress',
      value: summary.inProgress || 0,
      icon: ChatBubbleOutlineRoundedIcon,
      tint: { bg: '#EFF6FF', color: '#3B82F6' },
    },
    {
      title: 'Resolved',
      value: summary.resolved || 0,
      icon: CheckCircleOutlineRoundedIcon,
      tint: { bg: '#ECFDF5', color: '#22C55E' },
    },
  ]), [summary]);

  const loadTickets = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const { data } = await sellerService.getSupportTickets();
      const normalizedTickets = Array.isArray(data?.data?.tickets)
        ? data.data.tickets.map(normalizeTicket)
        : [];
      setTickets(normalizedTickets);
      setSummary(data?.data?.summary || FALLBACK_SUMMARY);
    } catch (error) {
      setFetchError(getErrorMessage(error));
      setTickets([]);
      setSummary(FALLBACK_SUMMARY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleFormChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setFormError('');
  };

  const handleCreateClose = () => {
    if (submitting) return;
    setCreateOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.category || !form.description.trim()) {
      setFormError('Please fill in all required ticket details.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const { data } = await sellerService.createSupportTicket({
        subject: form.subject.trim(),
        category: form.category,
        description: form.description.trim(),
      });

      const newTicket = normalizeTicket(data?.data);
      dispatch(showToast({ message: `Ticket ${newTicket.display_id} created successfully.`, severity: 'success' }));
      handleCreateClose();
      await loadTickets();
      setSelectedTicket(newTicket);
      setDetailsOpen(true);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (ticket) => {
    setTicketToDelete(ticket);
    setDeleteOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deletingTicketId) return;
    setDeleteOpen(false);
    setTicketToDelete(null);
  };

  const handleDelete = async () => {
    if (!ticketToDelete?.id) return;

    setDeletingTicketId(ticketToDelete.id);
    try {
      await sellerService.deleteSupportTicket(ticketToDelete.id);
      setTickets((prev) => prev.filter((ticket) => ticket.id !== ticketToDelete.id));

      if (selectedTicket?.id === ticketToDelete.id) {
        setSelectedTicket(null);
        setDetailsOpen(false);
      }

      dispatch(showToast({
        message: `${ticketToDelete.display_id} deleted successfully.`,
        severity: 'success',
      }));

      setDeleteOpen(false);
      setTicketToDelete(null);
      await loadTickets();
    } catch (error) {
      dispatch(showToast({ message: getErrorMessage(error), severity: 'error' }));
    } finally {
      setDeletingTicketId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>Support</Typography>
          <Typography color="text.secondary">Get help and manage support tickets</Typography>
        </Box>
        <Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={() => setCreateOpen(true)}
  sx={{
  background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
  color: '#000',
  '&:hover': {
    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
    color: '#000',
  },
}}
>
  Raise Ticket
</Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Skeleton variant="rounded" height={148} />
            </Grid>
          ))
          : stats.map((stat) => (
            <Grid item xs={12} md={4} key={stat.title}>
              <SummaryCard {...stat} />
            </Grid>
          ))}
      </Grid>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>My Tickets</Typography>

          {fetchError && <Alert severity="error" sx={{ mb: 2 }}>{fetchError}</Alert>}

          {loading ? (
            <Stack spacing={2}>
              {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} variant="rounded" height={138} />)}
            </Stack>
          ) : tickets.length === 0 ? (
            <EmptyState
              icon={ConfirmationNumberOutlinedIcon}
              title="No support tickets yet"
              description="Create your first support ticket and our team can follow up from there."
              actionLabel="Raise Ticket"
              onAction={() => setCreateOpen(true)}
            />
          ) : (
            <Stack spacing={2}>
              {tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  deleting={deletingTicketId === ticket.id}
                  onOpen={(value) => {
                    setSelectedTicket(value);
                    setDetailsOpen(true);
                  }}
                  onDelete={openDeleteDialog}
                />
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onClose={handleCreateClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ px: 4, pt: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>Raise Support Ticket</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                Describe your issue and our support team will assist you.
              </Typography>
            </Box>
            <IconButton onClick={handleCreateClose} disabled={submitting}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 2 }}>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <Box>
              <Typography fontWeight={600} sx={{ mb: 1 }}>Subject</Typography>
              <TextField
                fullWidth
                placeholder="Brief description of your issue"
                value={form.subject}
                onChange={handleFormChange('subject')}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography fontWeight={600} sx={{ mb: 1 }}>Category</Typography>
                <TextField
                  select
                  fullWidth
                  value={form.category}
                  onChange={handleFormChange('category')}
                  placeholder="Select category"
                >
                  {CATEGORY_OPTIONS.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </TextField>
              </Grid>
             
            </Grid>

            <Box>
              <Typography fontWeight={600} sx={{ mb: 1 }}>Description</Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                placeholder="Provide detailed information about your issue"
                value={form.description}
                onChange={handleFormChange('description')}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 3 }}>
          <Button onClick={handleCreateClose} color="inherit" disabled={submitting}>Cancel</Button>
          <Button
  onClick={handleSubmit}
  variant="contained"
  disabled={submitting}
  sx={{
    background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
    color: '#000',
    '&:hover': {
      background: 'linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)',
      color: '#000',
    },
  }}
>
            {submitting ? 'Submitting...' : 'Submit Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ px: 3, pt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={700}>Ticket Details</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                {selectedTicket?.display_id}
              </Typography>
            </Box>
            <IconButton onClick={() => setDetailsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          {selectedTicket && (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={selectedTicket.status} sx={{ ...(statusChipSx[selectedTicket.status] || statusChipSx.Open), fontWeight: 700 }} />
                <Chip label={selectedTicket.category} variant="outlined" />
              </Stack>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Subject</Typography>
                <Typography variant="h6" fontWeight={700}>{selectedTicket.subject}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography>{selectedTicket.description || 'No description provided.'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                <Typography>{selectedTicket.created_at ? formatDateTime(selectedTicket.created_at) : 'N/A'}</Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Last Updated</Typography>
                <Typography>{selectedTicket.updated_at ? formatDateTime(selectedTicket.updated_at) : 'N/A'}</Typography>
              </Box>

              {selectedTicket.reply && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Support Reply</Typography>
                  <Typography>{selectedTicket.reply}</Typography>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {selectedTicket && (
            <Button
              color="error"
              startIcon={<DeleteOutlineRoundedIcon />}
              onClick={() => openDeleteDialog(selectedTicket)}
              disabled={deletingTicketId === selectedTicket.id}
              sx={{ mr: 'auto' }}
            >
              Delete Ticket
            </Button>
          )}
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={closeDeleteDialog} fullWidth maxWidth="xs">
        <DialogTitle>Delete Ticket</DialogTitle>
        <DialogContent>
          <Typography sx={{ mt: 1 }}>
            Are you sure you want to delete {ticketToDelete?.display_id || 'this ticket'}? This will also remove it from the admin support page.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={closeDeleteDialog} color="inherit" disabled={Boolean(deletingTicketId)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={Boolean(deletingTicketId)}
          >
            {deletingTicketId ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Support;
