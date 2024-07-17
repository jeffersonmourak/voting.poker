import theme from '@/theme';
import { CssBaseline } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Voting Poker',
  viewport: {
    initialScale: 1,
    width: 'device-width',
  },
}

export const viewport: Viewport = {
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
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Mont/MontRegular_normal_normal.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Mont/MontBook_normal_normal.woff2',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Mont/MontThin_normal_normal.woff2',
      weight: '200',
      style: 'normal',
    }
  ],
  display: 'swap',
  variable: '--mont',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={MontFont.variable}>
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              {children}
            </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>

  )
}
