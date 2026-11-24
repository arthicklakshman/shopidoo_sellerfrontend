import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Button, IconButton, TextField, Autocomplete, Checkbox,
  Chip, CircularProgress, Stack, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import api from '../../services/api';

// Postal reference data never changes during a session, so each state/district
// lookup is fetched at most once and shared across every rule row.
const districtCache = new Map();
const pincodeCache = new Map();

const fetchDistricts = (state) => {
  const key = String(state || '').trim();
  if (!key) return Promise.resolve([]);
  if (!districtCache.has(key)) {
    districtCache.set(
      key,
      api
        .get('/pincodes/districts', { params: { state: key } })
        .then((res) => (Array.isArray(res.data?.data) ? res.data.data : []))
        .catch((err) => {
          districtCache.delete(key);
          throw err;
        })
    );
  }
  return districtCache.get(key);
};

const fetchPincodes = (state, district) => {
  const stateKey = String(state || '').trim();
  const districtKey = String(district || '').trim();
  if (!stateKey || !districtKey) return Promise.resolve([]);
  const key = `${stateKey}||${districtKey}`;
  if (!pincodeCache.has(key)) {
    pincodeCache.set(
      key,
      api
        .get('/pincodes/by-district', { params: { state: stateKey, district: districtKey } })
        .then((res) => (Array.isArray(res.data?.data) ? res.data.data : []))
        .catch((err) => {
          pincodeCache.delete(key);
          throw err;
        })
    );
  }
  return pincodeCache.get(key);
};

export const emptyPincodeGroup = () => ({ district: '', pincodes: [], delivery_charge: '' });

// Mirrors secondaryButtonStyle in ProductForm so the Add buttons share one look.
// Kept local rather than imported, to avoid a circular import back into ProductForm.
const secondaryButtonStyle = {
  borderColor: '#0FB9B1',
  color: '#0FB9B1',
  fontWeight: 600,
  '&:hover': {
    borderColor: '#0B8457',
    color: '#0B8457',
    backgroundColor: 'rgba(15, 185, 177, 0.08)',
  },
};

const uncheckedIcon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

// Tags are capped manually rather than via Autocomplete's limitTags, which only
// collapses while the field is unfocused and so lets the row grow very tall once
// a seller selects a whole district. The remainder sits behind a "view all" dialog.
const MAX_VISIBLE_TAGS = 3;

