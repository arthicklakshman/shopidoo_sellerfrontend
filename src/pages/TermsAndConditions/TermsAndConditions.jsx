import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box, Typography, Button, CircularProgress, Paper, Chip, Divider,
  InputBase, Tooltip, Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchSettingsOnce } from '../../utils/settingsCache';
import api from '../../services/api';

// Icons
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import SearchIcon from '@mui/icons-material/Search';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function TermsAndConditions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [settings, setSettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('');

  useEffect(() => {
    fetchSettingsOnce()
      .then((data) => {
        setSettings(data);
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      window.close();
    }
  };

  const platformName = settings?.platformName || 'Shopidoo';
  const supportEmail = settings?.supportEmail || 'support@shopidoo.in';
  const supportPhone = settings?.supportPhone || '+91 1800-123-4567';
  const rawTermsContent = settings?.sellerTermsContent || '';

  const cleanTermsContent = useMemo(() => {
    if (!rawTermsContent) return '';
    return rawTermsContent
      .replace(/\u00A0/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;nbsp;/gi, ' ');
  }, [rawTermsContent]);

  const isHtml = Boolean(cleanTermsContent && /<[a-z][\s\S]*>/i.test(cleanTermsContent));

  const decodeHtmlEntities = (str) => {
    if (!str) return '';
    return str
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Extract Table of Contents sections
  const { sections, processedHtml } = useMemo(() => {
    if (!cleanTermsContent) return { sections: [], processedHtml: '' };

    if (isHtml) {
      const extracted = [];
      let secIndex = 0;

      // Ensure paragraphs that look like bold numbered titles are converted to h2
      let htmlWithHeadings = cleanTermsContent
        .replace(/<p><strong>(\d+[\.\)]\s+[^<]+)<\/strong><\/p>/gi, '<h2>$1</h2>')
        .replace(/<p><strong>(Clause\s+\d+[^<]*)<\/strong><\/p>/gi, '<h2>$1</h2>');

      // Inject clean IDs into all headings for smooth scrolling
      const modifiedHtml = htmlWithHeadings.replace(/<h([1-3])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
        secIndex++;
        const id = `section-${secIndex}`;
        const cleanTitle = decodeHtmlEntities(text.replace(/<[^>]+>/g, ''));
        extracted.push({
          id,
          index: secIndex,
          title: cleanTitle || `Clause ${secIndex}`,
          rawText: cleanTitle,
        });

        // Strip existing id/class to prevent conflicts
        const cleanAttrs = attrs
          .replace(/\sid="[^"]*"/gi, '')
          .replace(/\sclass="[^"]*"/gi, '');

        return `<h${level}${cleanAttrs} id="${id}" class="clause-heading" style="scroll-margin-top: 100px;">${text}</h${level}>`;
      });

      return { sections: extracted, processedHtml: modifiedHtml };
    } else {
      // Fallback markdown parser
      const rawSections = cleanTermsContent.split(/(?=^##\s)/m);
      const parsed = rawSections.map((sectionStr, index) => {
        const trimmed = sectionStr.trim();
        const lines = trimmed.split('\n');
        const headingLine = lines[0] || '';
        const heading = decodeHtmlEntities(headingLine.replace(/^#+\s*/, '').replace(/\*\*/g, ''));
        const id = `section-${index + 1}`;
        const bodyLines = lines.slice(1);

        return {
          id,
          index: index + 1,
          title: heading || `Clause ${index + 1}`,
          rawText: bodyLines.join('\n'),
          lines: bodyLines,
        };
      });

      return { sections: parsed, processedHtml: '' };
    }
  }, [cleanTermsContent, isHtml]);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections.filter(
      (s) => s.title.toLowerCase().includes(q) || s.rawText.toLowerCase().includes(q)
    );
  }, [sections, searchQuery]);

  const scrollToSection = (id) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setDownloadingPdf(true);
      const res = await api.get('/settings/terms-pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${platformName.replace(/\s+/g, '_')}_Seller_Terms_and_Conditions.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download terms PDF:', err);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          backgroundColor: '#f8fafc',
        }}
      >
        <CircularProgress size={42} thickness={4} sx={{ color: '#0B8457' }} />
        <Typography fontSize={14} color="text.secondary" fontWeight={600}>
          Loading Seller Agreement & Operating Policies...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        color: '#1e293b',
        '@media print': {
          backgroundColor: '#ffffff',
          '& .no-print': { display: 'none !important' },
          '& .print-canvas': { padding: '0 !important', margin: '0 !important' }
        }
      }}
    >
      {/* ── 1. Top Navbar ── */}
      <Paper
        elevation={0}
        className="no-print"
        sx={{
          py: 1.5,
          px: { xs: 2, md: 4 },
          borderBottom: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          position: 'sticky',
          top: 0,
          zIndex: 30,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{
              color: '#334155',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '13.5px',
              borderRadius: '8px',
              px: 1.5,
              py: 0.7,
              backgroundColor: '#f1f5f9',
              '&:hover': { backgroundColor: '#e2e8f0', color: '#0f172a' },
            }}
          >
            Back
          </Button>

          <Box sx={{ height: 26, width: '1px', bgcolor: '#cbd5e1', display: { xs: 'none', sm: 'block' } }} />

          <Box>
            <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '17px', lineHeight: 1.2 }}>
                Terms & Conditions
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontSize: '12px', fontWeight: 500 }}>
              {platformName} Seller Terms & Conditions
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* ── Main Split View: Sticky Table of Contents + Legal Agreement ── */}
      <Box sx={{ maxWidth: '1280px', width: '100%', mx: 'auto', p: { xs: 2, md: 4 }, flex: 1 }}>
        <Grid container spacing={3.5}>
          {/* Left Column: Sticky Table of Contents */}
          <Grid item xs={12} md={4} lg={3.5} className="no-print" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                position: { md: 'sticky' },
                top: 85,
                maxHeight: { md: 'calc(100vh - 110px)' },
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  p: 2,
                  bgcolor: '#ffffff',
                  boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.02)',
                }}
              >
                <Typography fontWeight={800} fontSize={14} color="#0f172a" mb={1.5}>
                  Table of Contents
                </Typography>

                {/* Search in Agreement */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: '#f1f5f9',
                    borderRadius: '8px',
                    px: 1.5,
                    py: 0.5,
                    mb: 2,
                  }}
                >
                  <SearchIcon sx={{ color: '#94a3b8', fontSize: 18, mr: 1 }} />
                  <InputBase
                    placeholder="Search clause..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ fontSize: '13px', width: '100%' }}
                  />
                  {searchQuery && (
                    <Typography
                      onClick={() => setSearchQuery('')}
                      sx={{ fontSize: '11px', color: '#64748b', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Clear
                    </Typography>
                  )}
                </Box>

                {/* Navigation Links */}
                <Box sx={{ maxHeight: '380px', overflowY: 'auto', pr: 0.5 }}>
                  {filteredSections.map((sec) => (
                    <Box
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      sx={{
                        py: 1,
                        px: 1.5,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        mb: 0.5,
                        transition: 'all 0.15s ease',
                        bgcolor: activeSectionId === sec.id ? '#e0f7f6' : 'transparent',
                        color: activeSectionId === sec.id ? '#0B8457' : '#334155',
                        '&:hover': {
                          bgcolor: activeSectionId === sec.id ? '#e0f7f6' : '#f8fafc',
                          color: '#0B8457',
                        },
                      }}
                    >
                      <Typography fontSize={13} fontWeight={activeSectionId === sec.id ? 700 : 500} noWrap>
                        {sec.title}
                      </Typography>
                    </Box>
                  ))}

                  {filteredSections.length === 0 && (
                    <Typography fontSize={12} color="#94a3b8" textAlign="center" py={2}>
                      No matching clauses found.
                    </Typography>
                  )}
                </Box>
              </Paper>

              {/* Support & Contact Card */}
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  p: 2,
                  bgcolor: '#ffffff',
                }}
              >
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <HelpOutlineIcon sx={{ color: '#0B8457', fontSize: 18 }} />
                  <Typography fontWeight={700} fontSize={13} color="#0f172a">
                    Need Legal Clarification?
                  </Typography>
                </Box>
                <Typography fontSize={12} color="#64748b" lineHeight={1.5}>
                  Contact our merchant compliance desk for onboarding or policy inquiries:
                </Typography>
                <Typography fontSize={12.5} fontWeight={700} color="#0B8457" mt={1}>
                  {supportEmail}
                </Typography>
                <Typography fontSize={12} color="#475569">
                  {supportPhone}
                </Typography>
              </Paper>
            </Box>
          </Grid>

          {/* Right Column: Structured Agreement Content */}
          <Grid item xs={12} md={8} lg={8.5} sx={{ minWidth: 0 }}>
            <Paper
              elevation={0}
              className="print-canvas"
              sx={{
                p: { xs: 2.5, sm: 4, md: 5 },
                borderRadius: '14px',
                border: '1px solid #cbd5e1',
                bgcolor: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                minWidth: 0,
                maxWidth: '100%',
                overflow: 'hidden',
                boxSizing: 'border-box',
              }}
            >
              {/* Document Header inside paper */}
              <Box pb={2.5} mb={3} borderBottom="2px solid #0B8457">
                <Typography variant="h5" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">
                  Terms & Conditions
                </Typography>
                <Typography fontSize={13} color="#64748b" mt={0.5}>
                  {platformName} Seller Terms & Conditions
                </Typography>
              </Box>

              {/* Render HTML or Markdown */}
              {isHtml ? (
                <Box
                  dangerouslySetInnerHTML={{ __html: processedHtml }}
                  sx={{
                    color: '#334155',
                    fontSize: '14.5px',
                    lineHeight: 1.8,
                    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    minWidth: 0,
                    maxWidth: '100%',
                    wordBreak: 'normal',
                    overflowWrap: 'normal',
                    hyphens: 'none',
                    textAlign: 'left',
                    '& *': {
                      maxWidth: '100%',
                      wordBreak: 'normal',
                      overflowWrap: 'normal',
                      hyphens: 'none',
                      boxSizing: 'border-box',
                    },
                    '& h1, & h2, & h3': {
                      color: '#0B8457',
                      fontWeight: 800,
                      marginTop: '28px',
                      marginBottom: '12px',
                      fontSize: '18px',
                      lineHeight: 1.4,
                    },
                    '& p': {
                      marginBottom: '14px',
                      color: '#334155',
                      lineHeight: 1.8,
                      textAlign: 'left',
                    },
                    '& ul, & ol': {
                      paddingLeft: '24px',
                      marginBottom: '16px',
                    },
                    '& li': {
                      marginBottom: '8px',
                      color: '#334155',
                      lineHeight: 1.8,
                      textAlign: 'left',
                    },
                    '& strong': {
                      color: '#0f172a',
                      fontWeight: 700,
                    },
                    '& hr': {
                      borderColor: '#e2e8f0',
                      margin: '24px 0',
                    }
                  }}
                />
              ) : (
                sections.map((section) => (
                  <Box key={section.id} id={section.id} sx={{ mb: 4, scrollMarginTop: '100px' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: '#0B8457',
                        fontSize: '17px',
                        mb: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        lineHeight: 1.4,
                      }}
                    >
                      <CheckCircleOutlineIcon sx={{ fontSize: 20, color: '#0B8457' }} />
                      {section.title}
                    </Typography>

                    <Box sx={{ pl: { xs: 0, sm: 3.5 } }}>
                      {section.lines.map((line, lIdx) => {
                        const trimmedLine = line.trim();
                        if (!trimmedLine) return <Box key={lIdx} sx={{ height: 8 }} />;

                        if (trimmedLine === '---' || trimmedLine === '***') {
                          return <Divider key={lIdx} sx={{ my: 2.5 }} />;
                        }

                        // Bullet point
                        if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ') || trimmedLine.startsWith('• ')) {
                          const bulletText = trimmedLine.replace(/^[\*\-•]\s*/, '');
                          const boldMatch = bulletText.match(/^\*\*(.*?)\*\*:?\s*(.*)$/);

                          return (
                            <Box key={lIdx} display="flex" alignItems="flex-start" gap={1.2} mb={1.2}>
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: '50%',
                                  bgcolor: '#0B8457',
                                  mt: 1,
                                  flexShrink: 0,
                                }}
                              />
                              <Typography fontSize={14} color="#334155" lineHeight={1.8} sx={{ wordBreak: 'normal', overflowWrap: 'normal', hyphens: 'none', textAlign: 'left' }}>
                                {boldMatch ? (
                                  <>
                                    <Box component="span" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                      {boldMatch[1]}:{' '}
                                    </Box>
                                    {boldMatch[2].replace(/\*\*/g, '')}
                                  </>
                                ) : (
                                  bulletText.replace(/\*\*/g, '')
                                )}
                              </Typography>
                            </Box>
                          );
                        }

                        // Paragraph
                        return (
                          <Typography key={lIdx} fontSize={14} color="#334155" lineHeight={1.8} mb={1.5} sx={{ wordBreak: 'normal', overflowWrap: 'normal', hyphens: 'none', textAlign: 'left' }}>
                            {trimmedLine.replace(/\*\*/g, '')}
                          </Typography>
                        );
                      })}
                    </Box>
                  </Box>
                ))
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}