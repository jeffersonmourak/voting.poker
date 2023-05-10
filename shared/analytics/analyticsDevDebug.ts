export const debugAnalytics = (funcName: string, args: any) => {
  if (process.env.NEXT_PUBLIC_DISABLE_ANALYTICS_DEBUG === 'true') {
    return;
  }
  console.log(`[ANALYTICS]: (${funcName})`, args);
};
