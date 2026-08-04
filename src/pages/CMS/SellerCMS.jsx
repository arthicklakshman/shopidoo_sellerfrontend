import { useState, useEffect, useRef } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Tooltip,
  MenuItem,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ImageIcon from "@mui/icons-material/Image";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LockIcon from "@mui/icons-material/Lock"; // NEW: For the disabled state

import { sellerService } from "../../services/seller.service";
import { validateImage, IMAGE_RULES } from "../../utils/imageValidator";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
const STATIC_BASE = API_URL.replace(/\/api.*$/, "").replace(/\/+$/, "");

const BTN_STYLE = {
  height: 38,
  px: 2,
  borderRadius: "8px",
  textTransform: "none",
  fontSize: 13,
  fontWeight: 600,
  background: "linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)",
  color: "#000",
  boxShadow: "none",
  whiteSpace: "nowrap",
  "&:hover": {
    background: "linear-gradient(90deg, #0FB9B1 12%, #0B8457 88%)",
    opacity: 0.9,
    boxShadow: "none",
  },
};

const LOCATION_OPTIONS = ["brand_store", "store_top", "top_of_second_image"];

const LOCATION_LABELS = {
  brand_store: "Brand Store Background (1500x280)",
  store_top: "Above Products (1200x400)",
  top_of_second_image: "Below Products (1200x400)"
};

