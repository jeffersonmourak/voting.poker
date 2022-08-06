import {event, identify, consent} from '../analytics';
export const useAnalytics = () => {
    return {
        event,
        identify,
        consent,
    };
};
