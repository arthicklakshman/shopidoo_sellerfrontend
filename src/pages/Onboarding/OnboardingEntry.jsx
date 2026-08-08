import React from 'react';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Grid,
    Button,
    Avatar,
} from '@mui/material';

import { useNavigate } from 'react-router-dom';

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import GradientButton from '../../components/shared/GradientButton/GradientButton';

import sellerHero from '../../assets/seller_hero.png';
import titlelogo from '../../assets/Shopidoo_logo.png';

const features = [
    { icon: <TrendingUpIcon />, title: 'Low Commission', desc: 'Keep more of what you earn' },
    { icon: <PeopleOutlineIcon />, title: 'High Visibility', desc: 'Reach millions of customers' },
    { icon: <FlashOnIcon />, title: 'Quick Setup', desc: 'Start selling in 24-48 hours' },
    { icon: <LocalMallOutlinedIcon />, title: 'Direct Sales', desc: 'Connect with buyers directly' },
];

const steps = [
    { num: 1, title: 'Basic Information', desc: 'Provide your personal details' },
    { num: 2, title: 'Business Details', desc: 'Tell us about your business' },
    { num: 3, title: 'Bank & Documents', desc: 'Secure payment setup' },
    { num: 4, title: 'Store Setup', desc: 'Customize your storefront' },
    { num: 5, title: 'Review & Submit', desc: 'Final verification' },
];

export default function OnboardingEntry() {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f4f6fb 0%, #fdf4fc 100%)',
                py: { xs: 6, md: 8 },
                fontFamily: 'sans-serif'
            }}
        >
            <Container maxWidth="lg">

                {/* HEADER */}
                <Box 
                    sx={{ 
                        textAlign: 'center', 
                        mb: { xs: 6, md: 8 },
                        cursor: 'pointer',
                        display: 'inline-block',
                        width: '100%',
                        '&:hover': { opacity: 0.85 }
                    }}
                    onClick={() => navigate('/login')}
                >
             
                    <Box 
                        component="img"
                        src={titlelogo}
                        alt="Shopidoo Logo"
                        sx={{
                            height: { xs: 40, md: 60 },
                            objectFit: 'contain'
                        }}
                    />

                    <Typography variant="subtitle1" sx={{ color: '#4b5563' }}>
                        Start Your Selling Journey Today
                    </Typography>
                </Box>

                <Grid container spacing={{ xs: 4, md: 8 }} alignItems="flex-start">

                    {/* LEFT SIDE */}
                    <Grid item xs={12} md={7}>
                        <Box
                            sx={{
                                width: '100%',
                                aspectRatio: '16/9',
                                borderRadius: '24px',
                                overflow: 'hidden',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                                mb: 5
                            }}
                        >
                            <img
                                src={sellerHero}
                                alt="Seller"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </Box>

                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
                            Why Sell on SHOPIDOO?
                        </Typography>

                        <Grid container spacing={2}>
                            {features.map((feature, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Card sx={{ borderRadius: '16px' }}>
                                        <CardContent>
                                            <Box sx={{ color: '#0FB9B1', mb: 2 }}> {/* Updated Icon Color */}
                                                {feature.icon}
                                            </Box>
                                            <Typography fontWeight={600}>
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body2">
                                                {feature.desc}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    {/* RIGHT SIDE */}
                    <Grid item xs={12} md={5}>
                        <Card sx={{ borderRadius: '24px', p: { xs: 3, sm: 5 } }}>

                            <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                Become a Seller
                            </Typography>

                            <Typography sx={{ mb: 4 }}>
                                Complete your registration in just 5 simple steps
                            </Typography>

                            {/* STEPS */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 5 }}>
                                {steps.map((step) => (
                                    <Box key={step.num} sx={{ display: 'flex', gap: 2 }}>
                                        {/* Updated Number Color to Brand Teal/Green */}
                                        <Avatar sx={{ bgcolor: '#e0f7f6', color: '#0B8457', fontWeight: 'bold' }}>
                                            {step.num}
                                        </Avatar>
                                        <Box>
                                            <Typography fontWeight={600}>
                                                {step.title}
                                            </Typography>
                                            <Typography variant="body2">
                                                {step.desc}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>

                            {/* BRANDED BUTTON */}
                            <GradientButton
                                fullWidth
                                onClick={() => navigate('/onboarding/1')}
                                endIcon={<ArrowRightAltIcon sx={{ color: '#000' }} />}
                            >
                                Start Registration
                            </GradientButton>

                            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <Button
                                    size="small"
                                    sx={{
                                        mt: 1,
                                        textTransform: 'none',
                                        color: '#0B8457' // Secondary link in brand green
                                    }}
                                    onClick={() => navigate('/login')}
                                >
                                    Already a seller? Login
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}