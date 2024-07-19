import { CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import theme from '@voting.poker/next/theme';
import type { Metadata, Viewport } from 'next';
import dynamic from 'next/dynamic';
import localFont from 'next/font/local';
import './globals.css';

export const metadata: Metadata = {
  title: 'Voting Poker',
}

export const viewport: Viewport = {
  themeColor: 'black',
  initialScale: 1,
  width: 'device-width',
}

const MontFont = localFont({
  src: [
    {
      path: '../../public/fonts/Mont/MontBlack_normal_normal.woff2',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Mont/MontSemiBold_normal_normal.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Mont/MontRegular_normal_normal.woff2',
      weight: '500',
      style: 'normal',
    }
  ],
  display: 'swap',
  variable: '--mont',
})

const DataConsentDynamicProvider = dynamic(() => import('@voting.poker/next/components/AnalyticsProvider'), { ssr: false })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" >
      <body className={MontFont.variable}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <DataConsentDynamicProvider>
              <CssBaseline />
              {children}
            </DataConsentDynamicProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html >

  )
}