const BannerPreviewImage = ({ src, alt }) => {
  const [imgError, setImgError] = useState(false);

  if (!src || imgError) {
    return (
      <Box
        sx={{
          height: 200,
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <ImageIcon sx={{ fontSize: 48, color: "text.secondary" }} />
        <Typography color="text.secondary" variant="body2">No image available</Typography>
      </Box>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{ width: "100%", maxHeight: 320, objectFit: "cover", display: "block" }}
      onError={() => setImgError(true)}
    />
  );
};

const SellerCMS = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [bannerError, setBannerError] = useState("");

  const [open, setOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState({ title: "", location: "", category: "", status: "active" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBanner, setPreviewBanner] = useState(null);

  const formatBytes = (bytes) => {
    if (!bytes) return "0 KB";
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1).replace('.0', '')} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  // Maps UI selection to Validator Keys
  const getBannerRuleKey = (loc) => {
    switch (loc) {
      case "brand_store": return "brandStore_bg_banner";
      case "store_top": return "brandStore_top_banner";
      case "top_of_second_image": return "brandStore_bottom_banner";
      default: return null; // Return null if no location is selected
    }
  };

  const currentRuleKey = getBannerRuleKey(form.location);
  const bannerRules = currentRuleKey ? IMAGE_RULES[currentRuleKey] : null;

  const getImageUrl = (imagePath) => {
    if (typeof imagePath !== "string" || !imagePath.trim()) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }
    const cleaned = imagePath
      .replace(/\\/g, "/")
      .replace(/\/+/g, "/")
      .replace(/^\//, "");
    return `${STATIC_BASE}/${cleaned}`;
  };

  const extractArray = (res) => {
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    return [];
  };

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await sellerService.getBanners();
      const list = extractArray(res);
      setBanners(list);
    } catch (err) {
      console.error("Load banners error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openAdd = () => {
    setEditingBanner(null);
    setForm({ title: "", location: "", category: "", status: "active" });
    setSelectedFile(null);
    setPreviewUrl("");
    setSaveError("");
    setBannerError("");
    setOpen(true);
  };

  const openEdit = (banner) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      location: banner.location || "",
      category: banner.category || "",
      status: banner.status || "active",
    });
    const imageUrl = getImageUrl(banner.image);
    setPreviewUrl(imageUrl);
    setSelectedFile(null);
    setSaveError("");
    setBannerError("");
    setOpen(true);
  };

  // Clear the image if the user changes the location to prevent ratio mismatches
  const handleLocationChange = (e) => {
    setForm({ ...form, location: e.target.value });
    setSelectedFile(null);
    if (!editingBanner) setPreviewUrl("");
    setBannerError("");
  };

  const handleBannerFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!currentRuleKey) {
      setBannerError("Please select a location first so we know what size to validate against.");
      e.target.value = "";
      return;
    }

    try {
      const validFile = await validateImage(file, currentRuleKey);
      setSelectedFile(validFile);
      setPreviewUrl(URL.createObjectURL(validFile));
      setBannerError(""); 
    } catch (errorMessage) {
      setBannerError(errorMessage); 
      e.target.value = ""; 
    }
  };

  const handleSave = async () => {
    setSaveError("");
    setBannerError("");
    
    if (!form.title.trim()) { setSaveError("Title is required."); return; }
    if (!form.location.trim()) { setSaveError("Location is required."); return; }
    if (!editingBanner && !selectedFile) { setSaveError("Please upload a banner image."); return; }

    if (!editingBanner || editingBanner.location !== form.location) {
      if (form.location === "store_top" || form.location === "top_of_second_image") {
        const locationBanners = banners.filter((b) => b.location === form.location);
        if (locationBanners.length >= 5) {
          setSaveError("You can only upload up to 5 banners for this location.");
          return;
        }
      }
    }

    try {
      if (form.location === "brand_store") {
        const existingBanners = banners.filter((b) => b.location === "brand_store" && b.id !== editingBanner?.id);
        for (const oldBanner of existingBanners) {
          await sellerService.deleteBanner(oldBanner.id);
        }
      }

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("location", form.location.trim());
      formData.append("category", form.category.trim());
      formData.append("status", form.status || "active");
      if (selectedFile) formData.append("image", selectedFile);

      if (editingBanner) {
        await sellerService.updateBanner(editingBanner.id, formData);
      } else {
        formData.append("clicks", 0);
        await sellerService.createBanner(formData);
      }

      setOpen(false);
      loadBanners();
    } catch (err) {
      console.error("Save error:", err);
      setSaveError("Failed to save banner. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await sellerService.deleteBanner(id);
      loadBanners();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const activeBanners = banners.filter((b) => b.status === "active").length;

  return (
    <Box p={3} sx={{ bgcolor: "background.default", minHeight: "100vh" }}>

      <Typography variant="h4" fontWeight={700} color="text.primary">
        CMS Management
      </Typography>
      <Typography color="text.secondary" mb={3}>
        Create and manage promotional banners for your store
      </Typography>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 3, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">Total Banners</Typography>
            <Typography variant="h5" fontWeight={700} color="text.primary">{banners.length}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ p: 3, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">Active Banners</Typography>
            <Typography variant="h5" fontWeight={700} color="text.primary">{activeBanners}</Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ p: 3, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={700} color="text.primary">Promotional Banners</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={BTN_STYLE}>
            Add Banner
          </Button>
        </Box>

        {loading ? (
          <Typography color="text.secondary" textAlign="center" py={4}>Loading banners...</Typography>
        ) : banners.length === 0 ? (
          <Box textAlign="center" py={6}>
            <ImageIcon sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
            <Typography color="text.secondary">No banners yet. Add your first banner!</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openAdd} sx={{ ...BTN_STYLE, mt: 2 }}>
              Add Banner
            </Button>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Preview</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: "text.secondary" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {banners.map((b) => (
                <TableRow
                  key={b.id}
                  sx={{ 
                    "&:hover": { bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(15, 185, 177, 0.08)' : '#f9fffe' }, 
                    "& td": { fontSize: "0.85rem" } 
                  }}
                >
                  <TableCell>
                    <Avatar
                      src={getImageUrl(b.image)}
                      variant="rounded"
                      sx={{ width: 52, height: 36, borderRadius: 1, border: "1px solid", borderColor: "divider" }}
                    >
                      <ImageIcon fontSize="small" />
                    </Avatar>
                  </TableCell>
                  <TableCell>{b.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={b?.location ? (LOCATION_LABELS[b.location] || b.location) : "—"}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={b.status || "inactive"}
                      size="small"
                      color={b.status === "active" ? "success" : "default"}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title="Preview">
                      <IconButton
                        onClick={() => {
                          setPreviewBanner(b);
                          setPreviewOpen(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton onClick={() => openEdit(b)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDelete(b.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* ── Add / Edit Dialog ── */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          {editingBanner ? "Edit Banner" : "Add New Banner"}
        </DialogTitle>

        <DialogContent>
          {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

          <TextField
            fullWidth label="Banner Title" margin="dense" size="small"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <TextField
            fullWidth label="Location" margin="dense"
            select
            value={form.location || ""}
            onChange={handleLocationChange}
          >
            <MenuItem value="" disabled>Select Location</MenuItem>
            {LOCATION_OPTIONS.map((loc) => (
              <MenuItem key={loc} value={loc}>{LOCATION_LABELS[loc]}</MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth label="Category" margin="dense"
            placeholder="Example: mobile, bottle, laptop"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <TextField
            fullWidth
            select
            label="Status"
            margin="dense"
            value={form.status || "active"}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Banner Image {editingBanner ? "(leave empty to keep current)" : "*"}
            </Typography>
            
            <input
              type="file" accept="image/*" hidden ref={fileInputRef}
              onChange={handleBannerFileChange}
              disabled={!form.location} // Disabled if no location is selected
            />

            <Box
              onClick={() => {
                if (!form.location) {
                  setBannerError("Please select a Location from the dropdown above before uploading an image.");
                  return;
                }
                fileInputRef.current.click();
              }}
              sx={{
                width: "100%", height: 150,
                border: "2px dashed", 
                borderColor: bannerError ? "error.main" : "divider",
                borderRadius: 2,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: form.location ? "pointer" : "not-allowed", 
                overflow: "hidden", 
                bgcolor: form.location ? "action.hover" : "action.disabledBackground",
                transition: "border-color 0.2s",
                "&:hover": { borderColor: bannerError ? "error.main" : (form.location ? "primary.main" : "divider") },
              }}
            >
              {!form.location && !previewUrl ? (
                 <Stack alignItems="center" spacing={0.5}>
                   <LockIcon sx={{ color: "text.disabled", fontSize: 32 }} />
                   <Typography variant="caption" color="text.secondary">
                     Select a Location first
                   </Typography>
                 </Stack>
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <Stack alignItems="center" spacing={0.5}>
                  <ImageIcon sx={{ color: bannerError ? "error.main" : "#bbb", fontSize: 36 }} />
                  <Typography variant="caption" color={bannerError ? "error.main" : "text.secondary"}>
                    Click to upload image
                  </Typography>
                </Stack>
              )}
            </Box>

            {bannerRules && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                 <strong>Requirements:</strong> Min {bannerRules.minWidth}x{bannerRules.minHeight}px resolution, {bannerRules.minSize && bannerRules.minSize > 0 ? `${formatBytes(bannerRules.minSize)} - ${formatBytes(bannerRules.maxSize)}` : `Max ${formatBytes(bannerRules.maxSize)}`} file size.
              </Typography>
            )}

            {bannerError && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5, fontWeight: 600 }}>
                 {bannerError}
              </Typography>
            )}

            {previewUrl && form.location && (
              <Button
                size="small"
                onClick={() => { setPreviewUrl(""); setSelectedFile(null); setBannerError(""); }}
                sx={{ mt: 0.5, color: "error.main", textTransform: "none", fontSize: "0.75rem" }}
              >
                Remove image
              </Button>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} sx={{textTransform: "none", color: "#000", fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={BTN_STYLE}>
            {editingBanner ? "Update Banner" : "Create Banner"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Preview Dialog ── */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Banner Preview — {previewBanner?.title}
        </DialogTitle>
        <DialogContent>
          {previewBanner && (
            <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
              <BannerPreviewImage
                src={getImageUrl(previewBanner.image)}
                alt={previewBanner.title}
              />
              <Box sx={{ p: 2, bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(15, 185, 177, 0.08)' : '#fafffe' }}>
                <Stack direction="row" spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Location</Typography>
                    <Typography variant="body2" fontWeight={600}>{previewBanner?.location ? (LOCATION_LABELS[previewBanner.location] || previewBanner.location) : "—"}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Typography variant="body2" fontWeight={600}>{previewBanner.status}</Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)} sx={{ textTransform: "none" }}>Close</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default SellerCMS;