/** One district + its selected pincodes + the charge that applies to them. */
function PincodeGroupRow({ state, group, districts, districtsLoading, usedDistricts, onChange, onRemove }) {
  const [pincodeOptions, setPincodeOptions] = useState([]);
  const [loadingPincodes, setLoadingPincodes] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [viewAllOpen, setViewAllOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!group.district) {
      setPincodeOptions([]);
      setPincodeError('');
      return () => { cancelled = true; };
    }
    setLoadingPincodes(true);
    setPincodeError('');
    fetchPincodes(state, group.district)
      .then((rows) => {
        if (cancelled) return;
        setPincodeOptions(rows.map((row) => row.pincode));
      })
      .catch(() => {
        if (!cancelled) setPincodeError('Could not load pincodes. Please retry.');
      })
      .finally(() => {
        if (!cancelled) setLoadingPincodes(false);
      });
    return () => { cancelled = true; };
  }, [state, group.district]);

  const selectedPincodes = Array.isArray(group.pincodes) ? group.pincodes : [];

  // Keep already-saved pincodes selectable even before the district list resolves.
  const options = useMemo(() => {
    const merged = new Set([...pincodeOptions, ...selectedPincodes]);
    return Array.from(merged).sort();
  }, [pincodeOptions, selectedPincodes]);

  const allSelected = options.length > 0 && selectedPincodes.length === options.length;

  return (
    <Box
      sx={{
        p: 1.5,
        mb: 1.5,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems="flex-start">
        <Autocomplete
          size="small"
          openOnFocus
          autoHighlight
          sx={{ width: { xs: '100%', md: 220 } }}
          options={districts}
          loading={districtsLoading}
          value={group.district || null}
          onChange={(_, newVal) => onChange({ ...group, district: newVal || '', pincodes: [] })}
          getOptionDisabled={(option) => usedDistricts.includes(option)}
          noOptionsText={districtsLoading ? 'Loading districts...' : 'No districts found'}
          ListboxProps={{ style: { maxHeight: 250 } }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="District"
              placeholder="Search district..."
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {districtsLoading ? <CircularProgress size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <Autocomplete
          multiple
          disableCloseOnSelect
          size="small"
          openOnFocus
          sx={{ flex: 1, minWidth: { xs: '100%', md: 260 } }}
          options={options}
          loading={loadingPincodes}
          disabled={!group.district}
          value={selectedPincodes}
          onChange={(_, newVal) => onChange({ ...group, pincodes: newVal })}
          ListboxProps={{ style: { maxHeight: 280 } }}
          noOptionsText={loadingPincodes ? 'Loading pincodes...' : 'No pincodes found'}
          renderOption={(props, option, { selected }) => {
            const { key, ...optionProps } = props;
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={uncheckedIcon}
                  checkedIcon={checkedIcon}
                  checked={selected}
                  size="small"
                  sx={{ mr: 1, p: 0.25 }}
                />
                {option}
              </li>
            );
          }}
          renderTags={(tagValue, getTagProps) => {
            const visible = tagValue.slice(0, MAX_VISIBLE_TAGS);
            const hiddenCount = tagValue.length - visible.length;
            return (
              <>
                {visible.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return <Chip key={key} size="small" label={option} {...tagProps} />;
                })}
                {hiddenCount > 0 && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`+${hiddenCount} more - view all`}
                    // Stop the click from reaching the Autocomplete, which would
                    // otherwise toggle the dropdown instead of opening the dialog.
                    onMouseDown={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      setViewAllOpen(true);
                    }}
                    sx={{
                      borderColor: '#0FB9B1',
                      color: '#0FB9B1',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(15, 185, 177, 0.08)' },
                    }}
                  />
                )}
              </>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Pincodes"
              placeholder={group.district ? 'Search pincode...' : 'Select a district first'}
              error={Boolean(pincodeError)}
              helperText={
                pincodeError ||
                (group.district && options.length
                  ? `${selectedPincodes.length} of ${options.length} selected`
                  : ' ')
              }
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingPincodes ? <CircularProgress size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <TextField
          size="small"
          type="number"
          label="Charge (Rs.)"
          sx={{ width: { xs: '100%', md: 130 } }}
          value={group.delivery_charge ?? ''}
          onChange={(e) => onChange({ ...group, delivery_charge: e.target.value })}
          inputProps={{ min: 0, step: 0.01 }}
          helperText=" "
        />

        <Stack direction="row" spacing={0.5} sx={{ pt: { md: 0.5 } }}>
          <Tooltip title={allSelected ? 'Clear all pincodes' : 'Select every pincode in this district'}>
            <span>
              <Button
                size="small"
                variant="text"
                disabled={!options.length}
                onClick={() => onChange({ ...group, pincodes: allSelected ? [] : options })}
              >
                {allSelected ? 'Clear' : 'All'}
              </Button>
            </span>
          </Tooltip>
          <IconButton size="small" color="error" onClick={onRemove}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Dialog open={viewAllOpen} onClose={() => setViewAllOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 0.5 }}>
          Selected pincodes{group.district ? ` - ${group.district}` : ''}
          <Typography variant="caption" color="text.secondary" display="block">
            {selectedPincodes.length} selected
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {selectedPincodes.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No pincodes selected yet.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {selectedPincodes.map((pincode) => (
                <Chip
                  key={pincode}
                  size="small"
                  label={pincode}
                  onDelete={() =>
                    onChange({
                      ...group,
                      pincodes: selectedPincodes.filter((p) => p !== pincode),
                    })
                  }
                />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            variant="outlined"
            sx={secondaryButtonStyle}
            onClick={() => setViewAllOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/**
 * Pincode-level overrides for a single state rule. Entirely optional: a state rule
 * with no groups keeps behaving exactly as a plain state-wise charge.
 */
export default function PincodeRulesEditor({ state, value, onChange }) {
  const groups = Array.isArray(value) ? value : [];
  const [districts, setDistricts] = useState([]);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [districtsError, setDistrictsError] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!state) {
      setDistricts([]);
      setDistrictsError('');
      return () => { cancelled = true; };
    }
    setDistrictsLoading(true);
    setDistrictsError('');
    fetchDistricts(state)
      .then((rows) => { if (!cancelled) setDistricts(rows); })
      .catch(() => { if (!cancelled) setDistrictsError('Could not load districts for this state.'); })
      .finally(() => { if (!cancelled) setDistrictsLoading(false); });
    return () => { cancelled = true; };
  }, [state]);

  const updateGroup = useCallback(
    (index, nextGroup) => onChange(groups.map((g, i) => (i === index ? nextGroup : g))),
    [groups, onChange]
  );

  const removeGroup = useCallback(
    (index) => onChange(groups.filter((_, i) => i !== index)),
    [groups, onChange]
  );

  if (!state) {
    return (
      <Typography variant="caption" color="text.secondary">
        Select a state above to add district / pincode specific charges.
      </Typography>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="body2" fontWeight={700}>
            Pincode-specific charges in {state}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Optional. A matching pincode overrides the {state} state charge.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon />}
          sx={secondaryButtonStyle}
          onClick={() => onChange([...groups, emptyPincodeGroup()])}
        >
          Add District / Pincodes
        </Button>
      </Box>

      {districtsError && (
        <Typography variant="caption" color="error.main" sx={{ display: 'block', mb: 1 }}>
          {districtsError}
        </Typography>
      )}

      {groups.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          No pincode overrides yet. The {state} charge applies across the whole state.
        </Typography>
      ) : (
        groups.map((group, index) => (
          <PincodeGroupRow
            key={index}
            state={state}
            group={group}
            districts={districts}
            districtsLoading={districtsLoading}
            usedDistricts={groups
              .filter((g, i) => i !== index && g.district)
              .map((g) => g.district)}
            onChange={(next) => updateGroup(index, next)}
            onRemove={() => removeGroup(index)}
          />
        ))
      )}
    </Box>
  );
}
