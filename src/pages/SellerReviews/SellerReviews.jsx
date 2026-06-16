import { useState, useEffect } from 'react';
import {
  Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, IconButton, Tooltip, Pagination, Rating, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText,
  Avatar, Stack, TextField,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReplyIcon from '@mui/icons-material/Reply';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { sellerService } from '../../services/seller.service';
import { formatDate } from '../../utils/formatDate';
import { useDispatch } from 'react-redux';
import { showToast } from '../../features/ui/uiSlice';

const SkeletonRow = () => (
  <TableRow>
    {Array(6).fill(0).map((_, j) => (
      <TableCell key={j}>
        <Box sx={{ height: 20, bgcolor: 'action.hover', borderRadius: 1, width: j === 2 ? '60%' : '90%' }} />
      </TableCell>
    ))}
  </TableRow>
);

const ReviewRow = ({ review, onReply, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const hasReply = !!review.seller_reply;
  const isLongComment = review.comment?.length > 80;

  return (
    <TableRow hover sx={{ '& td': { verticalAlign: 'top', pt: 1.5 } }}>

      {/* Customer */}
      <TableCell>
        <Stack direction="row" alignItems="center" gap={1}>
          <Avatar src={review.user?.avatar} sx={{ width: 30, height: 30, fontSize: 13 }}>
            {review.user?.name?.[0] || '?'}
          </Avatar>
          <Typography variant="body2" fontWeight={500} noWrap>
            {review.user?.name || '—'}
          </Typography>
        </Stack>
      </TableCell>

      {/* Product */}
      <TableCell>
        <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>
          {review.product?.name || '—'}
        </Typography>
      </TableCell>

      {/* Rating */}
      <TableCell>
        <Rating value={review.rating} readOnly size="small" precision={0.5} />
      </TableCell>

      {/* Title */}
      <TableCell>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 120 }}>
          {review.title || '—'}
        </Typography>
      </TableCell>

      {/* Comment */}
      <TableCell sx={{ maxWidth: 220 }}>
        <Typography variant="body2" sx={{
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {review.comment || '—'}
        </Typography>
        {isLongComment && (
          <Box
            component="span"
            onClick={() => setExpanded(p => !p)}
            sx={{ fontSize: 12, color: 'primary.main', cursor: 'pointer', display: 'flex', alignItems: 'center', mt: 0.5 }}
          >
            {expanded ? <><ExpandLessIcon fontSize="inherit" /> Less</> : <><ExpandMoreIcon fontSize="inherit" /> More</>}
          </Box>
        )}
        {hasReply && (
          <Box sx={{ mt: 1, pl: 1, borderLeft: '2px solid', borderColor: 'primary.main', bgcolor: 'action.hover', borderRadius: '0 4px 4px 0', p: 0.75 }}>
            <Typography variant="caption" color="primary" fontWeight={700} display="block">
              <StorefrontIcon sx={{ fontSize: 11, mr: 0.5, verticalAlign: 'middle' }} />
              Your reply
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
            }}>
              {review.seller_reply}
            </Typography>
          </Box>
        )}
      </TableCell>

      {/* Date */}
      <TableCell>
        <Typography variant="body2" color="text.secondary" noWrap>
          {formatDate(review.created_at)}
        </Typography>
      </TableCell>

      {/* Actions */}
      <TableCell>
        <Tooltip title={hasReply ? 'Edit reply' : 'Reply'}>
          <IconButton size="small" color="primary" onClick={() => onReply(review)}>
            <ReplyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => onDelete(review)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

// ─── Reply Dialog ─────────────────────────────────────────────────────────────
const ReplyDialog = ({ open, review, onClose, onSubmit, loading }) => {
  const [reply, setReply] = useState('');

  useEffect(() => {
    if (open) setReply(review?.seller_reply || '');
  }, [open, review]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{review?.seller_reply ? 'Edit your reply' : 'Reply to review'}</DialogTitle>
      <DialogContent>
        <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1, mb: 2 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={0.5}>
            <Avatar src={review?.user?.avatar} sx={{ width: 24, height: 24, fontSize: 11 }}>
              {review?.user?.name?.[0]}
            </Avatar>
            <Typography variant="body2" fontWeight={600}>{review?.user?.name}</Typography>
            <Rating value={review?.rating} readOnly size="small" sx={{ ml: 'auto' }} />
          </Stack>
          {review?.title && <Typography variant="body2" fontWeight={600}>{review.title}</Typography>}
          <Typography variant="body2" color="text.secondary">{review?.comment}</Typography>
        </Box>
        <TextField
          label="Your reply"
          multiline
          minRows={3}
          maxRows={7}
          fullWidth
          value={reply}
          onChange={e => setReply(e.target.value)}
          inputProps={{ maxLength: 1000 }}
          helperText={`${reply.length}/1000`}
          autoFocus
          sx={{
            '& .MuiOutlinedInput-root': {
              '&.Mui-focused fieldset': {
                borderColor: '#0FB9B1',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#0FB9B1',
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ color: 'text.secondary', '&:hover': { color: '#0FB9B1' } }}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={() => onSubmit(reply)} 
          disabled={loading || !reply.trim()}
          sx={{
            height: 38,
            px: 3,
            borderRadius: "8px",
            textTransform: "none",
            fontSize: 13,
            fontWeight: 600,
            background: "linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)",
            color: "#000",
            boxShadow: "none",
            "&:hover": {
              background: "linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)",
              opacity: 0.9,
              boxShadow: "none",
            },
            "&.Mui-disabled": {
              background: "#e0e0e0",
              color: "#9e9e9e"
            }
          }}
        >
          {loading ? 'Posting…' : review?.seller_reply ? 'Update reply' : 'Post reply'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ─── Delete Dialog ────────────────────────────────────────────────────────────
const DeleteDialog = ({ open, onClose, onConfirm, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>Delete review?</DialogTitle>
    <DialogContent>
      <DialogContentText>
        This review will be permanently removed from your product. This action cannot be undone.
      </DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} disabled={loading}>Cancel</Button>
      <Button variant="contained" color="error" onClick={onConfirm} disabled={loading}>
        {loading ? 'Deleting…' : 'Delete'}
      </Button>
    </DialogActions>
  </Dialog>
);

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, color = 'text.primary' }) => (
  <Card variant="outlined" sx={{ p: 2, minWidth: 120, flex: 1 }}>
    <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
    <Typography variant="h5" fontWeight={700} color={color}>{value ?? '—'}</Typography>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const SellerReviews = () => {
  const dispatch = useDispatch();
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [replyDialog, setReplyDialog] = useState({ open: false, review: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, review: null });
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    sellerService.getReviews({ page, limit: 15 }).then(({ data }) => {
      // Backend returns: { success, data: { data: [...], pagination: {...} } }
      const payload = data.data;
      const reviewList = Array.isArray(payload) ? payload : (payload?.data ?? []);
      const paginationData = payload?.pagination ?? {};
      setReviews(reviewList);
      setPagination(paginationData);
    }).catch(() => {
      dispatch(showToast({ message: 'Failed to load reviews.', severity: 'error' }));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page]);

  const openReply = (review) => setReplyDialog({ open: true, review });
  const closeReply = () => setReplyDialog({ open: false, review: null });

  const handleReplySubmit = async (reply) => {
    setActionLoading(true);
    try {
      await sellerService.replyToReview(replyDialog.review.id, reply);
      dispatch(showToast({ message: 'Reply posted.', severity: 'success' }));
      closeReply();
      load();
    } catch {
      dispatch(showToast({ message: 'Failed to post reply.', severity: 'error' }));
    } finally { setActionLoading(false); }
  };

  const openDelete = (review) => setDeleteDialog({ open: true, review });
  const closeDelete = () => setDeleteDialog({ open: false, review: null });

  const handleDeleteConfirm = async () => {
    setActionLoading(true);
    try {
      await sellerService.deleteReview(deleteDialog.review.id);
      dispatch(showToast({ message: 'Review deleted.', severity: 'success' }));
      closeDelete();
      load();
    } catch {
      dispatch(showToast({ message: 'Failed to delete review.', severity: 'error' }));
    } finally { setActionLoading(false); }
  };

  // ── Derived stats ──
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;
  const repliedCount = reviews.filter(r => r.seller_reply).length;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>Product Reviews</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage and respond to reviews on your products.
      </Typography>

      {/* Summary cards */}
      <Stack direction="row" gap={1.5} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <SummaryCard label="Avg. rating" value={avgRating ? `⭐ ${avgRating}` : '—'} />
        <SummaryCard label="Total Reviews" value={reviews.length} color="primary.main" />
        <SummaryCard label="Replied" value={repliedCount} color="success.main" />
      </Stack>

      <Card>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Customer', 'Product', 'Rating', 'Title', 'Comment', 'Date', 'Actions'].map(h => (
                  <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading
                ? Array(6).fill(0).map((_, i) => <SkeletonRow key={i} />)
                : reviews.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                        <Typography color="text.secondary">No reviews found.</Typography>
                      </TableCell>
                    </TableRow>
                  )
                  : reviews.map(r => (
                    <ReviewRow
                      key={r.id}
                      review={r}
                      onReply={openReply}
                      onDelete={openDelete}
                    />
                  ))
              }
            </TableBody>
          </Table>
        </TableContainer>

        {pagination.totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(_, v) => setPage(v)}
              color="primary"
            />
          </Box>
        )}
      </Card>

      <ReplyDialog
        open={replyDialog.open}
        review={replyDialog.review}
        onClose={closeReply}
        onSubmit={handleReplySubmit}
        loading={actionLoading}
      />
      <DeleteDialog
        open={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleDeleteConfirm}
        loading={actionLoading}
      />
    </Box>
  );
};

export default SellerReviews;