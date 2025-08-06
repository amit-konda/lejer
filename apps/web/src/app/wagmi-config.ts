import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { polygonMumbai } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Ledgerbound',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [polygonMumbai],
  ssr: true,
})

export const chains = [polygonMumbai] 