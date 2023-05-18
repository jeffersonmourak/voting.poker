/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    images: {
        domains: ['media3.giphy.com', 'media2.giphy.com', 'media1.giphy.com', 'media.giphy.com']
    }
};

module.exports = nextConfig;
