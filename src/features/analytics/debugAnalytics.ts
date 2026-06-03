export const debugAnalytics = (source: string, funcName: string, args: unknown) => {
  // if (process.env.NEXT_PUBLIC_DISABLE_ANALYTICS_DEBUG === 'true') {
  //   return;
  // }
  console.log(`[ANALYTICS]: (${source}) (${funcName})`, args);
};
