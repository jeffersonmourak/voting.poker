export const debugAnalytics = (funcName: string, args: unknown) => {
  // if (process.env.NEXT_PUBLIC_DISABLE_ANALYTICS_DEBUG === 'true') {
  //   return;
  // }
  console.log(`[ANALYTICS]: (${funcName})`, args);
};
