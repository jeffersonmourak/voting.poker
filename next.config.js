/** @type {import('next').NextConfig} */
const withTM = require('next-transpile-modules')([
    '@mui/material',
    '@mui/system',
    '@mui/icons-material', // If @mui/icons-material is being used
]);

const nextConfig = withTM({
    reactStrictMode: true,
    webpack: (config) => {
        config.resolve.alias = {
            ...config.resolve.alias,
            '@mui/styled-engine': '@mui/styled-engine-sc',
        };
    },
});

module.exports = nextConfig;
